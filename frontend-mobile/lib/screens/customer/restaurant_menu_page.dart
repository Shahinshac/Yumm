import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme.dart';
import '../../core/widgets/food_item_card.dart';
import '../../core/widgets/custom_loading.dart';
import '../../core/widgets/rating_widget.dart';
import '../../providers/restaurant_provider.dart';
import '../../providers/order_provider.dart';

class RestaurantMenuPage extends StatefulWidget {
  final String restaurantId;

  const RestaurantMenuPage({super.key, required this.restaurantId});

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
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        title: const Text('Menu', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: AppTheme.surfaceDark,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          Consumer<OrderProvider>(
            builder: (context, orderProvider, _) {
              return Stack(
                alignment: Alignment.center,
                children: [
                  IconButton(
                    icon: const Icon(Icons.shopping_cart, color: Colors.white),
                    onPressed: () => context.go('/checkout'),
                  ),
                  if (orderProvider.cartItemCount > 0)
                    Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: AppTheme.primary,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          '${orderProvider.cartItemCount}',
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ).animate().scale(),
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
            return const Center(child: Text('Restaurant not found', style: TextStyle(color: AppTheme.textSecondary)));
          }

          final menuItems = restaurantProvider.menuItems;

          return CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Container(
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    color: AppTheme.surfaceDark,
                    boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4))],
                  ),
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          color: AppTheme.backgroundDark,
                          border: Border.all(color: AppTheme.borderDark),
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: const Center(child: Text('🍕', style: TextStyle(fontSize: 64))),
                      ).animate().scale(),
                      const SizedBox(height: 24),
                      Text(restaurant.name, style: Theme.of(context).textTheme.displayLarge).animate().fadeIn().moveY(),
                      const SizedBox(height: 8),
                      Text(restaurant.category ?? 'Restaurant', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 16)).animate().fadeIn(delay: 100.ms),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          RatingWidget(rating: (restaurant.rating ?? 4.5).toDouble(), reviewCount: restaurant.reviewCount ?? 0),
                          const SizedBox(width: 24),
                          const Icon(Icons.access_time, color: AppTheme.textSecondary, size: 20),
                          const SizedBox(width: 8),
                          Text('${restaurant.deliveryTime ?? 30} min', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 16)),
                        ],
                      ).animate().fadeIn(delay: 200.ms),
                    ],
                  ),
                ),
              ),
              const SliverPadding(padding: EdgeInsets.only(top: 32)),
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                sliver: SliverToBoxAdapter(
                  child: Text('Menu Options', style: Theme.of(context).textTheme.titleLarge).animate().fadeIn(delay: 300.ms),
                ),
              ),
              const SliverPadding(padding: EdgeInsets.only(top: 24)),
              if (menuItems.isEmpty)
                const SliverToBoxAdapter(
                  child: Center(child: Padding(padding: EdgeInsets.all(48), child: Text('No menu items available', style: TextStyle(color: AppTheme.textSecondary)))),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  sliver: SliverGrid(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.70,
                      mainAxisSpacing: 24,
                      crossAxisSpacing: 16,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
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
                        ).animate().fadeIn(delay: Duration(milliseconds: 300 + (index * 100))).slideY(begin: 0.1);
                      },
                      childCount: menuItems.length,
                    ),
                  ),
                ),
              const SliverPadding(padding: EdgeInsets.only(bottom: 64)),
            ],
          );
        },
      ),
    );
  }
}
