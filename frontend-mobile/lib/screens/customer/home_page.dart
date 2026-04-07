import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../core/constants/app_typography.dart';
import '../../core/widgets/custom_text_field.dart';
import '../../core/widgets/restaurant_card.dart';
import '../../core/widgets/custom_loading.dart';
import '../../core/widgets/custom_empty_state.dart';
import '../../providers/auth_provider.dart';
import '../../providers/restaurant_provider.dart';
import '../../providers/order_provider.dart';

class CustomerHomePage extends StatefulWidget {
  const CustomerHomePage({super.key});

  @override
  State<CustomerHomePage> createState() => _CustomerHomePageState();
}

class _CustomerHomePageState extends State<CustomerHomePage> {
  final _searchController = TextEditingController();
  List<dynamic> _filteredRestaurants = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RestaurantProvider>().fetchRestaurants();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _filterRestaurants(String query, List<dynamic> restaurants) {
    setState(() {
      if (query.isEmpty) {
        _filteredRestaurants = restaurants;
      } else {
        _filteredRestaurants = restaurants
            .where((r) => r.name.toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('🍕 FoodHub'),
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
                        child: Text(
                          '${orderProvider.cartItemCount}',
                          style: AppTypography.labelSmall.copyWith(
                            color: AppColors.white,
                          ),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.receipt),
            onPressed: () => context.go('/my-orders'),
          ),
          Consumer<AuthProvider>(
            builder: (context, authProvider, _) {
              return PopupMenuButton(
                itemBuilder: (context) => [
                  const PopupMenuItem(value: 'logout', child: Text('Logout')),
                ],
                onSelected: (value) {
                  if (value == 'logout') {
                    authProvider.logout();
                    context.go('/login');
                  }
                },
              );
            },
          ),
        ],
      ),
      body: Consumer<RestaurantProvider>(
        builder: (context, restaurantProvider, _) {
          if (restaurantProvider.isLoading &&
              restaurantProvider.restaurants.isEmpty) {
            return const CustomLoading(message: 'Loading restaurants...');
          }

          if (_filteredRestaurants.isEmpty &&
              restaurantProvider.restaurants.isNotEmpty) {
            _filteredRestaurants = restaurantProvider.restaurants;
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CustomTextField(
                  label: 'Search Restaurants',
                  hint: 'Find your favorite restaurant...',
                  controller: _searchController,
                  prefixIcon: Icons.search,
                  keyboardType: TextInputType.text,
                  onChanged: (value) =>
                      _filterRestaurants(value, restaurantProvider.restaurants),
                ),
                const SizedBox(height: AppSpacing.xxl),

                Text(
                  'Popular Restaurants',
                  style: AppTypography.headlineSmall.copyWith(
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),

                if (_filteredRestaurants.isEmpty)
                  const CustomEmptyState(
                    icon: Icons.restaurant,
                    title: 'No Restaurants Found',
                    description: 'Try adjusting your search criteria',
                  )
                else
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 1,
                      childAspectRatio: 1.2,
                      mainAxisSpacing: AppSpacing.lg,
                    ),
                    itemCount: _filteredRestaurants.length,
                    itemBuilder: (context, index) {
                      final restaurant = _filteredRestaurants[index];
                      return RestaurantCard(
                        name: restaurant.name ?? 'Unknown',
                        description: restaurant.cuisine ?? 'Restaurant',
                        rating: (restaurant.rating ?? 4.5).toDouble(),
                        reviewCount: restaurant.reviewCount ?? 0,
                        imageUrl: restaurant.imageUrl ?? '',
                        deliveryTime: '${restaurant.deliveryTime ?? 30} min',
                        deliveryFee: '${restaurant.deliveryCharge ?? 0}',
                        onTap: () {
                          context.go('/restaurant/${restaurant.id}');
                        },
                      );
                    },
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
