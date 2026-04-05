import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class RestaurantProvider extends ChangeNotifier {
  final ApiService apiService;

  List<Restaurant> _restaurants = [];
  Restaurant? _selectedRestaurant;
  List<MenuItem> _menuItems = [];
  bool _isLoading = false;
  String? _error;

  RestaurantProvider({ApiService? apiService})
    : apiService = apiService ?? ApiService();

  List<Restaurant> get restaurants => _restaurants;
  Restaurant? get selectedRestaurant => _selectedRestaurant;
  List<MenuItem> get menuItems => _menuItems;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchRestaurants() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await apiService.getRestaurants();
      _restaurants = (response as List)
          .map((r) => Restaurant.fromJson(r))
          .toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchRestaurant(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await apiService.getRestaurant(id);
      _selectedRestaurant = Restaurant.fromJson(response);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchMenuItems(String restaurantId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await apiService.getRestaurantMenu(restaurantId);
      _menuItems = (response as List)
          .map((item) => MenuItem.fromJson(item))
          .toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
