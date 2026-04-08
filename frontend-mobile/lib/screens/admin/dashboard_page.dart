import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme.dart';
import '../../services/api_service.dart';
import '../../providers/auth_provider.dart';

class AdminDashboardPage extends StatefulWidget {
  const AdminDashboardPage({super.key});

  @override
  State<AdminDashboardPage> createState() => _AdminDashboardPageState();
}

class _AdminDashboardPageState extends State<AdminDashboardPage> {
  int _selectedIndex = 0; // 0 = Orders (Default)

  @override
  Widget build(BuildContext context) {
    // Force Light Theme for Admin purely
    return Theme(
      data: AppTheme.lightTheme,
      child: Scaffold(
        backgroundColor: AppTheme.backgroundLight,
        body: Row(
          children: [
            _buildSidebar(),
            const VerticalDivider(thickness: 1, width: 1, color: AppTheme.borderLight),
            Expanded(
              child: _getSelectedPage(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _getSelectedPage() {
    switch (_selectedIndex) {
      case 0: return const _OrdersView();
      case 1: return const _DashboardView();
      case 2: return const _ApprovalsView();
      case 3: return const Center(child: Text('Users Management', style: TextStyle(color: AppTheme.textPrimary)));
      case 4: return const Center(child: Text('Reports Analytics', style: TextStyle(color: AppTheme.textPrimary)));
      default: return const _OrdersView();
    }
  }

  Widget _buildSidebar() {
    return NavigationRail(
      backgroundColor: AppTheme.surfaceLight,
      extended: MediaQuery.of(context).size.width >= 1000,
      selectedIndex: _selectedIndex,
      onDestinationSelected: (idx) => setState(() => _selectedIndex = idx),
      selectedIconTheme: const IconThemeData(color: AppTheme.primary),
      unselectedIconTheme: const IconThemeData(color: AppTheme.textSecondary),
      selectedLabelTextStyle: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold),
      unselectedLabelTextStyle: const TextStyle(color: AppTheme.textSecondary),
      indicatorColor: AppTheme.primary.withValues(alpha: 0.1),
      leading: Padding(
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 8),
        child: Row(
          children: [
            const Icon(Icons.delivery_dining, color: AppTheme.primary, size: 32).animate().scale(),
            if (MediaQuery.of(context).size.width >= 1000) ...[
              const SizedBox(width: 12),
              const Text('Admin Hub', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)).animate().fadeIn(),
            ]
          ],
        ),
      ),
      trailing: Expanded(
        child: Align(
          alignment: Alignment.bottomCenter,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (MediaQuery.of(context).size.width >= 1000) ...[
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.danger,
                      side: const BorderSide(color: AppTheme.danger),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    icon: const Icon(Icons.warning, size: 16),
                    label: const Text('Reset DB', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    onPressed: _showResetDialog,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.textPrimary,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    icon: const Icon(Icons.logout, size: 16),
                    label: const Text('Logout', style: TextStyle(fontSize: 12)),
                    onPressed: () {
                      context.read<AuthProvider>().logout();
                      context.go('/login');
                    },
                  ),
                ] else ...[
                   IconButton(icon: const Icon(Icons.warning, color: AppTheme.danger), onPressed: _showResetDialog),
                   IconButton(icon: const Icon(Icons.logout, color: AppTheme.textPrimary), onPressed: () {
                      context.read<AuthProvider>().logout();
                      context.go('/login');
                   }),
                ]
              ],
            ),
          ),
        ),
      ),
      destinations: const [
        NavigationRailDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: Text('Orders')),
        NavigationRailDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: Text('Dashboard')),
        NavigationRailDestination(icon: Icon(Icons.check_circle_outlined), selectedIcon: Icon(Icons.check_circle), label: Text('Approvals')),
        NavigationRailDestination(icon: Icon(Icons.people_outlined), selectedIcon: Icon(Icons.people), label: Text('Users')),
        NavigationRailDestination(icon: Icon(Icons.bar_chart_outlined), selectedIcon: Icon(Icons.bar_chart), label: Text('Reports')),
      ],
    );
  }

  void _showResetDialog() {
    showDialog(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Critical: Wipe Database', style: TextStyle(color: AppTheme.danger, fontWeight: FontWeight.bold)),
      content: const Text('Are you absolutely certain? This will permanently delete all users, orders, approvals, and restaurants. Only your admin account will remain.'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel', style: TextStyle(color: AppTheme.textSecondary))),
        ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
          onPressed: () async {
            Navigator.pop(ctx);
            _executeReset();
          },
          child: const Text('WIPE DATABASE', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
      ],
    ));
  }

  Future<void> _executeReset() async {
    try {
      final api = context.read<ApiService>();
      await api.post('/admin/reset-database', {});
      if(mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Database reset completely.'), backgroundColor: AppTheme.success));
      }
    } catch(e) {
      if(mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: AppTheme.danger));
      }
    }
  }
}


