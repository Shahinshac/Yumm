// User Model
class User {
  final String id;
  final String username;
  final String email;
  final String fullName;
  final String phone;
  final String role;
  final bool isVerified;
  final bool isActive;
  final DateTime createdAt;

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.fullName,
    required this.phone,
    required this.role,
    required this.isVerified,
    required this.isActive,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? json['id'] ?? '',
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      fullName: json['full_name'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'customer',
      isVerified: json['is_verified'] ?? false,
      isActive: json['is_active'] ?? true,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }
}

// Restaurant Model
class Restaurant {
  final String id;
  final String name;
  final String category;
  final double rating;
  final int reviewCount; // Add reviewCount
  final int deliveryTime;
  final double minOrder;
  final double deliveryCharge;
  final String address;
  final String phone;
  final bool isOpen;
  final DateTime createdAt;

  Restaurant({
    required this.id,
    required this.name,
    required this.category,
    required this.rating,
    required this.reviewCount,
    required this.deliveryTime,
    required this.minOrder,
    required this.deliveryCharge,
    required this.address,
    required this.phone,
    required this.isOpen,
    required this.createdAt,
  });

  factory Restaurant.fromJson(Map<String, dynamic> json) {
    return Restaurant(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      category: json['category'] ?? '',
      rating: (json['rating'] ?? 0).toDouble(),
      reviewCount: json['review_count'] ?? 0,
      deliveryTime: json['delivery_time'] ?? 30,
      minOrder: (json['min_order'] ?? 0).toDouble(),
      deliveryCharge: (json['delivery_charge'] ?? 0).toDouble(),
      address: json['address'] ?? '',
      phone: json['phone'] ?? '',
      isOpen: json['is_open'] ?? true,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }
}

// Menu Item Model
class MenuItem {
  final String id;
  final String name;
  final String category;
  final String description;
  final double price;
  final bool available;
  final double rating; // Add rating
  final String imageUrl; // Add imageUrl

  MenuItem({
    required this.id,
    required this.name,
    required this.category,
    required this.description,
    required this.price,
    required this.available,
    this.rating = 0.0,
    this.imageUrl = '',
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      category: json['category'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      available: json['available'] ?? true,
      rating: (json['rating'] ?? 0).toDouble(),
      imageUrl: json['image_url'] ?? json['imageUrl'] ?? '',
    );
  }
}

// Cart Item Model
class CartItem {
  final MenuItem item;
  int quantity;

  CartItem({required this.item, this.quantity = 1});

  double get subtotal => item.price * quantity;
}

// Order Model
class Order {
  final String id;
  final String restaurantId;
  final String restaurantName;
  final List<OrderItem> items;
  final double subtotal;
  final double deliveryCharge;
  final double promoDiscount;
  final double totalAmount;
  final String deliveryAddress;
  final String status;
  final DateTime estimatedDelivery;
  final DateTime createdAt;

  Order({
    required this.id,
    required this.restaurantId,
    required this.restaurantName,
    required this.items,
    required this.subtotal,
    required this.deliveryCharge,
    required this.promoDiscount,
    required this.totalAmount,
    required this.deliveryAddress,
    required this.status,
    required this.estimatedDelivery,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    final itemsList = (json['items'] as List?)
            ?.map((item) => OrderItem.fromJson(item))
            .toList() ??
        [];
    return Order(
      id: json['_id'] ?? json['id'] ?? '',
      restaurantId: json['restaurant'] ?? '',
      restaurantName: json['restaurant_name'] ?? '',
      items: itemsList,
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      deliveryCharge: (json['delivery_charge'] ?? 0).toDouble(),
      promoDiscount: (json['promo_discount'] ?? 0).toDouble(),
      totalAmount: (json['total_amount'] ?? 0).toDouble(),
      deliveryAddress: json['delivery_address'] ?? '',
      status: json['status'] ?? 'pending',
      estimatedDelivery: json['estimated_delivery'] != null
          ? DateTime.parse(json['estimated_delivery'])
          : DateTime.now().add(const Duration(minutes: 30)),
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }
}

// Order Item Model
class OrderItem {
  final String itemId;
  final String name;
  final double price;
  final int quantity;

  OrderItem({
    required this.itemId,
    required this.name,
    required this.price,
    required this.quantity,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      itemId: json['item_id'] ?? '',
      name: json['name'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      quantity: json['qty'] ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {'item_id': itemId, 'name': name, 'price': price, 'qty': quantity};
  }
}

// Review Model
class Review {
  final String id;
  final String orderId;
  final int rating;
  final String comment;
  final DateTime createdAt;

  Review({
    required this.id,
    required this.orderId,
    required this.rating,
    required this.comment,
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['_id'] ?? json['id'] ?? '',
      orderId: json['order_id'] ?? '',
      rating: json['rating'] ?? 0,
      comment: json['comment'] ?? '',
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }
}

// PromoCode Model
class PromoCode {
  final String code;
  final double discountPercentage;
  final double maxDiscount;
  final double minOrderValue;
  final DateTime expiryDate;

  PromoCode({
    required this.code,
    required this.discountPercentage,
    required this.maxDiscount,
    required this.minOrderValue,
    required this.expiryDate,
  });

  factory PromoCode.fromJson(Map<String, dynamic> json) {
    return PromoCode(
      code: json['code'] ?? '',
      discountPercentage: (json['discount_percentage'] ?? 0).toDouble(),
      maxDiscount: (json['max_discount'] ?? 0).toDouble(),
      minOrderValue: (json['min_order_value'] ?? 0).toDouble(),
      expiryDate: json['expiry_date'] != null
          ? DateTime.parse(json['expiry_date'])
          : DateTime.now().add(const Duration(days: 30)),
    );
  }
}
