import 'package:flutter/material.dart';

class RestaurantDashboardPage extends StatelessWidget {
  const RestaurantDashboardPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Restaurant Dashboard')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.restaurant, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            const Text('Restaurant Dashboard'),
            const SizedBox(height: 8),
            const Text(
              'Manage orders, menus, and analytics',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 32),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                'Features coming soon:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 16),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                '• View incoming orders\n'
                '• Update order status\n'
                '• Manage menu items\n'
                '• View analytics\n'
                '• Track earnings',
                textAlign: TextAlign.left,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
