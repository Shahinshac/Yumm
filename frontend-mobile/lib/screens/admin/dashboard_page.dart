import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../core/widgets/custom_empty_state.dart';

class AdminDashboardPage extends StatelessWidget {
  const AdminDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        elevation: AppSpacing.elevationMd,
      ),
      body: const CustomEmptyState(
        icon: Icons.admin_panel_settings,
        title: 'Admin Dashboard',
        description: 'System administration and analytics features coming soon',
      ),
    );
  }
}
