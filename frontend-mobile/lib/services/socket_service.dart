import 'package:socket_io_client/socket_io_client.dart' as io;

/// Service for real-time communication with the Flask-SocketIO backend.
/// Supports live order status updates and delivery location tracking.
class SocketService {
  static const String _baseUrl = 'http://localhost:5000';
  // For production: use the Render backend URL

  io.Socket? _socket;
  bool _isConnected = false;

  bool get isConnected => _isConnected;

  /// Connect to the Socket.IO server
  void connect() {
    if (_isConnected) return;

    _socket = io.io(
      _baseUrl,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .disableAutoConnect()
          .build(),
    );

    _socket!.onConnect((_) {
      _isConnected = true;
      print('🔌 SocketIO connected');
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
      print('🔌 SocketIO disconnected');
    });

    _socket!.onConnectError((data) {
      _isConnected = false;
      print('❌ SocketIO connect error: $data');
    });

    _socket!.connect();
  }

  /// Disconnect from the server
  void disconnect() {
    _socket?.disconnect();
    _isConnected = false;
  }

  /// Join the room for a specific order to receive live updates
  void joinOrderRoom(String orderId) {
    if (!_isConnected) connect();
    _socket?.emit('join_order_room', {'order_id': orderId});
  }

  /// Leave an order room
  void leaveOrderRoom(String orderId) {
    _socket?.emit('leave_order_room', {'order_id': orderId});
  }

  /// Join the restaurant room to receive new order notifications
  void joinRestaurantRoom(String restaurantId) {
    if (!_isConnected) connect();
    _socket?.emit('join_restaurant_room', {'restaurant_id': restaurantId});
  }

  /// Join the delivery partner room for new assignment notifications
  void joinDeliveryRoom(String deliveryPartnerId) {
    if (!_isConnected) connect();
    _socket?.emit(
        'join_delivery_room', {'delivery_partner_id': deliveryPartnerId});
  }

  /// Listen for real-time order status updates
  /// Callback receives: { order_id, status }
  void onOrderStatusUpdate(void Function(Map<String, dynamic>) callback) {
    _socket?.on('order_status_update', (data) {
      if (data is Map) {
        callback(Map<String, dynamic>.from(data));
      }
    });
  }

  /// Listen for new incoming orders (restaurant panel)
  /// Callback receives the full order dict
  void onNewOrder(void Function(Map<String, dynamic>) callback) {
    _socket?.on('new_order', (data) {
      if (data is Map) {
        callback(Map<String, dynamic>.from(data));
      }
    });
  }

  /// Listen for live delivery location updates (customer order tracking)
  /// Callback receives: { order_id, lat, lng }
  void onDeliveryLocationUpdate(void Function(Map<String, dynamic>) callback) {
    _socket?.on('delivery_location_update', (data) {
      if (data is Map) {
        callback(Map<String, dynamic>.from(data));
      }
    });
  }

  /// Remove all listeners for a specific event
  void off(String event) {
    _socket?.off(event);
  }

  void dispose() {
    disconnect();
    _socket?.dispose();
  }
}
