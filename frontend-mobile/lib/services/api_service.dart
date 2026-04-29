import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Use Render backend for production
  static const String baseUrl = 'https://yumm-ym2m.onrender.com/api';

  // Alternative: For Vercel serverless (requires different setup)
  // static const String baseUrl = '/api';

  String? _token;

  ApiService() {
    _loadToken();
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('jwt_token');
  }

  Future<void> setToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('jwt_token', token);
  }

  Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
  }

  Map<String, String> _getHeaders({bool includeAuth = true}) {
    final headers = {'Content-Type': 'application/json'};
    if (includeAuth && _token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  // ===== AUTH ENDPOINTS =====
  Future<Map<String, dynamic>> register(
    String username,
    String email,
    String password,
    String phone,
    String fullName,
    String role,
  ) async {
    // Use role-specific endpoints for restaurant/delivery
    // Customer/other roles use the legacy endpoint
    String endpoint = '$baseUrl/auth/register';

    if (role == 'restaurant') {
      // Restaurant registration - requires approval
      endpoint = '$baseUrl/auth/register/restaurant';
      final response = await http.post(
        Uri.parse(endpoint),
        headers: _getHeaders(includeAuth: false),
        body: jsonEncode({
          'name': fullName,
          'email': email,
          'phone': phone,
          'shop_name': username, // Use username as shop name
          'address': 'To be updated after approval',
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final err = jsonDecode(response.body);
        throw Exception(err['error'] ?? 'Registration failed');
      }
    } else if (role == 'delivery') {
      // Delivery registration - requires approval
      endpoint = '$baseUrl/auth/register/delivery';
      final response = await http.post(
        Uri.parse(endpoint),
        headers: _getHeaders(includeAuth: false),
        body: jsonEncode({
          'name': fullName,
          'email': email,
          'phone': phone,
          'vehicle_type': 'bike', // Default vehicle
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final err = jsonDecode(response.body);
        throw Exception(err['error'] ?? 'Registration failed');
      }
    } else {
      // Customer registration - legacy endpoint (auto-approved for demo)
      final response = await http.post(
        Uri.parse(endpoint),
        headers: _getHeaders(includeAuth: false),
        body: jsonEncode({
          'username': username,
          'email': email,
          'password': password,
          'phone': phone,
          'full_name': fullName,
          'role': role,
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final err = jsonDecode(response.body);
        throw Exception(err['error'] ?? 'Registration failed');
      }
    }
  }

  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: _getHeaders(includeAuth: false),
      body: jsonEncode({'username': username, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await setToken(data['access_token']);
      return data;
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Login failed');
    }
  }

  Future<Map<String, dynamic>> googleLogin(String idToken) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/google-login'),
      headers: _getHeaders(includeAuth: false),
      body: jsonEncode({'id_token': idToken}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await setToken(data['access_token']);
      return data;
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Google login failed');
    }
  }

  Future<Map<String, dynamic>> getCurrentUser() async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get current user');
    }
  }

  // ===== RESTAURANT ENDPOINTS =====
  Future<List<dynamic>> getRestaurants() async {
    final response = await http.get(
      Uri.parse('$baseUrl/restaurants'),
      headers: _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['restaurants'] ?? [];
    } else {
      throw Exception('Failed to fetch restaurants');
    }
  }

  Future<Map<String, dynamic>> getRestaurant(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/restaurants/$id'),
      headers: _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get restaurant');
    }
  }

  Future<List<dynamic>> getRestaurantMenu(String restaurantId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/restaurants/$restaurantId/menu'),
      headers: _getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['menu_items'] ?? [];
    } else {
      throw Exception('Failed to fetch menu');
    }
  }

  // ===== RESTAURANT MENU MANAGEMENT =====
  Future<Map<String, dynamic>> addMenuItem(
    String restaurantId,
    Map<String, dynamic> itemData,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/restaurants/$restaurantId/menu'),
      headers: _getHeaders(),
      body: jsonEncode(itemData),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to add menu item');
    }
  }

  Future<Map<String, dynamic>> updateMenuItem(
    String restaurantId,
    String itemId,
    Map<String, dynamic> itemData,
  ) async {
    final response = await http.put(
      Uri.parse('$baseUrl/restaurants/$restaurantId/menu/$itemId'),
      headers: _getHeaders(),
      body: jsonEncode(itemData),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to update menu item');
    }
  }

  Future<void> deleteMenuItem(String restaurantId, String itemId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/restaurants/$restaurantId/menu/$itemId'),
      headers: _getHeaders(),
    );

    if (response.statusCode != 200) {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to delete menu item');
    }
  }

  /// Get all orders for a restaurant
  Future<List<dynamic>> getRestaurantOrders(
    String restaurantId, {
    String? status,
  }) async {
    var url = '$baseUrl/restaurants/$restaurantId/orders';
    if (status != null) url += '?status=$status';

    final response = await http.get(Uri.parse(url), headers: _getHeaders());

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['orders'] ?? [];
    } else {
      throw Exception('Failed to fetch restaurant orders');
    }
  }

  // ===== ORDER ENDPOINTS =====
  Future<Map<String, dynamic>> createOrder(
    Map<String, dynamic> orderData,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/orders'),
      headers: _getHeaders(),
      body: jsonEncode(orderData),
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to create order');
    }
  }

  Future<List<dynamic>> getUserOrders() async {
    final response = await http.get(
      Uri.parse('$baseUrl/orders'),
      headers: _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['orders'] ?? [];
    } else {
      throw Exception('Failed to fetch orders');
    }
  }

  Future<Map<String, dynamic>> getOrder(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/orders/$id'),
      headers: _getHeaders(),
    );

    if (response.statusCode == 200) {
      // Backend returns the order dict directly (not wrapped)
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get order');
    }
  }

  Future<Map<String, dynamic>> trackOrder(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/orders/$id/track'),
      headers: _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to track order');
    }
  }

  Future<Map<String, dynamic>> updateOrderStatus(
    String orderId,
    String status,
  ) async {
    final response = await http.put(
      Uri.parse('$baseUrl/orders/$orderId/status'),
      headers: _getHeaders(),
      body: jsonEncode({'status': status}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to update order status');
    }
  }

  // ===== PROMO CODE ENDPOINTS =====
  Future<Map<String, dynamic>> validatePromoCode(String code) async {
    final response = await http.post(
      Uri.parse('$baseUrl/promo/validate'),
      headers: _getHeaders(),
      body: jsonEncode({'code': code}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Invalid promo code');
    }
  }

  // ===== REVIEW ENDPOINTS =====
  Future<Map<String, dynamic>> createReview(
    String orderId,
    int rating,
    String comment,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/reviews'),
      headers: _getHeaders(),
      body: jsonEncode({
        'order_id': orderId,
        'rating': rating,
        'comment': comment,
      }),
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create review');
    }
  }

  // ===== DELIVERY ENDPOINTS =====
  Future<List<dynamic>> getAvailableOrders() async {
    final response = await http.get(
      Uri.parse('$baseUrl/delivery/available-orders'),
      headers: _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['orders'] ?? [];
    } else {
      throw Exception('Failed to fetch available orders');
    }
  }

  Future<Map<String, dynamic>> acceptOrder(String orderId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/delivery/accept-order/$orderId'),
      headers: _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to accept order');
    }
  }

  Future<List<dynamic>> getMyDeliveryOrders() async {
    final response = await http.get(
      Uri.parse('$baseUrl/delivery/my-orders'),
      headers: _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body)['orders'] ?? [];
    } else {
      throw Exception('Failed to fetch delivery orders');
    }
  }

  /// Update delivery partner location across all active orders
  Future<Map<String, dynamic>> updateDeliveryLocation(
    double lat,
    double lng,
  ) async {
    final response = await http.put(
      Uri.parse('$baseUrl/delivery/update-location'),
      headers: _getHeaders(),
      body: jsonEncode({'lat': lat, 'lng': lng}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to update location');
    }
  }

  /// Update location for a specific order (more precise)
  Future<Map<String, dynamic>> updateOrderDeliveryLocation(
    String orderId,
    double lat,
    double lng,
  ) async {
    final response = await http.put(
      Uri.parse('$baseUrl/delivery/$orderId/update-location'),
      headers: _getHeaders(),
      body: jsonEncode({'lat': lat, 'lng': lng}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to update order location');
    }
  }

  Future<Map<String, dynamic>> markOrderDelivered(String orderId) async {
    final response = await http.put(
      Uri.parse('$baseUrl/delivery/$orderId/mark-delivered'),
      headers: _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to mark order as delivered');
    }
  }

  Future<Map<String, dynamic>> getDeliveryStats() async {
    final response = await http.get(
      Uri.parse('$baseUrl/delivery/stats'),
      headers: _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to fetch delivery stats');
    }
  }

  // ===== ADMIN ENDPOINTS =====
  Future<Map<String, dynamic>> getAdminDashboard() async {
    final response = await http.get(
      Uri.parse('$baseUrl/admin/dashboard'),
      headers: _getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to fetch admin dashboard');
    }
  }

  // ===== GENERIC HTTP METHODS =====
  Future<Map<String, dynamic>> put(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    final response = await http.put(
      Uri.parse('$baseUrl$endpoint'),
      headers: _getHeaders(),
      body: jsonEncode(body),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Request failed');
    }
  }

  Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: _getHeaders(),
      body: jsonEncode(body),
    );

    if (response.statusCode == 200 ||
        response.statusCode == 201 ||
        response.statusCode == 202) {
      return jsonDecode(response.body);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Request failed');
    }
  }

  // ===== ORDER ASSIGNMENT ENDPOINTS =====
  Future<Map<String, dynamic>> autoAssignDelivery(String orderId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/orders/auto-assign/$orderId'),
      headers: _getHeaders(),
      body: jsonEncode({}),
    );

    if (response.statusCode == 200 || response.statusCode == 202) {
      return jsonDecode(response.body);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Auto-assignment failed');
    }
  }

  Future<List<dynamic>> getAvailableDeliveryPartners() async {
    final response = await http.get(
      Uri.parse('$baseUrl/orders/available-delivery'),
      headers: _getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['delivery_partners'] ?? [];
    } else {
      throw Exception('Failed to fetch available delivery partners');
    }
  }
}
