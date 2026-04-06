import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'services/api_service.dart';
import 'services/socket_service.dart';
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
    final apiService = ApiService();
    final socketService = SocketService();

    return MultiProvider(
      providers: [
        Provider<ApiService>(create: (_) => apiService),
        Provider<SocketService>(create: (_) => socketService),
        ChangeNotifierProvider(
            create: (_) => AuthProvider(apiService: apiService)),
        ChangeNotifierProvider(
            create: (_) => RestaurantProvider()),
        ChangeNotifierProvider(
            create: (_) => OrderProvider(apiService: apiService)),
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
        routerConfig: _buildRouter(),
      ),
    );
  }

  GoRouter _buildRouter() {
    return GoRouter(
      initialLocation: '/login',
      redirect: (context, state) {
        final authProvider = context.read<AuthProvider>();
        final isAuthenticated = authProvider.token != null;
        final loc = state.matchedLocation;

        // Unauthenticated → go to login
        if (!isAuthenticated && loc != '/login' && loc != '/register') {
          return '/login';
        }

        // Authenticated on auth pages → redirect to role home
        if (isAuthenticated && (loc == '/login' || loc == '/register')) {
          return _roleHome(authProvider.user?.role);
        }

        return null;
      },
      routes: [
        // ── Auth ──────────────────────────────────────────────────────────
        GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
        GoRoute(path: '/register', builder: (_, __) => const RegisterPage()),

        // ── Generic home: redirect by role ────────────────────────────────
        GoRoute(
          path: '/home',
          redirect: (context, __) {
            final role = context.read<AuthProvider>().user?.role;
            return _roleHome(role);
          },
        ),

        // ── Customer ──────────────────────────────────────────────────────
        GoRoute(
            path: '/customer-home', builder: (_, __) => const CustomerHomePage()),
        GoRoute(
          path: '/restaurant/:id',
          builder: (_, state) =>
              RestaurantMenuPage(restaurantId: state.pathParameters['id']!),
        ),
        GoRoute(path: '/checkout', builder: (_, __) => const CheckoutPage()),
        GoRoute(path: '/my-orders', builder: (_, __) => const MyOrdersPage()),
        GoRoute(
          path: '/order-tracking/:id',
          builder: (_, state) =>
              OrderTrackingPage(orderId: state.pathParameters['id']!),
        ),

        // ── Restaurant ────────────────────────────────────────────────────
        GoRoute(
          path: '/restaurant-dashboard',
          builder: (_, __) => const RestaurantDashboardPage(),
        ),

        // ── Delivery ──────────────────────────────────────────────────────
        GoRoute(
          path: '/delivery-home',
          builder: (_, __) => const delivery.DeliveryHomePage(),
        ),

        // ── Admin ─────────────────────────────────────────────────────────
        GoRoute(
          path: '/admin-dashboard',
          builder: (_, __) => const admin.AdminDashboardPage(),
        ),
      ],
    );
  }

  /// Return the home route for a given role
  static String _roleHome(String? role) {
    switch (role) {
      case 'restaurant': return '/restaurant-dashboard';
      case 'delivery':   return '/delivery-home';
      case 'admin':      return '/admin-dashboard';
      default:           return '/customer-home';
    }
  }
}
