import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme.dart';
import '../../core/components/custom_button.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../services/socket_service.dart';

class DeliveryHomePage extends StatefulWidget {
  const DeliveryHomePage({super.key});

  @override
  State<DeliveryHomePage> createState() => _DeliveryHomePageState();
}

class _DeliveryHomePageState extends State<DeliveryHomePage> {
  late ApiService _api;
  late SocketService _socket;

  List<Map<String, dynamic>> _available = [];
  List<Map<String, dynamic>> _myOrders = [];

  bool _availableLoading = true;
  bool _myLoading = true;

  Map<String, dynamic>? _stats;
  bool _locationTracking = false;
  
  int _selectedIndex = 0;

  Timer? _pollTimer;
  Timer? _locationTimer;

  @override
  void initState() {
    super.initState();
    _api = context.read<ApiService>();
    _socket = SocketService();
    _socket.connect();

    _loadData();
    _loadStats();

    _pollTimer = Timer.periodic(const Duration(seconds: 20), (_) {
      _loadData();
      _loadStats();
    });

    _initLocationTracking();
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _locationTimer?.cancel();
    _socket.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    await Future.wait([_loadAvailable(), _loadMyOrders()]);
  }

  Future<void> _loadAvailable() async {
    try {
      final raw = await _api.getAvailableOrders();
      if (!mounted) return;
      setState(() {
        _available = raw.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        _availableLoading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _availableLoading = false);
    }
  }

  Future<void> _loadMyOrders() async {
    try {
      final raw = await _api.getMyDeliveryOrders();
      if (!mounted) return;
      setState(() {
        _myOrders = raw.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        _myLoading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _myLoading = false);
    }
  }

  Future<void> _loadStats() async {
    try {
      final data = await _api.getDeliveryStats();
      if (mounted) setState(() => _stats = data);
    } catch (_) {}
  }

  Future<void> _initLocationTracking() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.deniedForever) return;

      setState(() => _locationTracking = true);
      _locationTimer = Timer.periodic(const Duration(seconds: 10), (_) async {
        try {
          final pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
          await _api.updateDeliveryLocation(pos.latitude, pos.longitude);
        } catch (_) {}
      });
    } catch (_) {}
  }

  Future<void> _acceptOrder(String orderId) async {
    try {
      await _api.acceptOrder(orderId);
      _showSnack('Order accepted! 🚴');
      await _loadData();
    } catch (e) {
      _showSnack('Error: ${e.toString()}', error: true);
    }
  }

  Future<void> _markDelivered(String orderId) async {
    try {
      await _api.markOrderDelivered(orderId);
      _showSnack('Order marked as delivered ✅');
      await _loadData();
      await _loadStats();
    } catch (e) {
      _showSnack('Error: ${e.toString()}', error: true);
    }
  }

  void _showSnack(String msg, {bool error = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg, style: const TextStyle(color: Colors.white)),
      backgroundColor: error ? Colors.red : Colors.green,
    ));
  }

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'on_the_way': return Colors.purpleAccent;
      case 'delivered': return Colors.greenAccent;
      case 'ready': return Colors.tealAccent;
      default: return Colors.orangeAccent;
    }
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      _buildAvailableTab(),
      _buildMyDeliveriesTab(),
    ];

    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        backgroundColor: AppTheme.surfaceDark,
        foregroundColor: Colors.white,
        title: const Text('🚴 Delivery Hub', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
            child: Row(
              children: [
                Icon(
                  _locationTracking ? Icons.location_on : Icons.location_off,
                  size: 16,
                  color: _locationTracking ? Colors.greenAccent : AppTheme.textSecondary,
                ).animate(target: _locationTracking ? 1 : 0).shimmer(duration: 2.seconds),
                const SizedBox(width: 4),
                Text(
                  _locationTracking ? 'Online' : 'Offline',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: _locationTracking ? Colors.greenAccent : AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadData),
          IconButton(
            icon: const Icon(Icons.logout, color: AppTheme.primary),
            onPressed: () {
              context.read<AuthProvider>().logout();
              context.go('/login');
            },
          ),
        ],
      ),
      body: Column(
        children: [
          if (_stats != null) _buildStatsBar().animate().fadeIn().slideY(begin: -0.1),
          Expanded(
            child: AnimatedSwitcher(
              duration: 300.ms,
              child: pages[_selectedIndex],
            ),
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) => setState(() => _selectedIndex = index),
        backgroundColor: AppTheme.surfaceDark,
        indicatorColor: AppTheme.primary.withValues(alpha: 0.2),
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.local_shipping_outlined),
            selectedIcon: const Icon(Icons.local_shipping, color: AppTheme.primary),
            label: 'Available',
          ),
          NavigationDestination(
            icon: const Icon(Icons.delivery_dining_outlined),
            selectedIcon: const Icon(Icons.delivery_dining, color: AppTheme.primary),
            label: 'My Deliveries',
          ),
        ],
      ),
    );
  }

  Widget _buildStatsBar() {
    return Container(
      color: AppTheme.surfaceDark,
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
      margin: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _statChip(Icons.check_circle, 'Delivered', '${_stats!['delivered_orders'] ?? 0}', Colors.greenAccent),
          Container(width: 1, height: 40, color: AppTheme.borderDark),
          _statChip(Icons.pending, 'Active', '${_stats!['active_orders'] ?? 0}', Colors.orangeAccent),
          Container(width: 1, height: 40, color: AppTheme.borderDark),
          _statChip(Icons.account_balance_wallet, 'Earnings', '₹${_stats!['total_earnings'] ?? 0}', AppTheme.primary),
        ],
      ),
    );
  }

  Widget _statChip(IconData icon, String label, String value, Color color) {
    return Column(
      children: [
        Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 8),
            Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 20)),
          ],
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
      ],
    );
  }

  Widget _buildAvailableTab() {
    if (_availableLoading) return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
    
    if (_available.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.inbox_outlined, size: 64, color: AppTheme.textSecondary),
            const SizedBox(height: 16),
            const Text('No available orders right now', style: TextStyle(color: AppTheme.textSecondary, fontSize: 16)),
            const SizedBox(height: 8),
            Text('Pull to refresh', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary.withValues(alpha: 0.5))),
          ],
        ),
      ).animate().fadeIn();
    }

    return RefreshIndicator(
      onRefresh: _loadAvailable,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _available.length,
        itemBuilder: (_, i) {
          final o = _available[i];
          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: AppTheme.surfaceDark,
              border: Border.all(color: AppTheme.borderDark),
              borderRadius: BorderRadius.circular(20),
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
                        '🏪 ${o['restaurant'] ?? 'Restaurant'}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      '₹${o['total_amount'] ?? 0}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.primary),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Icon(Icons.location_pin, size: 16, color: AppTheme.textSecondary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        o['delivery_address'] ?? 'Address not provided',
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                CustomButton(
                  text: 'Accept Delivery',
                  onPressed: () => _acceptOrder(o['id']),
                ),
              ],
            ),
          ).animate().fadeIn(delay: Duration(milliseconds: 100 * i)).slideY(begin: 0.1);
        },
      ),
    );
  }

  Widget _buildMyDeliveriesTab() {
    if (_myLoading) return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
    
    if (_myOrders.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.delivery_dining, size: 64, color: AppTheme.textSecondary),
            const SizedBox(height: 16),
            const Text('No deliveries yet', style: TextStyle(color: AppTheme.textSecondary, fontSize: 16)),
          ],
        ),
      ).animate().fadeIn();
    }

    return RefreshIndicator(
      onRefresh: _loadMyOrders,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _myOrders.length,
        itemBuilder: (_, i) {
          final o = _myOrders[i];
          final status = o['status'] ?? 'unknown';
          final isActive = status == 'on_the_way';

          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: AppTheme.surfaceDark,
              border: Border.all(color: isActive ? AppTheme.primary.withValues(alpha: 0.5) : AppTheme.borderDark),
              borderRadius: BorderRadius.circular(20),
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Order #${(o['id'] ?? '').toString().padRight(8).substring(0, 8).trimRight()}',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: _statusColor(status).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: _statusColor(status).withValues(alpha: 0.5)),
                      ),
                      child: Text(
                        status.replaceAll('_', ' ').toUpperCase(),
                        style: TextStyle(color: _statusColor(status), fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text('🏪 ${o['restaurant_name'] ?? ''}', style: const TextStyle(color: Colors.white, fontSize: 16)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.location_pin, size: 16, color: AppTheme.textSecondary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        o['delivery_address'] ?? '',
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '₹${o['total_amount'] ?? 0}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.primary),
                    ),
                    if (isActive)
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.greenAccent.withValues(alpha: 0.2),
                            foregroundColor: Colors.greenAccent,
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                        icon: const Icon(Icons.done_all),
                        label: const Text('Mark Delivered', style: TextStyle(fontWeight: FontWeight.bold)),
                        onPressed: () => _markDelivered(o['id']),
                      ),
                  ],
                ),
              ],
            ),
          ).animate().fadeIn(delay: Duration(milliseconds: 100 * i));
        },
      ),
    );
  }
}
