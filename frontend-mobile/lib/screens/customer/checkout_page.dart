import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme.dart';
import '../../core/components/custom_button.dart';
import '../../core/components/custom_text_field.dart';
import '../../core/widgets/custom_empty_state.dart';
import '../../providers/order_provider.dart';

class CheckoutPage extends StatefulWidget {
  const CheckoutPage({super.key});

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
        const SnackBar(
          content: Text('Please enter delivery address'),
          backgroundColor: Colors.redAccent,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }
    
    orderProvider
        .placeOrder('default_restaurant', _addressController.text)
        .then((success) {
      if (success) context.go('/home');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        title: const Text('Checkout', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: AppTheme.surfaceDark,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Consumer<OrderProvider>(
        builder: (context, orderProvider, _) {
          if (orderProvider.cart.isEmpty) {
            return CustomEmptyState(
              icon: Icons.shopping_cart_outlined,
              title: 'Your Cart is Empty',
              description: 'Add items from restaurants to get started',
              actionButton: CustomButton(
                text: 'Continue Shopping',
                onPressed: () => context.go('/home'),
              ),
            ).animate().fadeIn().moveY(begin: 20);
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Delivery Details', style: Theme.of(context).textTheme.titleLarge).animate().fadeIn(),
                const SizedBox(height: 16),
                CustomTextField(
                  hintText: 'Enter your delivery address',
                  controller: _addressController,
                  prefixIcon: Icons.location_on,
                ).animate().fadeIn(delay: 50.ms).slideX(begin: 0.1),
                
                const SizedBox(height: 32),
                
                Text('Order Summary', style: Theme.of(context).textTheme.titleLarge).animate().fadeIn(delay: 100.ms),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceDark,
                    border: Border.all(color: AppTheme.borderDark),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Column(
                    children: [
                      ...orderProvider.cart.asMap().entries.map((entry) {
                        final index = entry.key;
                        final item = entry.value;
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(item.item.name, style: const TextStyle(color: Colors.white, fontSize: 16)),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppTheme.backgroundDark,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text('x${item.quantity}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
                              ),
                              const SizedBox(width: 16),
                              Text(
                                '₹${(item.item.price * item.quantity).toStringAsFixed(0)}',
                                style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                            ],
                          ),
                        ).animate().fadeIn(delay: Duration(milliseconds: 150 + (index * 50)));
                      }),
                      const Divider(color: AppTheme.borderDark, height: 32),
                      
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Subtotal', style: TextStyle(color: AppTheme.textSecondary, fontSize: 16)),
                            Text('₹${orderProvider.subtotal.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 16)),
                          ],
                        ),
                      ).animate().fadeIn(delay: 300.ms),
                      
                      Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Delivery Fee', style: TextStyle(color: AppTheme.textSecondary, fontSize: 16)),
                            Text('₹${orderProvider.deliveryFee.toStringAsFixed(0)}', style: const TextStyle(color: Colors.white, fontSize: 16)),
                          ],
                        ),
                      ).animate().fadeIn(delay: 350.ms),
                      
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.primary.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Total', style: TextStyle(color: AppTheme.primary, fontSize: 20, fontWeight: FontWeight.bold)),
                            Text(
                              '₹${orderProvider.total.toStringAsFixed(0)}',
                              style: const TextStyle(color: AppTheme.primary, fontSize: 24, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ).animate().fadeIn(delay: 400.ms).scale(begin: const Offset(0.95, 0.95)),
                    ],
                  ),
                ),
                
                const SizedBox(height: 48),
                CustomButton(
                  text: 'Place Order',
                  onPressed: () => _placeOrder(context),
                ).animate().fadeIn(delay: 500.ms).moveY(begin: 20),
              ],
            ),
          );
        },
      ),
    );
  }
}
