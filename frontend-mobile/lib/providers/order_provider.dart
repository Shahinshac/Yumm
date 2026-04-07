import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class OrderProvider extends ChangeNotifier {
  final ApiService apiService;

  List<CartItem> _cart = [];
  List<Order> _orders = [];
  Order? _currentOrder;
  bool _isLoading = false;
  String? _error;
  double _promoDiscount = 0;
  String? _appliedPromoCode;

  OrderProvider({ApiService? apiService})
    : apiService = apiService ?? ApiService();

  List<CartItem> get cart => _cart;
  List<Order> get orders => _orders;
  Order? get currentOrder => _currentOrder;
  bool get isLoading => _isLoading;
  String? get error => _error;
  double get promoDiscount => _promoDiscount;
  String? get appliedPromoCode => _appliedPromoCode;

  double get cartSubtotal => _cart.fold(0, (sum, item) => sum + item.subtotal);
  double get subtotal => cartSubtotal; // Alias for checkout page
  double get deliveryFee => 50.0; // Default delivery fee
  double get cartTotal => cartSubtotal - _promoDiscount;
  double get total => cartTotal + deliveryFee;
  int get cartItemCount => _cart.fold(0, (sum, item) => sum + item.quantity);

  void addToCart(MenuItem item) {
    final existingIndex = _cart.indexWhere((c) => c.item.id == item.id);
    if (existingIndex >= 0) {
      _cart[existingIndex].quantity++;
    } else {
      _cart.add(CartItem(item: item, quantity: 1));
    }
    notifyListeners();
  }

  void removeFromCart(String itemId) {
    _cart.removeWhere((item) => item.item.id == itemId);
    notifyListeners();
  }

  void updateQuantity(String itemId, int quantity) {
    final item = _cart.firstWhere((c) => c.item.id == itemId);
    item.quantity = quantity;
    notifyListeners();
  }

  void clearCart() {
    _cart.clear();
    _promoDiscount = 0;
    _appliedPromoCode = null;
    notifyListeners();
  }

  Future<bool> applyPromoCode(String code) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await apiService.validatePromoCode(code);
      final discount = response['discount'] as double? ?? 0;
      _promoDiscount = discount;
      _appliedPromoCode = code;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = 'Invalid promo code';
      _promoDiscount = 0;
      _appliedPromoCode = null;
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> placeOrder(String restaurantId, String deliveryAddress) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final orderData = {
        'restaurant_id': restaurantId,
        'items': _cart
            .map(
              (item) => {
                'item_id': item.item.id,
                'name': item.item.name,
                'price': item.item.price,
                'qty': item.quantity,
              },
            )
            .toList(),
        'delivery_address': deliveryAddress,
        'promo_code': _appliedPromoCode,
      };

      final response = await apiService.createOrder(orderData);
      _currentOrder = Order.fromJson(response['order']);
      clearCart();
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

  Future<void> fetchOrders() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await apiService.getUserOrders();
      _orders = (response as List).map((o) => Order.fromJson(o)).toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchOrderDetails(String orderId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await apiService.getOrder(orderId);
      _currentOrder = Order.fromJson(response);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> submitReview(String orderId, int rating, String comment) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await apiService.createReview(orderId, rating, comment);
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

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
