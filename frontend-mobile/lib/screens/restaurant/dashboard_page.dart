import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../services/socket_service.dart';

class RestaurantDashboardPage extends StatefulWidget {
  const RestaurantDashboardPage({super.key});

  @override
  State<RestaurantDashboardPage> createState() => _RestaurantDashboardPageState();
}

class _RestaurantDashboardPageState extends State<RestaurantDashboardPage> {
  late ApiService _api;
  late SocketService _socket;

  List<Map<String, dynamic>> _orders = [];
  List<Map<String, dynamic>> _menuItems = [];
  bool _ordersLoading = true;
  bool _menuLoading = true;

  String? _restaurantId;
  Timer? _pollTimer;

  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _api = context.read<ApiService>();
    _socket = SocketService();
    _socket.connect();

    _loadOrders();
    _loadMenu();

    _pollTimer = Timer.periodic(const Duration(seconds: 15), (_) => _loadOrders());

    _socket.onNewOrder((data) {
      if (mounted) {
        setState(() => _orders.insert(0, data));
        _showSnack('🔔 New order received!');
      }
    });

    _socket.onOrderStatusUpdate((data) {
      if (mounted) _refreshOrderById(data['order_id'], data['status']);
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _socket.dispose();
    super.dispose();
  }

  Future<void> _loadOrders() async {
    if (_restaurantId == null && _orders.isEmpty) {
      try {
        final raw = await _api.getUserOrders();
        if (!mounted) return;
        final list = raw.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        setState(() {
          _orders = list;
          _ordersLoading = false;
          if (list.isNotEmpty) {
            _restaurantId = list.first['restaurant_id'];
            _socket.joinRestaurantRoom(_restaurantId!);
          }
        });
      } catch (e) {
        if (mounted) setState(() => _ordersLoading = false);
      }
      return;
    }

    if (_restaurantId == null) {
      setState(() => _ordersLoading = false);
      return;
    }

    try {
      final raw = await _api.getRestaurantOrders(_restaurantId!);
      if (!mounted) return;
      setState(() {
        _orders = raw.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        _ordersLoading = false;
      });
    } catch (e) {
      if (mounted) setState(() => _ordersLoading = false);
    }
  }

  Future<void> _loadMenu() async {
    if (_restaurantId == null) {
      await Future.delayed(const Duration(seconds: 2));
      if (_restaurantId == null) {
        setState(() => _menuLoading = false);
        return;
      }
    }
    try {
      final raw = await _api.getRestaurantMenu(_restaurantId!);
      if (!mounted) return;
      setState(() {
        _menuItems = raw.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        _menuLoading = false;
      });
    } catch (e) {
      if (mounted) setState(() => _menuLoading = false);
    }
  }

  void _refreshOrderById(String orderId, String newStatus) {
    final idx = _orders.indexWhere((o) => o['id'] == orderId);
    if (idx >= 0) {
      setState(() => _orders[idx]['status'] = newStatus);
    }
  }

  Future<void> _updateStatus(String orderId, String status) async {
    try {
      await _api.updateOrderStatus(orderId, status);
      _refreshOrderById(orderId, status);
      _showSnack('Order marked as $status');
    } catch (e) {
      _showSnack('Error: ${e.toString()}', error: true);
    }
  }

  Future<void> _showMenuItemDialog({Map<String, dynamic>? existing}) async {
    final nameCtrl = TextEditingController(text: existing?['name'] ?? '');
    final priceCtrl = TextEditingController(text: existing != null ? existing['price'].toString() : '');
    final descCtrl = TextEditingController(text: existing?['description'] ?? '');
    final catCtrl = TextEditingController(text: existing?['category'] ?? '');
    bool isVeg = existing?['is_veg'] ?? true;
    bool isAvailable = existing?['is_available'] ?? true;

    await showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppTheme.surfaceDark,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Text(existing == null ? 'Add Menu Item' : 'Edit Menu Item', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildDialogField('Name *', nameCtrl),
                const SizedBox(height: 16),
                _buildDialogField('Price (₹) *', priceCtrl, keyboardType: TextInputType.number),
                const SizedBox(height: 16),
                _buildDialogField('Description', descCtrl),
                const SizedBox(height: 16),
                _buildDialogField('Category', catCtrl),
                const SizedBox(height: 24),
                Row(
                  children: [
                    const Text('Vegetarian', style: TextStyle(color: Colors.white)),
                    Switch(
                      value: isVeg,
                      activeColor: Colors.greenAccent,
                      onChanged: (v) => setDialogState(() => isVeg = v),
                    ),
                    const Spacer(),
                    const Text('Available', style: TextStyle(color: Colors.white)),
                    Switch(
                      value: isAvailable,
                      activeColor: AppTheme.primary,
                      onChanged: (v) => setDialogState(() => isAvailable = v),
                    ),
                  ],
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: AppTheme.textSecondary)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              onPressed: () async {
                if (nameCtrl.text.isEmpty || priceCtrl.text.isEmpty) {
                  _showSnack('Name and price are required', error: true);
                  return;
                }
                final price = double.tryParse(priceCtrl.text);
                if (price == null || price <= 0) {
                  _showSnack('Please enter a valid price greater than 0', error: true);
                  return;
                }
                final data = {
                  'name': nameCtrl.text.trim(),
                  'price': price,
                  'description': descCtrl.text.trim(),
                  'category': catCtrl.text.trim(),
                  'is_veg': isVeg,
                  'is_available': isAvailable,
                };
                Navigator.pop(ctx);
                if (existing == null) {
                  await _addMenuItem(data);
                } else {
                  await _editMenuItem(existing['id'], data);
                }
              },
              child: Text(existing == null ? 'Add' : 'Save', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDialogField(String label, TextEditingController controller, {TextInputType? keyboardType}) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: AppTheme.textSecondary),
        enabledBorder: OutlineInputBorder(borderSide: const BorderSide(color: AppTheme.borderDark), borderRadius: BorderRadius.circular(12)),
        focusedBorder: OutlineInputBorder(borderSide: const BorderSide(color: AppTheme.primary), borderRadius: BorderRadius.circular(12)),
        filled: true,
        fillColor: AppTheme.backgroundDark,
      ),
    );
  }

