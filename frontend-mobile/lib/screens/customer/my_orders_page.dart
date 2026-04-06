import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../core/widgets/order_card.dart';
import '../../core/widgets/custom_button.dart';
import '../../core/widgets/custom_empty_state.dart';
import '../../core/widgets/custom_loading.dart';
import '../../providers/order_provider.dart';

class MyOrdersPage extends StatefulWidget {
  const MyOrdersPage({Key? key}) : super(key: key);

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
      backgroundColor: AppColors.surface,
      appBar: AppBar(title: const Text('My Orders'), elevation: AppSpacing.elevationMd),
      body: Consumer<OrderProvider>(
        builder: (context, orderProvider, _) {
          if (orderProvider.isLoading) {
            return const CustomLoading(message: 'Loading orders...');
          }

          if (orderProvider.orders.isEmpty) {
            return CustomEmptyState(
              icon: Icons.receipt_outlined,
              title: 'No Orders Yet',
              description: 'Start ordering to see your order history',
              actionButton: CustomButton(
                label: 'Start Ordering',
                onPressed: () => context.go('/home'),
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(AppSpacing.lg),
            itemCount: orderProvider.orders.length,
            itemBuilder: (context, index) {
              final order = orderProvider.orders[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.lg),
                child: OrderCard(
                  orderId: order.id,
                  restaurantName: order.restaurantName,
                  totalPrice: order.totalAmount.toDouble(),
                  status: order.status,
                  orderDate: order.createdAt ?? DateTime.now(),
                  itemCount: order.items.length,
                  onTap: () => context.go('/order-tracking/\${order.id}'),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
