import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../core/widgets/custom_empty_state.dart';

class AdminDashboardPage extends StatefulWidget {
  const AdminDashboardPage({super.key});

  @override
  State<AdminDashboardPage> createState() => _AdminDashboardPageState();
}

class _AdminDashboardPageState extends State<AdminDashboardPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        elevation: AppSpacing.elevationMd,
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          indicatorColor: AppColors.white,
          labelColor: AppColors.white,
          unselectedLabelColor: AppColors.white70,
          tabs: const [
            Tab(icon: Icon(Icons.dashboard_outlined), text: 'Dashboard'),
            Tab(icon: Icon(Icons.check_circle_outlined), text: 'Approvals'),
            Tab(icon: Icon(Icons.people_outlined), text: 'Users'),
            Tab(icon: Icon(Icons.receipt_outlined), text: 'Orders'),
            Tab(icon: Icon(Icons.bar_chart_outlined), text: 'Reports'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildSummaryTab(),
          _buildApprovalsTab(),
          _buildUsersTab(),
          _buildOrdersTab(),
          _buildReportsTab(),
        ],
      ),
    );
  }

  Widget _buildSummaryTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildStatCard('Active Users', '1,264', Icons.people_outline),
          _buildStatCard('Pending Approvals', '8', Icons.check_circle_outline),
          _buildStatCard('Open Orders', '42', Icons.receipt_long_outlined),
          _buildStatCard('Weekly Revenue', '₹72,190', Icons.bar_chart_outlined),
          const SizedBox(height: AppSpacing.lg),
          const Text(
            'Admin quick actions are coming soon. Use these tabs to manage approvals, users, orders, and reports.',
            style: TextStyle(fontSize: 14, color: Colors.black87),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.lg),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primaryLight.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppColors.primary),
            ),
            const SizedBox(width: AppSpacing.lg),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: const TextStyle(
                        fontSize: 14, color: AppColors.textSecondary)),
                const SizedBox(height: 4),
                Text(value,
                    style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildApprovalsTab() {
    return const CustomEmptyState(
      icon: Icons.check_circle_outline,
      title: 'Approvals',
      description:
          'No pending approvals right now. This is where new users and restaurants will appear for review.',
    );
  }

  Widget _buildUsersTab() {
    return const CustomEmptyState(
      icon: Icons.people_outlined,
      title: 'Users',
      description:
          'User management will appear here. You can review customers, restaurants, and delivery partners.',
    );
  }

  Widget _buildOrdersTab() {
    return const CustomEmptyState(
      icon: Icons.receipt_outlined,
      title: 'Orders',
      description:
          'View and manage order activity from across the platform in this section.',
    );
  }

  Widget _buildReportsTab() {
    return const CustomEmptyState(
      icon: Icons.bar_chart_outlined,
      title: 'Reports',
      description:
          'Analytics and reporting will be visible here once reports are implemented.',
    );
  }
}