  Future<void> _addMenuItem(Map<String, dynamic> data) async {
    if (_restaurantId == null) return;
    try {
      final res = await _api.addMenuItem(_restaurantId!, data);
      setState(() => _menuItems.insert(0, Map<String, dynamic>.from(res['menu_item'])));
      _showSnack('Menu item added ✅');
    } catch (e) {
      _showSnack('Error: ${e.toString()}', error: true);
    }
  }

  Future<void> _editMenuItem(String itemId, Map<String, dynamic> data) async {
    if (_restaurantId == null) return;
    try {
      final res = await _api.updateMenuItem(_restaurantId!, itemId, data);
      final updated = Map<String, dynamic>.from(res['menu_item']);
      setState(() {
        final idx = _menuItems.indexWhere((i) => i['id'] == itemId);
        if (idx >= 0) _menuItems[idx] = updated;
      });
      _showSnack('Menu item updated ✅');
    } catch (e) {
      _showSnack('Error: ${e.toString()}', error: true);
    }
  }

  Future<void> _deleteMenuItem(String itemId, String name) async {
    if (_restaurantId == null) return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppTheme.surfaceDark,
        title: const Text('Delete Item', style: TextStyle(color: Colors.white)),
        content: Text('Remove "$name" from the menu?', style: const TextStyle(color: AppTheme.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete', style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    try {
      await _api.deleteMenuItem(_restaurantId!, itemId);
      setState(() => _menuItems.removeWhere((i) => i['id'] == itemId));
      _showSnack('Menu item deleted');
    } catch (e) {
      _showSnack('Error: ${e.toString()}', error: true);
    }
  }

  void _showSnack(String msg, {bool error = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg, style: const TextStyle(color: Colors.white)),
      backgroundColor: error ? Colors.redAccent : Colors.greenAccent.withValues(alpha: 0.8),
    ));
  }

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending': return Colors.orangeAccent;
      case 'confirmed': return Colors.blueAccent;
      case 'preparing': return Colors.indigoAccent;
      case 'ready': return Colors.tealAccent;
      case 'on_the_way': return Colors.purpleAccent;
      case 'delivered': return Colors.greenAccent;
      case 'cancelled': return Colors.redAccent;
      default: return Colors.grey;
    }
  }

  List<String> _nextStatuses(String current) {
    const Map<String, List<String>> flow = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready'],
      'ready': <String>[],
      'on_the_way': <String>[],
      'delivered': <String>[],
      'cancelled': <String>[],
    };
    return flow[current.toLowerCase()] ?? [];
  }

  @override
  Widget build(BuildContext context) {
    final pendingCount = _orders.where((o) => o['status'] == 'pending').length;
    
    final pages = [
      _buildOrdersTab(),
      _buildMenuTab(),
    ];

    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        backgroundColor: AppTheme.surfaceDark,
        foregroundColor: Colors.white,
        title: const Text('🍽️ Restaurant Hub', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              _loadOrders();
              _loadMenu();
            },
          ),
          Consumer<AuthProvider>(
            builder: (_, auth, __) => PopupMenuButton<String>(
              color: AppTheme.surfaceDark,
              onSelected: (v) {
                if (v == 'logout') {
                  auth.logout();
                  context.go('/login');
                }
              },
              itemBuilder: (_) => [
                const PopupMenuItem(value: 'logout', child: Text('Logout', style: TextStyle(color: Colors.white))),
              ],
            ),
          ),
        ],
      ),
      body: AnimatedSwitcher(duration: 300.ms, child: pages[_selectedIndex]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) => setState(() => _selectedIndex = index),
        backgroundColor: AppTheme.surfaceDark,
        indicatorColor: AppTheme.primary.withValues(alpha: 0.2),
        destinations: [
          NavigationDestination(
            icon: Badge(isLabelVisible: pendingCount > 0, label: Text('$pendingCount'), child: const Icon(Icons.receipt_long_outlined)),
            selectedIcon: Badge(isLabelVisible: pendingCount > 0, label: Text('$pendingCount'), child: const Icon(Icons.receipt_long, color: AppTheme.primary)),
            label: 'Orders',
          ),
          const NavigationDestination(
            icon: Icon(Icons.restaurant_menu_outlined),
            selectedIcon: Icon(Icons.restaurant_menu, color: AppTheme.primary),
            label: 'Menu',
          ),
        ],
      ),
    );
  }

  Widget _buildOrdersTab() {
    if (_ordersLoading) return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
    if (_orders.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.inbox_outlined, size: 64, color: AppTheme.textSecondary),
            const SizedBox(height: 16),
            const Text('No orders yet', style: TextStyle(color: AppTheme.textSecondary, fontSize: 16)),
          ],
        ),
      ).animate().fadeIn();
    }

    return RefreshIndicator(
      onRefresh: _loadOrders,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _orders.length,
        itemBuilder: (_, i) => _OrderCard(
          order: _orders[i],
          statusColor: _statusColor(_orders[i]['status'] ?? ''),
          nextStatuses: _nextStatuses(_orders[i]['status'] ?? ''),
          onUpdateStatus: (s) => _updateStatus(_orders[i]['id'], s),
        ).animate().fadeIn(delay: Duration(milliseconds: 100 * i)),
      ),
    );
  }

  Widget _buildMenuTab() {
    if (_menuLoading) return const Center(child: CircularProgressIndicator(color: AppTheme.primary));

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${_menuItems.length} item${_menuItems.length == 1 ? '' : 's'}',
                style: const TextStyle(fontSize: 16, color: AppTheme.textSecondary),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12)),
                icon: const Icon(Icons.add),
                label: const Text('Add Item', style: TextStyle(fontWeight: FontWeight.bold)),
                onPressed: () => _showMenuItemDialog(),
              ).animate().scale(),
            ],
          ),
        ),
        Expanded(
          child: _menuItems.isEmpty
              ? const Center(child: Text('No menu items yet. Add one!', style: TextStyle(color: AppTheme.textSecondary)))
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _menuItems.length,
                  itemBuilder: (_, i) {
                    final item = _menuItems[i];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceDark,
                        border: Border.all(color: AppTheme.borderDark),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(16),
                        leading: CircleAvatar(
                          backgroundColor: item['is_veg'] == true ? Colors.greenAccent.withValues(alpha: 0.2) : Colors.redAccent.withValues(alpha: 0.2),
                          radius: 24,
                          child: Icon(
                            item['is_veg'] == true ? Icons.eco : Icons.lunch_dining,
                            color: item['is_veg'] == true ? Colors.greenAccent : Colors.redAccent,
                          ),
                        ),
                        title: Text(item['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 18)),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 8),
                            Text(item['description'] ?? '', style: const TextStyle(color: AppTheme.textSecondary)),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppTheme.backgroundDark,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(item['category'] ?? 'Other', style: const TextStyle(color: Colors.white, fontSize: 12)),
                                ),
                                const SizedBox(width: 8),
                                if (item['is_available'] != true)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.redAccent.withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: Colors.redAccent),
                                    ),
                                    child: const Text('Unavailable', style: TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                                  ),
                              ],
                            ),
                          ],
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text('₹${item['price']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.primary)),
                            PopupMenuButton<String>(
                              icon: const Icon(Icons.more_vert, color: Colors.white),
                              color: AppTheme.surfaceDark,
                              onSelected: (action) {
                                if (action == 'edit') {
                                  _showMenuItemDialog(existing: item);
                                } else if (action == 'delete') {
                                  _deleteMenuItem(item['id'], item['name']);
                                }
                              },
                              itemBuilder: (_) => [
                                const PopupMenuItem(value: 'edit', child: Text('Edit', style: TextStyle(color: Colors.white))),
                                const PopupMenuItem(value: 'delete', child: Text('Delete', style: TextStyle(color: Colors.redAccent))),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ).animate().fadeIn(delay: Duration(milliseconds: 100 * i));
                  },
                ),
        ),
      ],
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Map<String, dynamic> order;
  final Color statusColor;
  final List<String> nextStatuses;
  final void Function(String) onUpdateStatus;

  const _OrderCard({
    required this.order,
    required this.statusColor,
    required this.nextStatuses,
    required this.onUpdateStatus,
  });

  @override
  Widget build(BuildContext context) {
    final items = order['items'] as List? ?? [];
    final status = order['status'] ?? 'unknown';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: statusColor.withValues(alpha: 0.3)),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  'Order #${(order['id'] ?? '').toString().padRight(8).substring(0, 8).trimRight()}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: statusColor.withValues(alpha: 0.5)),
                ),
                child: Text(
                  status.replaceAll('_', ' ').toUpperCase(),
                  style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const Divider(color: AppTheme.borderDark, height: 32),
          Row(
            children: [
              const Icon(Icons.person, color: AppTheme.textSecondary, size: 16),
              const SizedBox(width: 8),
              Text('👤 ${order['customer_username'] ?? 'Customer'}', style: const TextStyle(color: Colors.white, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 8),
          if (order['delivery_address'] != null)
            Row(
              children: [
                const Icon(Icons.location_on, color: AppTheme.textSecondary, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text('📍 ${order['delivery_address']}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
                ),
              ],
            ),
          const SizedBox(height: 16),
          ...items.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('• ${item['name'] ?? ''} × ${item['qty'] ?? 1}', style: const TextStyle(color: Colors.white)),
                    Text('₹${item['price'] ?? 0}', style: const TextStyle(color: AppTheme.textSecondary)),
                  ],
                ),
              )),
          const Divider(color: AppTheme.borderDark, height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '₹${order['total_amount'] ?? 0}',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: AppTheme.primary),
              ),
              if (nextStatuses.isNotEmpty)
                Wrap(
                  spacing: 8,
                  children: nextStatuses.map((s) {
                    final isCancel = s == 'cancelled';
                    return ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isCancel ? Colors.redAccent.withValues(alpha: 0.2) : AppTheme.primary.withValues(alpha: 0.2),
                        foregroundColor: isCancel ? Colors.redAccent : AppTheme.primary,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      ),
                      onPressed: () => onUpdateStatus(s),
                      child: Text(s.replaceAll('_', ' ').toUpperCase(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    );
                  }).toList(),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
