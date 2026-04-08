import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme.dart';
import '../../core/components/custom_button.dart';
import '../../core/widgets/custom_empty_state.dart';
import '../../providers/auth_provider.dart';

class AdminDashboardPage extends StatefulWidget {
  const AdminDashboardPage({super.key});

  @override
  State<AdminDashboardPage> createState() => _AdminDashboardPageState();
}

class _AdminDashboardPageState extends State<AdminDashboardPage> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width >= 800;

    final pages = [
      _buildSummaryTab(isDesktop),
      _buildApprovalsTab(),
      _buildUsersTab(),
      _buildOrdersTab(),
      _buildReportsTab(),
    ];

    if (isDesktop) {
      return Scaffold(
        backgroundColor: AppTheme.backgroundDark,
        body: Row(
          children: [
            NavigationRail(
              backgroundColor: AppTheme.surfaceDark,
              extended: true,
              selectedIndex: _selectedIndex,
              onDestinationSelected: (index) => setState(() => _selectedIndex = index),
              selectedIconTheme: const IconThemeData(color: Colors.white),
              unselectedIconTheme: const IconThemeData(color: AppTheme.textSecondary),
              selectedLabelTextStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              unselectedLabelTextStyle: const TextStyle(color: AppTheme.textSecondary),
              indicatorColor: AppTheme.primary,
              leading: Padding(
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 8),
                child: Row(
                  children: [
                    const Icon(Icons.admin_panel_settings, color: AppTheme.primary, size: 32).animate().scale(),
                    const SizedBox(width: 12),
                    Text('FoodHub Admin', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)).animate().fadeIn(),
                  ],
                ),
              ),
              trailing: Padding(
                padding: const EdgeInsets.all(16.0).copyWith(top: 64),
                child: CustomButton(
                  text: 'Logout',
                  isSecondary: true,
                  onPressed: () {
                    context.read<AuthProvider>().logout();
                    context.go('/login');
                  },
                ),
              ),
              destinations: const [
                NavigationRailDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: Text('Dashboard')),
                NavigationRailDestination(icon: Icon(Icons.check_circle_outlined), selectedIcon: Icon(Icons.check_circle), label: Text('Approvals')),
                NavigationRailDestination(icon: Icon(Icons.people_outlined), selectedIcon: Icon(Icons.people), label: Text('Users')),
                NavigationRailDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: Text('Orders')),
                NavigationRailDestination(icon: Icon(Icons.bar_chart_outlined), selectedIcon: Icon(Icons.bar_chart), label: Text('Reports')),
              ],
            ),
            const VerticalDivider(thickness: 1, width: 1, color: AppTheme.borderDark),
            Expanded(
              child: AnimatedSwitcher(
                duration: 300.ms,
                child: pages[_selectedIndex],
              ),
            ),
          ],
        ),
      );
    }

    // Mobile Layout
    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        backgroundColor: AppTheme.surfaceDark,
        elevation: 0,
        title: const Text('Admin Console', style: TextStyle(color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: AppTheme.primary),
            onPressed: () {
              context.read<AuthProvider>().logout();
              context.go('/login');
            },
          )
        ],
      ),
      body: SafeArea(
        child: AnimatedSwitcher(
          duration: 300.ms,
          child: pages[_selectedIndex],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) => setState(() => _selectedIndex = index),
        backgroundColor: AppTheme.surfaceDark,
        indicatorColor: AppTheme.primary.withValues(alpha: 0.2),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard, color: AppTheme.primary), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.check_circle_outlined), selectedIcon: Icon(Icons.check_circle, color: AppTheme.primary), label: 'Approvals'),
          NavigationDestination(icon: Icon(Icons.people_outlined), selectedIcon: Icon(Icons.people, color: AppTheme.primary), label: 'Users'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long, color: AppTheme.primary), label: 'Orders'),
          NavigationDestination(icon: Icon(Icons.bar_chart_outlined), selectedIcon: Icon(Icons.bar_chart, color: AppTheme.primary), label: 'Reports'),
        ],
      ),
    );
  }

  Widget _buildSummaryTab(bool isDesktop) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(isDesktop ? 48.0 : 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Platform Overview', style: Theme.of(context).textTheme.displayLarge).animate().fadeIn().moveY(begin: 20),
          const SizedBox(height: 8),
          const Text('Real-time updates on FoodHub platform activity', style: TextStyle(color: AppTheme.textSecondary, fontSize: 16)).animate().fadeIn(delay: 100.ms),
          const SizedBox(height: 48),
          GridView.count(
            crossAxisCount: isDesktop ? 2 : 1,
            crossAxisSpacing: 24,
            mainAxisSpacing: 24,
            shrinkWrap: true,
            childAspectRatio: isDesktop ? 2.5 : 2.0,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              _buildStatCard('Active Users', '1,264', Icons.people_outline, Colors.blue),
              _buildStatCard('Pending Approvals', '8', Icons.check_circle_outline, Colors.orange),
              _buildStatCard('Open Orders', '42', Icons.receipt_long_outlined, Colors.purple),
              _buildStatCard('Weekly Revenue', '₹72,190', Icons.account_balance_wallet_outlined, Colors.green),
            ],
          ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderDark),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.05),
            blurRadius: 20,
            offset: const Offset(0, 10),
          )
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 36),
          ),
          const SizedBox(width: 24),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(title, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 16, fontWeight: FontWeight.w500)),
                const SizedBox(height: 8),
                Text(value, style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildApprovalsTab() => const Center(child: CustomEmptyState(icon: Icons.check_circle_outline, title: 'Approvals Queue', description: 'No pending approvals right now.'));
  Widget _buildUsersTab() => const Center(child: CustomEmptyState(icon: Icons.people_outlined, title: 'User Management', description: 'Tools to manage platform users will appear here.'));
  Widget _buildOrdersTab() => const Center(child: CustomEmptyState(icon: Icons.receipt_outlined, title: 'Global Orders', description: 'Monitor all live orders across the platform here.'));
  Widget _buildReportsTab() => const Center(child: CustomEmptyState(icon: Icons.bar_chart_outlined, title: 'Analytics', description: 'System reports will be generated here.'));
}
