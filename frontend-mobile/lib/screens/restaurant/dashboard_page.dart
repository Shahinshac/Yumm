import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../services/socket_service.dart';

/// Full-featured Restaurant Dashboard with two tabs:
///  1. Orders – incoming orders with accept/reject and status updates
///  2. Menu   – add, edit, and delete menu items
class RestaurantDashboardPage extends StatefulWidget {
  const RestaurantDashboardPage({Key? key}) : super(key: key);

  @override
  State<RestaurantDashboardPage> createState() =>
      _RestaurantDashboardPageState();
}

class _RestaurantDashboardPageState extends State<RestaurantDashboardPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late ApiService _api;
  late SocketService _socket;

  // ---- state ----
  List<Map<String, dynamic>> _orders = [];
  List<Map<String, dynamic>> _menuItems = [];
  bool _ordersLoading = true;
  bool _menuLoading = true;

  // The restaurant whose data this panel manages.
  // In a real app the user's profile would reference their restaurant id.
  // For demo we derive it from the first order or first menu item.
  String? _restaurantId;

  Timer? _pollTimer;

  static const Color _brand = Color(0xFFff6b35);

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _api = context.read<ApiService>();
    _socket = SocketService();
    _socket.connect();

    // Load data immediately then poll every 15 s for new orders
    _loadOrders();
    _loadMenu();

    _pollTimer =
        Timer.periodic(const Duration(seconds: 15), (_) => _loadOrders());

    // Listen for real-time new-order events
    _socket.onNewOrder((data) {
      if (mounted) {
        setState(() => _orders.insert(0, data));
        _showSnack('🔔 New order received!');
      }
    });

    // Live order status updates pushed from server
    _socket.onOrderStatusUpdate((data) {
      if (mounted) _refreshOrderById(data['order_id'], data['status']);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _pollTimer?.cancel();
    _socket.dispose();
    super.dispose();
  }

  // ── Data loaders ──────────────────────────────────────────────────────────

  Future<void> _loadOrders() async {
    if (_restaurantId == null && _orders.isEmpty) {
      // Try to derive restaurant id from API (demo: load all orders for the logged-in restaurant role)
      try {
        final raw = await _api.getUserOrders();
        if (!mounted) return;
        final list =
            raw.map((e) => Map<String, dynamic>.from(e as Map)).toList();
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
      // Wait until restaurant id is known; retry after a short delay
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
        _menuItems =
            raw.map((e) => Map<String, dynamic>.from(e as Map)).toList();
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

  // ── Order actions ─────────────────────────────────────────────────────────

  Future<void> _updateStatus(String orderId, String status) async {
    try {
      await _api.updateOrderStatus(orderId, status);
      _refreshOrderById(orderId, status);
      _showSnack('Order marked as $status');
    } catch (e) {
      _showSnack('Error: ${e.toString()}', error: true);
    }
  }

  // ── Menu actions ──────────────────────────────────────────────────────────

  Future<void> _showMenuItemDialog({Map<String, dynamic>? existing}) async {
    final nameCtrl = TextEditingController(text: existing?['name'] ?? '');
    final priceCtrl = TextEditingController(
        text: existing != null ? existing['price'].toString() : '');
    final descCtrl =
        TextEditingController(text: existing?['description'] ?? '');
    final catCtrl = TextEditingController(text: existing?['category'] ?? '');
    bool isVeg = existing?['is_veg'] ?? true;
    bool isAvailable = existing?['is_available'] ?? true;

    await showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: Text(existing == null ? 'Add Menu Item' : 'Edit Menu Item'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(labelText: 'Name *'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: priceCtrl,
                  decoration: const InputDecoration(labelText: 'Price (₹) *'),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: descCtrl,
                  decoration: const InputDecoration(labelText: 'Description'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: catCtrl,
                  decoration: const InputDecoration(labelText: 'Category'),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Text('Vegetarian'),
                    Switch(
                      value: isVeg,
                      activeColor: Colors.green,
                      onChanged: (v) => setDialogState(() => isVeg = v),
                    ),
                    const Spacer(),
                    const Text('Available'),
                    Switch(
                      value: isAvailable,
                      activeColor: _brand,
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
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: _brand),
              onPressed: () async {
                if (nameCtrl.text.isEmpty || priceCtrl.text.isEmpty) {
                  _showSnack('Name and price are required', error: true);
                  return;
                }
                final price = double.tryParse(priceCtrl.text);
                if (price == null || price <= 0) {
                  _showSnack('Please enter a valid price greater than 0',
                      error: true);
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
              child: Text(
                existing == null ? 'Add' : 'Save',
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _addMenuItem(Map<String, dynamic> data) async {
    if (_restaurantId == null) return;
    try {
      final res = await _api.addMenuItem(_restaurantId!, data);
      setState(() =>
          _menuItems.insert(0, Map<String, dynamic>.from(res['menu_item'])));
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
        title: const Text('Delete Item'),
        content: Text('Remove "$name" from the menu?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
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

  // ── Helpers ───────────────────────────────────────────────────────────────

  void _showSnack(String msg, {bool error = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: error ? Colors.red : Colors.green,
    ));
  }

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.orange;
      case 'confirmed':
        return Colors.blue;
      case 'preparing':
        return Colors.indigo;
      case 'ready':
        return Colors.teal;
      case 'on_the_way':
        return Colors.purple;
      case 'delivered':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
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

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: _brand,
        foregroundColor: Colors.white,
        title: const Text('🍽️  Restaurant Panel'),
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
              onSelected: (v) {
                if (v == 'logout') {
                  auth.logout();
                  context.go('/login');
                }
              },
              itemBuilder: (_) => [
                const PopupMenuItem(value: 'logout', child: Text('Logout')),
              ],
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: [
            Tab(
              icon: const Icon(Icons.receipt_long),
              text:
                  'Orders (${_orders.where((o) => o['status'] == 'pending').length})',
            ),
            const Tab(icon: Icon(Icons.restaurant_menu), text: 'Menu'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOrdersTab(),
          _buildMenuTab(),
        ],
      ),
    );
  }

  // ── Orders Tab ────────────────────────────────────────────────────────────

  Widget _buildOrdersTab() {
    if (_ordersLoading) return const Center(child: CircularProgressIndicator());
    if (_orders.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox, size: 64, color: Colors.grey),
            SizedBox(height: 12),
            Text('No orders yet', style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadOrders,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _orders.length,
        itemBuilder: (_, i) => _OrderCard(
          order: _orders[i],
          statusColor: _statusColor(_orders[i]['status'] ?? ''),
          nextStatuses: _nextStatuses(_orders[i]['status'] ?? ''),
          onUpdateStatus: (s) => _updateStatus(_orders[i]['id'], s),
        ),
      ),
    );
  }

  // ── Menu Tab ──────────────────────────────────────────────────────────────

  Widget _buildMenuTab() {
    if (_menuLoading) return const Center(child: CircularProgressIndicator());

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${_menuItems.length} item${_menuItems.length == 1 ? '' : 's'}',
                style: const TextStyle(fontSize: 14, color: Colors.grey),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: _brand),
                icon: const Icon(Icons.add, color: Colors.white),
                label: const Text('Add Item',
                    style: TextStyle(color: Colors.white)),
                onPressed: () => _showMenuItemDialog(),
              ),
            ],
          ),
        ),
        Expanded(
          child: _menuItems.isEmpty
              ? const Center(child: Text('No menu items yet. Add one!'))
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  itemCount: _menuItems.length,
                  itemBuilder: (_, i) {
                    final item = _menuItems[i];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 10),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: item['is_veg'] == true
                              ? Colors.green[100]
                              : Colors.red[100],
                          child: Icon(
                            item['is_veg'] == true
                                ? Icons.eco
                                : Icons.lunch_dining,
                            color: item['is_veg'] == true
                                ? Colors.green
                                : Colors.red,
                          ),
                        ),
                        title: Text(
                          item['name'] ?? '',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item['description'] ?? ''),
                            Row(children: [
                              Chip(
                                label: Text(item['category'] ?? 'Other'),
                                materialTapTargetSize:
                                    MaterialTapTargetSize.shrinkWrap,
                                padding: EdgeInsets.zero,
                                labelPadding:
                                    const EdgeInsets.symmetric(horizontal: 4),
                              ),
                              const SizedBox(width: 6),
                              if (item['is_available'] != true)
                                const Chip(
                                  label: Text('Unavailable',
                                      style: TextStyle(
                                          color: Colors.white, fontSize: 11)),
                                  backgroundColor: Colors.red,
                                  materialTapTargetSize:
                                      MaterialTapTargetSize.shrinkWrap,
                                  padding: EdgeInsets.zero,
                                  labelPadding:
                                      EdgeInsets.symmetric(horizontal: 4),
                                ),
                            ]),
                          ],
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              '₹${item['price']}',
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                  color: _brand),
                            ),
                            PopupMenuButton<String>(
                              onSelected: (action) {
                                if (action == 'edit') {
                                  _showMenuItemDialog(existing: item);
                                } else if (action == 'delete') {
                                  _deleteMenuItem(item['id'], item['name']);
                                }
                              },
                              itemBuilder: (_) => [
                                const PopupMenuItem(
                                    value: 'edit', child: Text('Edit')),
                                const PopupMenuItem(
                                  value: 'delete',
                                  child: Text('Delete',
                                      style: TextStyle(color: Colors.red)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}

// ── Order Card Widget ─────────────────────────────────────────────────────────

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

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    'Order #${(order['id'] ?? '').toString().padRight(8).substring(0, 8).trimRight()}',
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: statusColor),
                  ),
                  child: Text(
                    status.replaceAll('_', ' ').toUpperCase(),
                    style: TextStyle(
                        color: statusColor,
                        fontSize: 11,
                        fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const Divider(),
            // Customer & address
            Text('👤 ${order['customer_username'] ?? 'Customer'}'),
            if (order['delivery_address'] != null)
              Text('📍 ${order['delivery_address']}',
                  style: const TextStyle(color: Colors.grey, fontSize: 12)),
            const SizedBox(height: 8),
            // Items
            ...items.map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 2),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('• ${item['name'] ?? ''} × ${item['qty'] ?? 1}'),
                      Text('₹${item['price'] ?? 0}'),
                    ],
                  ),
                )),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '₹${order['total_amount'] ?? 0}',
                  style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: Color(0xFFff6b35)),
                ),
                // Action buttons for status transitions
                if (nextStatuses.isNotEmpty)
                  Row(
                    children: nextStatuses.map((s) {
                      final isCancel = s == 'cancelled';
                      return Padding(
                        padding: const EdgeInsets.only(left: 8),
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor:
                                isCancel ? Colors.red : const Color(0xFFff6b35),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                          ),
                          onPressed: () => onUpdateStatus(s),
                          child: Text(
                            s.replaceAll('_', ' ').toUpperCase(),
                            style: const TextStyle(
                                color: Colors.white, fontSize: 11),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
