import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'services/api_service.dart';
import 'providers/auth_provider.dart';
import 'providers/restaurant_provider.dart';
import 'providers/order_provider.dart';
import 'pages/login_page.dart';
import 'pages/register_page.dart';
import 'pages/customer/home_page.dart';
import 'pages/customer/restaurant_menu_page.dart';
import 'pages/customer/checkout_page.dart';
import 'pages/customer/my_orders_page.dart';
import 'pages/customer/order_tracking_page.dart';
import 'pages/restaurant/dashboard_page.dart';
import 'pages/delivery/home_page.dart' as delivery;
import 'pages/admin/dashboard_page.dart' as admin;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const FoodHubApp());
}

class FoodHubApp extends StatelessWidget {
  const FoodHubApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<ApiService>(create: (_) => ApiService()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => RestaurantProvider()),
        ChangeNotifierProvider(create: (_) => OrderProvider()),
      ],
      child: MaterialApp.router(
        title: '🍕 FoodHub',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primaryColor: const Color(0xFFff6b35),
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFff6b35)),
          fontFamily: 'Segoe UI',
        ),
        routerConfig: _buildRouter(context),
      ),
    );
  }

  GoRouter _buildRouter(BuildContext context) {
    return GoRouter(
      initialLocation: '/login',
      redirect: (context, state) {
        final authProvider = context.read<AuthProvider>();
        final isAuthenticated = authProvider.token != null;

        if (!isAuthenticated &&
            state.location != '/login' &&
            state.location != '/register') {
          return '/login';
        }
        if (isAuthenticated &&
            (state.location == '/login' || state.location == '/register')) {
          return '/home';
        }
        return null;
      },
      routes: [
        // Auth Routes
        GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
        GoRoute(
          path: '/register',
          builder: (context, state) => const RegisterPage(),
        ),

        // Customer Routes
        GoRoute(
          path: '/home',
          builder: (context, state) => const CustomerHomePage(),
        ),
        GoRoute(
          path: '/restaurant/:id',
          builder: (context, state) =>
              RestaurantMenuPage(restaurantId: state.pathParameters['id']!),
        ),
        GoRoute(
          path: '/checkout',
          builder: (context, state) => const CheckoutPage(),
        ),
        GoRoute(
          path: '/my-orders',
          builder: (context, state) => const MyOrdersPage(),
        ),
        GoRoute(
          path: '/order-tracking/:id',
          builder: (context, state) =>
              OrderTrackingPage(orderId: state.pathParameters['id']!),
        ),

        // Restaurant Routes
        GoRoute(
          path: '/restaurant-dashboard',
          builder: (context, state) => const RestaurantDashboardPage(),
        ),

        // Delivery Routes
        GoRoute(
          path: '/delivery-home',
          builder: (context, state) => const delivery.DeliveryHomePage(),
        ),

        // Admin Routes
        GoRoute(
          path: '/admin-dashboard',
          builder: (context, state) => const admin.AdminDashboardPage(),
        ),
      ],
    );
  }
}
