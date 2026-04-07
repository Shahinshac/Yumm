import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../core/constants/app_typography.dart';
import '../../core/widgets/custom_button.dart';
import '../../core/widgets/custom_text_field.dart';
import '../../core/widgets/custom_empty_state.dart';
import '../../providers/order_provider.dart';
import '../../providers/restaurant_provider.dart';

class CheckoutPage extends StatefulWidget {
  const CheckoutPage({Key? key}) : super(key: key);

  @override
  State<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage> {
  final _addressController = TextEditingController();
  final _promoController = TextEditingController();

  @override
  void dispose() {
    _addressController.dispose();
    _promoController.dispose();
    super.dispose();
  }

  void _placeOrder(BuildContext context) {
    final orderProvider = context.read<OrderProvider>();
    if (_addressController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please enter delivery address'),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }
    // For now, use a default or get from navigation args
    // In a real app, restaurantId would be passed through navigation or stored elsewhere
    orderProvider
        .placeOrder('default_restaurant', _addressController.text)
        .then((success) {
      if (success) context.go('/home');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
          title: const Text('Checkout'), elevation: AppSpacing.elevationMd),
      body: Consumer<OrderProvider>(
        builder: (context, orderProvider, _) {
          if (orderProvider.cart.isEmpty) {
            return CustomEmptyState(
              icon: Icons.shopping_cart_outlined,
              title: 'Your Cart is Empty',
              description: 'Add items from restaurants to get started',
              actionButton: CustomButton(
                label: 'Continue Shopping',
                onPressed: () => context.go('/home'),
              ),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Delivery Address',
                    style: AppTypography.titleMedium
                        .copyWith(color: AppColors.textPrimary)),
                const SizedBox(height: AppSpacing.md),
                CustomTextField(
                  label: 'Address',
                  hint: 'Enter your delivery address',
                  controller: _addressController,
                  maxLines: 3,
                  prefixIcon: Icons.location_on,
                ),
                const SizedBox(height: AppSpacing.xxl),
                Text('Order Summary',
                    style: AppTypography.titleMedium
                        .copyWith(color: AppColors.textPrimary)),
                const SizedBox(height: AppSpacing.lg),
                Container(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                    boxShadow: [
                      BoxShadow(
                          color: AppColors.black.withOpacity(0.08),
                          blurRadius: AppSpacing.elevationMd)
                    ],
                  ),
                  child: Column(
                    children: [
                      ...orderProvider.cart.asMap().entries.map((entry) {
                        final item = entry.value;
                        return Padding(
                          padding: const EdgeInsets.only(bottom: AppSpacing.md),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                  child: Text(item.item.name,
                                      style: AppTypography.bodyMedium)),
                              Text('x${item.quantity}',
                                  style: AppTypography.labelSmall.copyWith(
                                      color: AppColors.textSecondary)),
                              Text(
                                  'Rs.${(item.item.price * item.quantity).toStringAsFixed(0)}',
                                  style: AppTypography.labelMedium.copyWith(
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.bold)),
                            ],
                          ),
                        );
                      }).toList(),
                      const Divider(color: AppColors.border),
                      Padding(
                        padding:
                            const EdgeInsets.symmetric(vertical: AppSpacing.md),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Subtotal', style: AppTypography.bodyMedium),
                            Text(
                                'Rs.${orderProvider.subtotal.toStringAsFixed(0)}',
                                style: AppTypography.labelMedium),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.md),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Delivery Fee',
                                style: AppTypography.bodyMedium),
                            Text(
                                'Rs.${orderProvider.deliveryFee.toStringAsFixed(0)}',
                                style: AppTypography.labelMedium),
                          ],
                        ),
                      ),
                      Container(
                        padding:
                            const EdgeInsets.symmetric(vertical: AppSpacing.md),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight.withOpacity(0.1),
                          borderRadius:
                              BorderRadius.circular(AppSpacing.radiusMd),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: AppSpacing.md),
                              child: Text('Total',
                                  style: AppTypography.titleSmall.copyWith(
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.bold)),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: AppSpacing.md),
                              child: Text(
                                  'Rs.${orderProvider.total.toStringAsFixed(0)}',
                                  style: AppTypography.titleSmall.copyWith(
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.xxl),
                CustomButton(
                  label: 'Place Order',
                  onPressed: () => _placeOrder(context),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
