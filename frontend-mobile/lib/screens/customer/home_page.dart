import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../core/constants/app_typography.dart';
import '../../core/widgets/custom_button.dart';
import '../../core/widgets/custom_text_field.dart';
import '../../core/widgets/restaurant_card.dart';
import '../../core/widgets/custom_loading.dart';
import '../../core/widgets/custom_empty_state.dart';
import '../../core/widgets/order_card.dart';
import '../../providers/auth_provider.dart';
import '../../providers/restaurant_provider.dart';
import '../../providers/order_provider.dart';

class CustomerHomePage extends StatefulWidget {
  const CustomerHomePage({super.key});

  @override
  State<CustomerHomePage> createState() => _CustomerHomePageState();
}

class _CustomerHomePageState extends State<CustomerHomePage>
    with SingleTickerProviderStateMixin {
  final _searchController = TextEditingController();
  List<dynamic> _filteredRestaurants = [];
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RestaurantProvider>().fetchRestaurants();
      context.read<OrderProvider>().fetchOrders();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _tabController.dispose();
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
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'logout') {
                context.read<AuthProvider>().logout();
                context.go('/login');
              }
            },
            itemBuilder: (_) => [
              const PopupMenuItem(value: 'logout', child: Text('Logout')),
            ],
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.white,
          labelColor: AppColors.white,
          unselectedLabelColor: AppColors.white70,
          isScrollable: true,
          tabs: const [
            Tab(icon: Icon(Icons.explore_outlined), text: 'Explore'),
            Tab(icon: Icon(Icons.receipt_long_outlined), text: 'Orders'),
            Tab(icon: Icon(Icons.shopping_cart_outlined), text: 'Cart'),
            Tab(icon: Icon(Icons.person_outline), text: 'Account'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildExploreTab(),
          _buildOrdersTab(),
          _buildCartTab(),
          _buildAccountTab(),
        ],
      ),
    );
  }

  Widget _buildExploreTab() {
    return Consumer<RestaurantProvider>(
      builder: (context, restaurantProvider, _) {
        if (restaurantProvider.isLoading &&
            restaurantProvider.restaurants.isEmpty) {
          return const CustomLoading(message: 'Loading restaurants...');
        }

        final restaurants = restaurantProvider.restaurants;
        if (_filteredRestaurants.isEmpty && restaurants.isNotEmpty) {
          _filteredRestaurants = restaurants;
        }

        return RefreshIndicator(
          onRefresh: () async {
            await restaurantProvider.fetchRestaurants();
          },
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            physics: const AlwaysScrollableScrollPhysics(),
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
                const SizedBox(height: AppSpacing.xl),
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
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
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
          ),
        );
      },
    );
  }

  Widget _buildOrdersTab() {
    return Consumer<OrderProvider>(
      builder: (context, orderProvider, _) {
        if (orderProvider.isLoading) {
          return const CustomLoading(message: 'Loading orders...');
        }

        if (orderProvider.orders.isEmpty) {
          return CustomEmptyState(
            icon: Icons.receipt_long_outlined,
            title: 'No Orders Yet',
            description: 'Your recent orders will appear here.',
            actionButton: CustomButton(
              label: 'Browse Restaurants',
              onPressed: () => _tabController.animateTo(0),
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: orderProvider.fetchOrders,
          child: ListView.builder(
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
                  onTap: () => context.go('/order-tracking/${order.id}'),
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildCartTab() {
    return Consumer<OrderProvider>(
      builder: (context, orderProvider, _) {
        if (orderProvider.cart.isEmpty) {
          return CustomEmptyState(
            icon: Icons.shopping_cart_outlined,
            title: 'Your Cart is Empty',
            description: 'Add items from restaurants to start your order.',
            actionButton: CustomButton(
              label: 'Start Shopping',
              onPressed: () => _tabController.animateTo(0),
            ),
          );
        }

        return Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Cart Summary',
                style: AppTypography.headlineSmall.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Expanded(
                child: ListView.separated(
                  itemCount: orderProvider.cart.length,
                  separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.md),
                  itemBuilder: (context, index) {
                    final cartItem = orderProvider.cart[index];
                    return ListTile(
                      tileColor: AppColors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                      ),
                      title: Text(cartItem.item.name,
                          style: AppTypography.bodyLarge),
                      subtitle: Text(
                        'Qty: ${cartItem.quantity} • ₹${cartItem.item.price.toStringAsFixed(0)} each',
                        style: AppTypography.bodySmall,
                      ),
                      trailing: Text(
                        '₹${(cartItem.item.price * cartItem.quantity).toStringAsFixed(0)}',
                        style: AppTypography.titleSmall.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                ),
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    children: [
                      _buildSummaryRow('Subtotal',
                          '₹${orderProvider.subtotal.toStringAsFixed(0)}'),
                      const SizedBox(height: AppSpacing.sm),
                      _buildSummaryRow('Delivery Fee',
                          '₹${orderProvider.deliveryFee.toStringAsFixed(0)}'),
                      const Divider(height: AppSpacing.xl),
                      _buildSummaryRow(
                        'Total',
                        '₹${orderProvider.total.toStringAsFixed(0)}',
                        valueStyle: AppTypography.titleMedium.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      CustomButton(
                        label: 'Checkout',
                        onPressed: () => context.go('/checkout'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSummaryRow(String label, String value,
      {TextStyle? valueStyle}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTypography.bodyMedium),
        Text(value, style: valueStyle ?? AppTypography.bodyMedium),
      ],
    );
  }

  Widget _buildAccountTab() {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        final user = authProvider.user;
        return Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'My Account',
                style: AppTypography.headlineSmall.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user?.fullName ?? 'Customer',
                          style: AppTypography.titleMedium),
                      const SizedBox(height: AppSpacing.sm),
                      Text(user?.email ?? 'No email available',
                          style: AppTypography.bodyMedium.copyWith(
                            color: AppColors.textSecondary,
                          )),
                      const SizedBox(height: AppSpacing.md),
                      Text('Role: ${user?.role ?? 'customer'}',
                          style: AppTypography.bodyMedium),
                      const SizedBox(height: AppSpacing.sm),
                      Text('Stay logged in for faster checkout and order tracking.',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textTertiary,
                          )),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              CustomButton(
                label: 'View Order History',
                onPressed: () => _tabController.animateTo(1),
              ),
              const SizedBox(height: AppSpacing.md),
              CustomButton(
                label: 'View Cart',
                onPressed: () => _tabController.animateTo(2),
              ),
              const SizedBox(height: AppSpacing.md),
              CustomButton(
                label: 'Logout',
                variant: ButtonVariant.danger,
                onPressed: () {
                  authProvider.logout();
                  context.go('/login');
                },
              ),
            ],
          ),
        );
      },
    );
  }
}
