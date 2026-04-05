import 'package:flutter/material.dart';

class DeliveryHomePage extends StatelessWidget {
  const DeliveryHomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Delivery Home')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.local_shipping, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            const Text('Delivery Partner Dashboard'),
            const SizedBox(height: 8),
            const Text(
              'Accept and track deliveries',
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
                '• View available orders\n'
                '• Accept delivery requests\n'
                '• Real-time GPS tracking\n'
                '• Update delivery status\n'
                '• View earnings history',
                textAlign: TextAlign.left,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