// ==========================================
// ORDERS VIEW (DEFAULT)
// ==========================================
class _OrdersView extends StatefulWidget {
  const _OrdersView();
  @override
  State<_OrdersView> createState() => _OrdersViewState();
}

class _OrdersViewState extends State<_OrdersView> {
  List<dynamic> _orders = [];
  bool _loading = true;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _loadOrders();
    _timer = Timer.periodic(const Duration(seconds: 10), (_) => _loadOrders());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _loadOrders() async {
    try {
      final res = await context.read<ApiService>().getUserOrders(); // Fetches all if admin
      if (mounted) setState(() { _orders = res; _loading = false; });
    } catch(e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _autoAssign(String orderId) async {
    try {
      await context.read<ApiService>().autoAssignDelivery(orderId);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Agent Assigned'), backgroundColor: AppTheme.success));
      _loadOrders();
    } catch(e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: AppTheme.danger));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator(color: AppTheme.primary));

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Live Operations', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
              Row(
                children: [
                  OutlinedButton.icon(icon: const Icon(Icons.refresh, size: 16), label: const Text('Refresh'), onPressed: _loadOrders),
                ],
              )
            ],
          ),
          const SizedBox(height: 24),
          Expanded(
            child: SingleChildScrollView(
              child: Container(
                decoration: BoxDecoration(
                  color: AppTheme.surfaceLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.borderLight),
                ),
                width: double.infinity,
                child: DataTable(
                  columnSpacing: 24,
                  horizontalMargin: 24,
                  columns: const [
                    DataColumn(label: Text('ORDER ID')),
                    DataColumn(label: Text('STATUS')),
                    DataColumn(label: Text('CUSTOMER')),
                    DataColumn(label: Text('AMOUNT')),
                    DataColumn(label: Text('ACTIONS')),
                  ],
                  rows: _orders.map((o) {
                    final status = o['status'] ?? 'unknown';
                    return DataRow(
                      cells: [
                        DataCell(Text('#${o['id'].toString().substring(0, 8)}', style: const TextStyle(fontWeight: FontWeight.w600))),
                        DataCell(_buildStatusBadge(status)),
                        DataCell(Text(o['customer_username'] ?? 'Guest')),
                        DataCell(Text('₹${o['total_amount']}', style: const TextStyle(fontWeight: FontWeight.bold))),
                        DataCell(Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (status == 'accepted') 
                              TextButton(
                                onPressed: () => _autoAssign(o['id']),
                                child: const Text('Auto-Assign', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                              ),
                            if (status != 'delivered' && status != 'cancelled')
                               TextButton(
                                onPressed: () {
                                  // Assign tracking / Map logic here
                                },
                                child: const Text('Track', style: TextStyle(color: AppTheme.textSecondary)),
                              ),
                          ],
                        ))
                      ]
                    );
                  }).toList(),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bg = AppTheme.secondary;
    Color fg = AppTheme.textSecondary;
    if (status == 'delivered') { bg = AppTheme.delimBg; fg = AppTheme.success; }
    if (status == 'preparing' || status == 'accepted') { bg = AppTheme.prepBg; fg = AppTheme.warning; }
    if (status == 'cancelled' || status == 'late') { bg = AppTheme.lateBg; fg = AppTheme.danger; }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(4)),
      child: Text(status.toUpperCase(), style: TextStyle(color: fg, fontSize: 11, fontWeight: FontWeight.bold)),
    );
  }
}

// ==========================================
// DASHBOARD VIEW
// ==========================================
class _DashboardView extends StatefulWidget {
  const _DashboardView();
  @override
  State<_DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<_DashboardView> {
  Map<String, dynamic>? _stats;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    try {
      final s = await context.read<ApiService>().getAdminDashboard();
      if(mounted) setState(() => _stats = s);
    } catch(e) {}
  }

