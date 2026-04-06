import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService apiService;

  String? _token;
  User? _user;
  bool _isLoading = false;
  String? _error;

  AuthProvider({ApiService? apiService})
    : apiService = apiService ?? ApiService();

  String? get token => _token;
  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _token != null && _user != null;

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await apiService.login(username, password);
      _token = response['access_token'];
      _user = User.fromJson(response['user']);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(
    String username,
    String email,
    String password,
    String phone,
    String fullName,
    String role,
  ) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await apiService.register(
        username,
        email,
        password,
        phone,
        fullName,
        role,
      );
      _token = response['access_token'];
      // Persist token so future requests are authenticated
      if (_token != null) await apiService.setToken(_token!);
      _user = User.fromJson(response['user']);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> getCurrentUser() async {
    try {
      final response = await apiService.getCurrentUser();
      // /api/auth/me returns the user dict directly (not wrapped in 'user')
      _user = User.fromJson(response);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    await apiService.clearToken();
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
