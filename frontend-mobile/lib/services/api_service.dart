import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';
  // For production: 'https://bankmanagement-api.onrender.com/api'

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
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
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
      throw Exception('Registration failed: ${response.body}');
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
      throw Exception('Login failed: ${response.body}');
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
      return jsonDecode(response.body)['restaurant'];
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
      return jsonDecode(response.body)['menu_items'] ?? [];
    } else {
      throw Exception('Failed to fetch menu');
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
      throw Exception('Failed to create order: ${response.body}');
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
      return jsonDecode(response.body)['order'];
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
      throw Exception('Failed to accept order');
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

  Future<Map<String, dynamic>> updateDeliveryLocation(
    double lat,
    double lng,
  ) async {
    final response = await http.put(
      Uri.parse('$baseUrl/delivery/update-location'),
      headers: _getHeaders(),
      body: jsonEncode({'latitude': lat, 'longitude': lng}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to update location');
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
}
