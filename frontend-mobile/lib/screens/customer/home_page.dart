import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme.dart';
import '../../core/components/custom_button.dart';
import '../../core/components/custom_text_field.dart';
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

class _CustomerHomePageState extends State<CustomerHomePage> {
  final _searchController = TextEditingController();
  List<dynamic> _filteredRestaurants = [];
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RestaurantProvider>().fetchRestaurants();
      context.read<OrderProvider>().fetchOrders();
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
            .where((r) => (r.name??'').toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      _buildExploreTab(),
      _buildOrdersTab(),
      _buildCartTab(),
      _buildAccountTab(),
    ];

    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      body: SafeArea(
        child: AnimatedSwitcher(
          duration: 300.ms,
          transitionBuilder: (child, animation) => FadeTransition(
            opacity: animation,
            child: child,
          ),
          child: pages[_selectedIndex],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) => setState(() => _selectedIndex = index),
        backgroundColor: AppTheme.surfaceDark,
        indicatorColor: AppTheme.primary.withValues(alpha: 0.2),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.explore_outlined),
            selectedIcon: Icon(Icons.explore, color: AppTheme.primary),
            label: 'Explore',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long, color: AppTheme.primary),
            label: 'Orders',
          ),
          NavigationDestination(
            icon: Icon(Icons.shopping_cart_outlined),
            selectedIcon: Icon(Icons.shopping_cart, color: AppTheme.primary),
            label: 'Cart',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person, color: AppTheme.primary),
            label: 'Account',
          ),
        ],
      ),
    );
  }

  Widget _buildExploreTab() {
    return Consumer<RestaurantProvider>(
      builder: (context, restaurantProvider, _) {
        if (restaurantProvider.isLoading && restaurantProvider.restaurants.isEmpty) {
          return const CustomLoading(message: 'Loading restaurants...');
        }

        final restaurants = restaurantProvider.restaurants;
        if (_filteredRestaurants.isEmpty && restaurants.isNotEmpty) {
          _filteredRestaurants = restaurants;
        }

        return RefreshIndicator(
          onRefresh: () async => await restaurantProvider.fetchRestaurants(),
          child: CustomScrollView(
            slivers: [
              SliverAppBar(
                floating: true,
                backgroundColor: AppTheme.primary,
                title: const Text('🍕 FoodHub', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                actions: [
                  IconButton(
                    icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                    onPressed: () {},
                  ).animate().shake(delay: 2.seconds),
                ],
              ),
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    Text('What are you craving?', style: Theme.of(context).textTheme.displayLarge).animate().fadeIn().moveY(),
                    const SizedBox(height: 16),
                    CustomTextField(
                      hintText: 'Search Restaurants',
                      controller: _searchController,
                      prefixIcon: Icons.search,
                    ).animate().fadeIn(delay: 100.ms),
                    const SizedBox(height: 24),
                    Text('Popular Near You', style: Theme.of(context).textTheme.titleLarge).animate().fadeIn(delay: 200.ms),
                    const SizedBox(height: 16),
                    if (_filteredRestaurants.isEmpty)
                      const Center(child: Text('No Restaurants Found', style: TextStyle(color: AppTheme.textSecondary)))
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _filteredRestaurants.length,
                        itemBuilder: (context, index) {
                          final restaurant = _filteredRestaurants[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: RestaurantCard(
                              name: restaurant.name ?? 'Unknown',
                              description: restaurant.cuisine ?? 'Restaurant',
                              rating: (restaurant.rating ?? 4.5).toDouble(),
                              reviewCount: restaurant.reviewCount ?? 0,
                              imageUrl: restaurant.imageUrl ?? '',
                              deliveryTime: '${restaurant.deliveryTime ?? 30} min',
                              deliveryFee: '${restaurant.deliveryCharge ?? 0}',
                              onTap: () => context.go('/restaurant/${restaurant.id}'),
                            ),
                          ).animate().fadeIn(delay: Duration(milliseconds: 300 + (index * 100))).moveY(begin: 20);
                        },
                      ),
                  ]),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildOrdersTab() {
    return Consumer<OrderProvider>(
      builder: (context, orderProvider, _) {
        if (orderProvider.isLoading && orderProvider.orders.isEmpty) {
            return const CustomLoading(message: 'Loading orders...');
        }

        if (orderProvider.orders.isEmpty) {
          return const Center(child: Text('No Orders Found', style: TextStyle(color: AppTheme.textSecondary))); 
        }

        return RefreshIndicator(
          onRefresh: orderProvider.fetchOrders,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(16).copyWith(top: 48),
                color: AppTheme.primary,
                child: const Text('My Orders', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: orderProvider.orders.length,
                  itemBuilder: (context, index) {
                    final order = orderProvider.orders[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: OrderCard(
                        orderId: order.id,
                        restaurantName: order.restaurantName,
                        totalPrice: order.totalAmount.toDouble(),
                        status: order.status,
                        orderDate: order.createdAt ?? DateTime.now(),
                        itemCount: order.items.length,
                        onTap: () => context.go('/order-tracking/${order.id}'),
                      ),
                    ).animate().fadeIn(delay: Duration(milliseconds: 100 * index));
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCartTab() {
    return Consumer<OrderProvider>(
      builder: (context, orderProvider, _) {
        if (orderProvider.cart.isEmpty) {
           return const Center(child: Text('Cart is Empty', style: TextStyle(color: AppTheme.textSecondary)));
        }

        return Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16).copyWith(top: 48),
              color: AppTheme.primary,
              width: double.infinity,
              child: const Text('Your Cart', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
            ),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: orderProvider.cart.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final cartItem = orderProvider.cart[index];
                  return ListTile(
                    tileColor: AppTheme.surfaceDark,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    title: Text(cartItem.item.name, style: Theme.of(context).textTheme.bodyLarge),
                    subtitle: Text('Qty: ${cartItem.quantity} • ₹${cartItem.item.price.toStringAsFixed(0)} each', style: Theme.of(context).textTheme.bodySmall),
                    trailing: Text(
                      '₹${(cartItem.item.price * cartItem.quantity).toStringAsFixed(0)}',
                      style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold),
                    ),
                  ).animate().slideX();
                },
              ),
            ),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: AppTheme.surfaceDark,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildSummaryRow('Subtotal', '₹${orderProvider.subtotal.toStringAsFixed(0)}'),
                  const SizedBox(height: 8),
                  _buildSummaryRow('Delivery Fee', '₹${orderProvider.deliveryFee.toStringAsFixed(0)}'),
                  const Divider(color: AppTheme.borderDark, height: 24),
                  _buildSummaryRow(
                    'Total',
                    '₹${orderProvider.total.toStringAsFixed(0)}',
                    valueStyle: const TextStyle(color: AppTheme.primary, fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  CustomButton(
                    text: 'Checkout',
                    onPressed: () => context.go('/checkout'),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildSummaryRow(String label, String value, {TextStyle? valueStyle}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppTheme.textSecondary)),
        Text(value, style: valueStyle ?? const TextStyle(color: AppTheme.textPrimary)),
      ],
    );
  }

  Widget _buildAccountTab() {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        final user = authProvider.user;
        return Padding(
          padding: const EdgeInsets.all(16.0).copyWith(top: 48),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('My Account', style: Theme.of(context).textTheme.displayLarge),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceDark,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppTheme.borderDark),
                ),
                child: Column(
                  children: [
                    const CircleAvatar(radius: 40, backgroundColor: AppTheme.primary, child: Icon(Icons.person, size: 40, color: Colors.white)),
                    const SizedBox(height: 16),
                    Text(user?.fullName ?? 'Customer', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 4),
                    Text(user?.email ?? 'No email available', style: const TextStyle(color: AppTheme.textSecondary)),
                  ],
                ),
              ).animate().scale(),
              const Spacer(),
              CustomButton(
                text: 'Logout',
                onPressed: () {
                  authProvider.logout();
                  context.go('/login');
                },
                isSecondary: true,
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }
}
