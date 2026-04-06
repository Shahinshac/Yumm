import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../core/constants/app_typography.dart';
import '../../core/widgets/food_item_card.dart';
import '../../core/widgets/custom_loading.dart';
import '../../core/widgets/rating_widget.dart';
import '../../providers/restaurant_provider.dart';
import '../../providers/order_provider.dart';

class RestaurantMenuPage extends StatefulWidget {
  final String restaurantId;

  const RestaurantMenuPage({Key? key, required this.restaurantId})
    : super(key: key);

  @override
  State<RestaurantMenuPage> createState() => _RestaurantMenuPageState();
}

class _RestaurantMenuPageState extends State<RestaurantMenuPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RestaurantProvider>().fetchRestaurant(widget.restaurantId);
      context.read<RestaurantProvider>().fetchMenuItems(widget.restaurantId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('Menu'),
        elevation: AppSpacing.elevationMd,
        actions: [
          Consumer<OrderProvider>(
            builder: (context, orderProvider, _) {
              return Stack(
                children: [
                  IconButton(
                    icon: const Icon(Icons.shopping_cart),
                    onPressed: () => context.go('/checkout'),
                  ),
                  if (orderProvider.cartItemCount > 0)
                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        padding: const EdgeInsets.all(AppSpacing.xs),
                        decoration: BoxDecoration(
                          color: AppColors.error,
                          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                        ),
                        child: Text('${orderProvider.cartItemCount}', style: AppTypography.labelSmall.copyWith(color: AppColors.white)),
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      ),
      body: Consumer2<RestaurantProvider, OrderProvider>(
        builder: (context, restaurantProvider, orderProvider, _) {
          if (restaurantProvider.isLoading) {
            return const CustomLoading(message: 'Loading menu...');
          }

          final restaurant = restaurantProvider.selectedRestaurant;
          if (restaurant == null) {
            return const Center(child: Text('Restaurant not found'));
          }

          final menuItems = restaurantProvider.menuItems;

          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    boxShadow: [BoxShadow(color: AppColors.black.withOpacity(0.1), blurRadius: AppSpacing.elevationMd, offset: const Offset(0, 2))],
                  ),
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [AppColors.primary, AppColors.secondary]),
                          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                        ),
                        child: const Center(child: Text('🍕', style: TextStyle(fontSize: 64))),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      Text(restaurant.name, style: AppTypography.headlineSmall.copyWith(color: AppColors.textPrimary)),
                      const SizedBox(height: AppSpacing.sm),
                      Text(restaurant.category ?? 'Restaurant', style: AppTypography.bodyMedium.copyWith(color: AppColors.textSecondary)),
                      const SizedBox(height: AppSpacing.md),
                      Row(
                        children: [
                          RatingWidget(rating: (restaurant.rating ?? 4.5).toDouble(), reviewCount: restaurant.reviewCount ?? 0),
                          const SizedBox(width: AppSpacing.lg),
                          Icon(Icons.access_time, color: AppColors.textTertiary, size: 18),
                          const SizedBox(width: AppSpacing.xs),
                          Text('${restaurant.deliveryTime ?? 30} min', style: AppTypography.bodySmall.copyWith(color: AppColors.textTertiary)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.xxl),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Menu', style: AppTypography.headlineSmall.copyWith(color: AppColors.textPrimary)),
                      const SizedBox(height: AppSpacing.lg),
                      if (menuItems.isEmpty)
                        const Center(child: Padding(padding: EdgeInsets.all(AppSpacing.xxl), child: Text('No menu items')))
                      else
                        GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.75,
                            mainAxisSpacing: AppSpacing.lg,
                            crossAxisSpacing: AppSpacing.lg,
                          ),
                          itemCount: menuItems.length,
                          itemBuilder: (context, index) {
                            final item = menuItems[index];
                            return FoodItemCard(
                              name: item.name ?? 'Item',
                              description: item.description ?? '',
                              price: (item.price ?? 0).toDouble(),
                              rating: (item.rating ?? 4.0).toDouble(),
                              imageUrl: item.imageUrl ?? '',
                              quantity: 0,
                              onAddToCart: () => orderProvider.addToCart(item),
                              onQuantityChanged: (qty) => orderProvider.updateQuantity(item.id, qty),
                            );
                          },
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.xxl),
              ],
            ),
          );
        },
      ),
    );
  }
}
