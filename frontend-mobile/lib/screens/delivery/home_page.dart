import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../services/socket_service.dart';

/// Full Delivery Partner Dashboard:
///  - Tab 1: Available orders to accept
///  - Tab 2: My active / completed deliveries
///  - Live GPS location broadcasting
class DeliveryHomePage extends StatefulWidget {
  const DeliveryHomePage({Key? key}) : super(key: key);

  @override
  State<DeliveryHomePage> createState() => _DeliveryHomePageState();
}

class _DeliveryHomePageState extends State<DeliveryHomePage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late ApiService _api;
  late SocketService _socket;

  List<Map<String, dynamic>> _available = [];
  List<Map<String, dynamic>> _myOrders = [];

  bool _availableLoading = true;
  bool _myLoading = true;

  Map<String, dynamic>? _stats;
  bool _locationTracking = false;

  Timer? _pollTimer;
  Timer? _locationTimer;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _api = context.read<ApiService>();
    _socket = SocketService();
    _socket.connect();

    _loadData();
    _loadStats();

    // Poll every 20 s
    _pollTimer = Timer.periodic(const Duration(seconds: 20), (_) {
      _loadData();
      _loadStats();
    });

    // Start GPS broadcasting if location permission granted
    _initLocationTracking();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _pollTimer?.cancel();
    _locationTimer?.cancel();
    _socket.dispose();
    super.dispose();
  }

  // ── Data ──────────────────────────────────────────────────────────────────

  Future<void> _loadData() async {
    await Future.wait([_loadAvailable(), _loadMyOrders()]);
  }

  Future<void> _loadAvailable() async {
    try {
      final raw = await _api.getAvailableOrders();
      if (!mounted) return;
      setState(() {
        _available =
            raw.map((e) => Map<String, dynamic>.from(e as Map)).toList();
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
        _myOrders =
            raw.map((e) => Map<String, dynamic>.from(e as Map)).toList();
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

  // ── GPS ───────────────────────────────────────────────────────────────────

  Future<void> _initLocationTracking() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.deniedForever) return;

      setState(() => _locationTracking = true);
      // Broadcast GPS every 10 s while active
      _locationTimer = Timer.periodic(const Duration(seconds: 10), (_) async {
        try {
          final pos = await Geolocator.getCurrentPosition(
              desiredAccuracy: LocationAccuracy.high);
          await _api.updateDeliveryLocation(pos.latitude, pos.longitude);
        } catch (_) {}
      });
    } catch (_) {
      // Location not available on this platform/simulator — silently skip
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────

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
      content: Text(msg),
      backgroundColor: error ? Colors.red : Colors.green,
    ));
  }

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'on_the_way':
        return Colors.purple;
      case 'delivered':
        return Colors.green;
      case 'ready':
        return Colors.teal;
      default:
        return Colors.orange;
    }
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        title: const Text('🚴 Delivery Dashboard'),
        actions: [
          // GPS status indicator
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
            child: Row(
              children: [
                Icon(
                  _locationTracking ? Icons.location_on : Icons.location_off,
                  size: 18,
                  color:
                      _locationTracking ? Colors.greenAccent : Colors.white54,
                ),
                const SizedBox(width: 4),
                Text(
                  _locationTracking ? 'GPS' : 'No GPS',
                  style: TextStyle(
                    fontSize: 11,
                    color:
                        _locationTracking ? Colors.greenAccent : Colors.white54,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
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
              icon: const Icon(Icons.local_shipping_outlined),
              text: 'Available (${_available.length})',
            ),
            Tab(
              icon: const Icon(Icons.delivery_dining),
              text: 'My Deliveries',
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Stats bar
          if (_stats != null) _buildStatsBar(),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildAvailableTab(),
                _buildMyDeliveriesTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsBar() {
    return Container(
      color: Colors.grey[100],
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _statChip(Icons.check_circle, 'Delivered',
              '${_stats!['delivered_orders'] ?? 0}', Colors.green),
          _statChip(Icons.pending, 'Active', '${_stats!['active_orders'] ?? 0}',
              Colors.orange),
          _statChip(Icons.currency_rupee, 'Earnings',
              '₹${_stats!['total_earnings'] ?? 0}', AppColors.primary),
        ],
      ),
    );
  }

  Widget _statChip(IconData icon, String label, String value, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 2),
        Text(value,
            style: TextStyle(fontWeight: FontWeight.bold, color: color)),
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
      ],
    );
  }

  // ── Available Orders Tab ──────────────────────────────────────────────────

  Widget _buildAvailableTab() {
    if (_availableLoading)
      return const Center(child: CircularProgressIndicator());
    if (_available.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox_outlined, size: 64, color: Colors.grey),
            SizedBox(height: 12),
            Text('No available orders right now',
                style: TextStyle(color: Colors.grey)),
            SizedBox(height: 8),
            Text('Pull to refresh',
                style: TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadAvailable,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _available.length,
        itemBuilder: (_, i) {
          final o = _available[i];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            elevation: 2,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '🏪 ${o['restaurant'] ?? 'Restaurant'}',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      Text(
                        '₹${o['total_amount'] ?? 0}',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            color: AppColors.primary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.location_pin,
                          size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          o['delivery_address'] ?? 'Address not provided',
                          style:
                              const TextStyle(color: Colors.grey, fontSize: 12),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white),
                      icon: const Icon(Icons.check),
                      label: const Text('Accept Delivery'),
                      onPressed: () => _acceptOrder(o['id']),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // ── My Deliveries Tab ─────────────────────────────────────────────────────

  Widget _buildMyDeliveriesTab() {
    if (_myLoading) return const Center(child: CircularProgressIndicator());
    if (_myOrders.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.delivery_dining, size: 64, color: Colors.grey),
            SizedBox(height: 12),
            Text('No deliveries yet', style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadMyOrders,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: _myOrders.length,
        itemBuilder: (_, i) {
          final o = _myOrders[i];
          final status = o['status'] ?? 'unknown';
          final isActive = status == 'on_the_way';

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            elevation: 2,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Order #${(o['id'] ?? '').toString().padRight(8).substring(0, 8).trimRight()}',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: _statusColor(status).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: _statusColor(status)),
                        ),
                        child: Text(
                          status.replaceAll('_', ' ').toUpperCase(),
                          style: TextStyle(
                              color: _statusColor(status),
                              fontSize: 11,
                              fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('🏪 ${o['restaurant_name'] ?? ''}'),
                  Row(
                    children: [
                      const Icon(Icons.location_pin,
                          size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          o['delivery_address'] ?? '',
                          style:
                              const TextStyle(color: Colors.grey, fontSize: 12),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '₹${o['total_amount'] ?? 0}',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: AppColors.primary),
                      ),
                      if (isActive)
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white),
                          icon: const Icon(Icons.done_all),
                          label: const Text('Mark Delivered'),
                          onPressed: () => _markDelivered(o['id']),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
