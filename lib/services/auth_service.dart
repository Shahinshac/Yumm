import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'google_signin_service.dart';

/// Authentication Service for FoodHub Backend
/// Handles all authentication with the backend API
class AuthService {
  static const String TAG = '🔐 AuthService';
  static const String BASE_URL = 'https://yumm-ym2m.onrender.com';

  late Dio _dio;
  final GoogleSignInService googleSignIn;

  AuthService()
      : googleSignIn = GoogleSignInService(),
        _dio = Dio(BaseOptions(
          baseUrl: BASE_URL,
          connectTimeout: Duration(seconds: 15),
          receiveTimeout: Duration(seconds: 15),
          contentType: 'application/json',
        )) {
    _setupInterceptors();
  }

  /// Setup Dio interceptors for logging and error handling
  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          debugPrint('$TAG: 📤 ${options.method.toUpperCase()} ${options.path}');
          if (options.data != null) {
            debugPrint('$TAG: Data: ${options.data}');
          }
          return handler.next(options);
        },
        onResponse: (response, handler) {
          debugPrint('$TAG: 📥 Status ${response.statusCode}');
          return handler.next(response);
        },
        onError: (error, handler) {
          debugPrint('$TAG: ❌ Error: ${error.message}');
          debugPrint('$TAG: Response data: ${error.response?.data}');
          return handler.next(error);
        },
      ),
    );
  }

  /// Set authorization token in headers
  void setAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
    debugPrint('$TAG: 🔑 Authorization header set');
  }

  /// Clear authorization token
  void clearAuthToken() {
    _dio.options.headers.remove('Authorization');
    debugPrint('$TAG: 🔏 Authorization header cleared');
  }

  // ==================== GOOGLE SIGN-IN ====================

  /// Google Sign-In for Customers
  /// Returns access token and user data if successful
  Future<Map<String, dynamic>> googleLogin() async {
    try {
      debugPrint('$TAG: Starting Google Sign-In for customer...');

      // Step 1: Sign in with Google
      final account = await googleSignIn.signIn();
      if (account == null) {
        throw Exception('User cancelled Google Sign-In');
      }

      debugPrint('$TAG: ✅ Google Sign-In successful: ${account.email}');

      // Step 2: Get ID token
      final idToken = await googleSignIn.getIdToken();
      if (idToken == null) {
        throw Exception('Failed to get ID token from Google');
      }

      debugPrint('$TAG: ID token obtained (length: ${idToken.length})');

      // Step 3: Send to backend
      debugPrint('$TAG: Sending ID token to backend...');

      final response = await _dio.post(
        '/api/auth/google-login',
        data: {'id_token': idToken},
      );

      if (response.statusCode == 200) {
        final accessToken = response.data['access_token'] as String;
        final user = response.data['user'] as Map<String, dynamic>;

        debugPrint('$TAG: ✅ Backend authenticated user: ${user['email']}');

        setAuthToken(accessToken);

        return {
          'success': true,
          'access_token': accessToken,
          'user': user,
          'role': user['role'] ?? 'customer',
        };
      } else {
        throw Exception('Backend authentication failed: ${response.statusCode}');
      }
    } on DioException catch (e) {
      final errorMessage = e.response?.data?['error'] ?? 'Login failed: ${e.message}';
      debugPrint('$TAG: ❌ DioException: $errorMessage');

      // Try to sign out if backend auth failed
      try {
        await googleSignIn.signOut();
      } catch (_) {}

      return {
        'success': false,
        'error': errorMessage,
      };
    } catch (e) {
      debugPrint('$TAG: ❌ Unexpected error: $e');

      try {
        await googleSignIn.signOut();
      } catch (_) {}

      return {
        'success': false,
        'error': e.toString(),
      };
    }
  }

  // ==================== EMAIL/PASSWORD LOGIN ====================

  /// Email/Password Login (for Restaurant & Delivery after approval)
  /// Only works if user is approved by admin
  Future<Map<String, dynamic>> emailLogin(
    String email,
    String password,
  ) async {
    try {
      debugPrint('$TAG: Email login attempt for: $email');

      final response = await _dio.post(
        '/api/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        final accessToken = response.data['access_token'] as String;
        final user = response.data['user'] as Map<String, dynamic>;

        debugPrint('$TAG: ✅ Email login successful for: ${user['email']}');

        setAuthToken(accessToken);

        return {
          'success': true,
          'access_token': accessToken,
          'user': user,
          'role': user['role'] ?? 'unknown',
        };
      } else {
        throw Exception('Login failed: ${response.statusCode}');
      }
    } on DioException catch (e) {
      final errorMessage = e.response?.data?['error'] ?? 'Login failed: ${e.message}';
      debugPrint('$TAG: ❌ Login error: $errorMessage');

      return {
        'success': false,
        'error': errorMessage,
      };
    } catch (e) {
      debugPrint('$TAG: ❌ Unexpected error: $e');

      return {
        'success': false,
        'error': e.toString(),
      };
    }
  }

  // ==================== GET CURRENT USER ====================

  /// Get authenticated user details
  /// Requires valid authentication token
  Future<Map<String, dynamic>> getCurrentUser() async {
    try {
      debugPrint('$TAG: Fetching current user...');

      final response = await _dio.get('/api/auth/me');

      if (response.statusCode == 200) {
        final user = response.data as Map<String, dynamic>;
        debugPrint('$TAG: ✅ Current user: ${user['email']}');

        return {
          'success': true,
          'user': user,
        };
      } else {
        throw Exception('Failed to fetch user: ${response.statusCode}');
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 401 || e.response?.statusCode == 403) {
        debugPrint('$TAG: ⚠️  User not authenticated');
      } else {
        debugPrint('$TAG: ❌ Error: ${e.message}');
      }

      return {
        'success': false,
        'error': e.response?.data?['error'] ?? e.message ?? 'Failed to fetch user',
      };
    } catch (e) {
      debugPrint('$TAG: ❌ Unexpected error: $e');

      return {
        'success': false,
        'error': e.toString(),
      };
    }
  }

  // ==================== RESTAURANT REGISTRATION ====================

  /// Register as Restaurant
  /// User will be pending until approved by admin
  Future<Map<String, dynamic>> registerRestaurant({
    required String name,
    required String email,
    required String phone,
    required String shopName,
    required String address,
  }) async {
    try {
      debugPrint('$TAG: Restaurant registration for: $email');

      final response = await _dio.post(
        '/api/auth/register/restaurant',
        data: {
          'name': name,
          'email': email,
          'phone': phone,
          'shop_name': shopName,
          'address': address,
        },
      );

      if (response.statusCode == 201) {
        final userId = response.data['user_id'] as String;

        debugPrint('$TAG: ✅ Restaurant registered (pending approval): $userId');

        return {
          'success': true,
          'user_id': userId,
          'message': response.data['message'],
          'next_step': response.data['next_step'],
        };
      } else {
        throw Exception('Registration failed: ${response.statusCode}');
      }
    } on DioException catch (e) {
      final errorMessage = e.response?.data?['error'] ?? 'Registration failed: ${e.message}';
      debugPrint('$TAG: ❌ Registration error: $errorMessage');

      return {
        'success': false,
        'error': errorMessage,
      };
    } catch (e) {
      debugPrint('$TAG: ❌ Unexpected error: $e');

      return {
        'success': false,
        'error': e.toString(),
      };
    }
  }

  // ==================== DELIVERY REGISTRATION ====================

  /// Register as Delivery Partner
  /// User will be pending until approved by admin
  Future<Map<String, dynamic>> registerDelivery({
    required String name,
    required String email,
    required String phone,
    required String vehicleType, // 'bike', 'scooter', 'car', 'bicycle'
  }) async {
    try {
      debugPrint('$TAG: Delivery registration for: $email');

      // Validate vehicle type
      final validVehicles = ['bike', 'scooter', 'car', 'bicycle'];
      if (!validVehicles.contains(vehicleType.toLowerCase())) {
        throw Exception('Invalid vehicle type: $vehicleType');
      }

      final response = await _dio.post(
        '/api/auth/register/delivery',
        data: {
          'name': name,
          'email': email,
          'phone': phone,
          'vehicle_type': vehicleType.toLowerCase(),
        },
      );

      if (response.statusCode == 201) {
        final userId = response.data['user_id'] as String;

        debugPrint('$TAG: ✅ Delivery partner registered (pending approval): $userId');

        return {
          'success': true,
          'user_id': userId,
          'message': response.data['message'],
          'next_step': response.data['next_step'],
        };
      } else {
        throw Exception('Registration failed: ${response.statusCode}');
      }
    } on DioException catch (e) {
      final errorMessage = e.response?.data?['error'] ?? 'Registration failed: ${e.message}';
      debugPrint('$TAG: ❌ Registration error: $errorMessage');

      return {
        'success': false,
        'error': errorMessage,
      };
    } catch (e) {
      debugPrint('$TAG: ❌ Unexpected error: $e');

      return {
        'success': false,
        'error': e.toString(),
      };
    }
  }

  // ==================== LOGOUT ====================

  /// Logout user
  /// Clears authentication token and signs out from Google if needed
  Future<void> logout() async {
    try {
      debugPrint('$TAG: Logging out...');

      clearAuthToken();

      // Also sign out from Google if signed in
      if (googleSignIn.isSignedIn()) {
        await googleSignIn.signOut();
        debugPrint('$TAG: ✅ Google sign-out successful');
      }

      debugPrint('$TAG: ✅ Logout complete');
    } catch (e) {
      debugPrint('$TAG: ❌ Error during logout: $e');
    }
  }

  // ==================== HEALTH CHECK ====================

  /// Check if backend is online
  Future<bool> isBackendOnline() async {
    try {
      final response = await _dio.get('/api/health').timeout(Duration(seconds: 5));
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('$TAG: Backend offline: $e');
      return false;
    }
  }

  /// Get backend version
  Future<Map<String, dynamic>?> getBackendVersion() async {
    try {
      final response = await _dio.get('/api/version');
      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('$TAG: Error getting version: $e');
    }
    return null;
  }
}
