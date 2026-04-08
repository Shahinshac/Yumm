import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../constants/app_colors.dart';
import '../constants/app_typography.dart';

/// Role-based bottom navigation tabs
class RoleNavigationTabs extends StatelessWidget {
  final String currentRole;
  final int activeTabIndex;
  final Function(int) onTabChange;

  const RoleNavigationTabs({
    super.key,
    required this.currentRole,
    required this.activeTabIndex,
    required this.onTabChange,
  });

  @override
  Widget build(BuildContext context) {
    final tabs = _getTabsForRole(currentRole);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        border: Border(top: BorderSide(color: AppColors.border, width: 1)),
      ),
      child: BottomNavigationBar(
        currentIndex: activeTabIndex,
        onTap: onTabChange,
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppColors.white,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSecondary,
        items: tabs
            .map((tab) => BottomNavigationBarItem(
                  icon: Icon(tab['icon']),
                  label: tab['label'],
                ))
            .toList(),
      ),
    );
  }

  List<Map<String, dynamic>> _getTabsForRole(String role) {
    switch (role) {
      case 'customer':
        return [
          {'label': 'Home', 'icon': Icons.home_outlined},
          {'label': 'Search', 'icon': Icons.search_outlined},
          {'label': 'Cart', 'icon': Icons.shopping_cart_outlined},
          {'label': 'Orders', 'icon': Icons.receipt_outlined},
          {'label': 'Profile', 'icon': Icons.person_outlined},
        ];
      case 'restaurant':
        return [
          {'label': 'Dashboard', 'icon': Icons.dashboard_outlined},
          {'label': 'Orders', 'icon': Icons.receipt_outlined},
          {'label': 'Menu', 'icon': Icons.restaurant_menu_outlined},
          {'label': 'Earnings', 'icon': Icons.attach_money_outlined},
          {'label': 'Profile', 'icon': Icons.person_outlined},
        ];
      case 'delivery':
        return [
          {'label': 'Dashboard', 'icon': Icons.dashboard_outlined},
          {'label': 'Orders', 'icon': Icons.local_shipping_outlined},
          {'label': 'Earnings', 'icon': Icons.attach_money_outlined},
          {'label': 'Profile', 'icon': Icons.person_outlined},
        ];
      case 'admin':
        return [
          {'label': 'Dashboard', 'icon': Icons.dashboard_outlined},
          {'label': 'Approvals', 'icon': Icons.check_circle_outlined},
          {'label': 'Users', 'icon': Icons.people_outlined},
          {'label': 'Orders', 'icon': Icons.receipt_outlined},
          {'label': 'Reports', 'icon': Icons.bar_chart_outlined},
        ];
      default:
        return [];
    }
  }
}