  @override
  Widget build(BuildContext context) {
    if (_stats == null) return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Metrics', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
          const SizedBox(height: 24),
          Row(
            children: [
              _StatWidget('Pending Approvals', '${_stats!['users']['pending']}', icon: Icons.warning, color: AppTheme.warning),
              const SizedBox(width: 16),
              _StatWidget('Total Orders', '${_stats!['orders']['total']}', icon: Icons.receipt, color: AppTheme.primary),
              const SizedBox(width: 16),
              _StatWidget('Revenue (Month)', '₹${_stats!['revenue']['month']}', icon: Icons.attach_money, color: AppTheme.success),
            ],
          )
        ],
      )
    );
  }
}

class _StatWidget extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatWidget(this.title, this.value, {required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppTheme.surfaceLight,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.borderLight),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.w600)),
                Icon(icon, color: color, size: 16),
              ],
            ),
            const SizedBox(height: 12),
            Text(value, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 28, fontWeight: FontWeight.bold)),
          ],
        )
      ),
    );
  }
}

// ==========================================
// APPROVALS VIEW
// ==========================================
class _ApprovalsView extends StatefulWidget {
  const _ApprovalsView();
  @override
  State<_ApprovalsView> createState() => _ApprovalsViewState();
}

class _ApprovalsViewState extends State<_ApprovalsView> {
  List<dynamic> _pendingUsers = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadPending();
  }

  Future<void> _loadPending() async {
    try {
      final res = await context.read<ApiService>().getPendingUsers();
      if(mounted) setState(() { _pendingUsers = res; _loading = false; });
    } catch(e) {
      if(mounted) setState(() => _loading = false);
    }
  }

  Future<void> _approve(String userId) async {
    try {
      final res = await context.read<ApiService>().approveUser(userId);
      _showPasswordDialog(res['password'] ?? 'Unknown Password');
      _loadPending();
    } catch(e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: AppTheme.danger));
    }
  }
  
  Future<void> _reject(String userId) async {
    try {
      await context.read<ApiService>().rejectUser(userId);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('User rejected.'), backgroundColor: AppTheme.success));
      _loadPending();
    } catch(e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: AppTheme.danger));
    }
  }

  void _showPasswordDialog(String p) {
    showDialog(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Approved successfully', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.success)),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Please share this auto-generated secure password with the user so they can log in:'),
          const SizedBox(height: 16),
          SelectableText(p, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 2)),
        ],
      ),
      actions: [
        ElevatedButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close'))
      ]
    ));
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator(color: AppTheme.primary));

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Pending Approvals', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
              OutlinedButton.icon(icon: const Icon(Icons.refresh, size: 16), label: const Text('Refresh'), onPressed: _loadPending),
            ],
          ),
          const SizedBox(height: 24),
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(color: AppTheme.surfaceLight, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppTheme.borderLight)),
              child: _pendingUsers.isEmpty
                  ? const Center(child: Text('No pending approvals.', style: TextStyle(color: AppTheme.textSecondary)))
                  : SingleChildScrollView(
                      child: DataTable(
                        columnSpacing: 24, horizontalMargin: 24,
                        columns: const [
                          DataColumn(label: Text('ROLE')),
                          DataColumn(label: Text('USERNAME')),
                          DataColumn(label: Text('EMAIL')),
                          DataColumn(label: Text('ACTIONS')),
                        ],
                        rows: _pendingUsers.map((u) => DataRow(cells: [
                          DataCell(Text((u['role'] ?? '').toUpperCase(), style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary))),
                          DataCell(Text(u['username'] ?? '')),
                          DataCell(Text(u['email'] ?? '')),
                          DataCell(Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              TextButton(onPressed: () => _approve(u['id']), child: const Text('Approve', style: TextStyle(color: AppTheme.success, fontWeight: FontWeight.bold))),
                              TextButton(onPressed: () => _reject(u['id']), child: const Text('Reject', style: TextStyle(color: AppTheme.danger, fontWeight: FontWeight.bold))),
                            ]
                          ))
                        ])).toList()
                      )
                    )
            )
          )
        ]
      )
    );
  }
}
