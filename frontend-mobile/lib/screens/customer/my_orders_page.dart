import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme.dart';
import '../../core/widgets/order_card.dart';
import '../../core/components/custom_button.dart';
import '../../core/widgets/custom_empty_state.dart';
import '../../core/widgets/custom_loading.dart';
import '../../providers/order_provider.dart';

class MyOrdersPage extends StatefulWidget {
  const MyOrdersPage({super.key});

  @override
  State<MyOrdersPage> createState() => _MyOrdersPageState();
}

class _MyOrdersPageState extends State<MyOrdersPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrderProvider>().fetchOrders();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        title: const Text('My Orders', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: AppTheme.surfaceDark,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Consumer<OrderProvider>(
        builder: (context, orderProvider, _) {
          if (orderProvider.isLoading && orderProvider.orders.isEmpty) {
            return const CustomLoading(message: 'Loading orders...');
          }

          if (orderProvider.orders.isEmpty) {
            return CustomEmptyState(
              icon: Icons.receipt_outlined,
              title: 'No Orders Yet',
              description: 'Start ordering to see your order history',
              actionButton: CustomButton(
                text: 'Start Ordering',
                onPressed: () => context.go('/home'),
              ),
            ).animate().fadeIn().scale();
          }

          return RefreshIndicator(
            onRefresh: orderProvider.fetchOrders,
            child: ListView.builder(
              padding: const EdgeInsets.all(24.0),
              itemCount: orderProvider.orders.length,
              itemBuilder: (context, index) {
                final order = orderProvider.orders[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: OrderCard(
                    orderId: order.id,
                    restaurantName: order.restaurantName,
                    totalPrice: order.totalAmount.toDouble(),
                    status: order.status,
                    orderDate: order.createdAt ?? DateTime.now(),
                    itemCount: order.items.length,
                    onTap: () => context.go('/order-tracking/${order.id}'),
                  ),
                ).animate().fadeIn(delay: Duration(milliseconds: 100 * index)).slideX();
              },
            ),
          );
        },
      ),
    );
  }
}
