import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../providers/order_provider.dart';
import '../../services/api_service.dart';
import '../../services/socket_service.dart';

class OrderTrackingPage extends StatefulWidget {
  final String orderId;

  const OrderTrackingPage({Key? key, required this.orderId}) : super(key: key);

  @override
  State<OrderTrackingPage> createState() => _OrderTrackingPageState();
}

class _OrderTrackingPageState extends State<OrderTrackingPage> {
  late SocketService _socket;
  late ApiService _api;
  GoogleMapController? _mapController;

  // Current delivery location (lat/lng)
  LatLng? _deliveryLocation;
  String _currentStatus = '';

  // Markers on the map
  final Set<Marker> _markers = {};

  Timer? _pollTimer;

  static const Color _brand = Color(0xFFff6b35);

  @override
  void initState() {
    super.initState();
    _api = context.read<ApiService>();
    _socket = SocketService();
    _socket.connect();

    // Join the room for this specific order
    _socket.joinOrderRoom(widget.orderId);

    // Listen for real-time status updates
    _socket.onOrderStatusUpdate((data) {
      if (data['order_id'] == widget.orderId && mounted) {
        setState(() => _currentStatus = data['status'] ?? _currentStatus);
        _showStatusSnack(data['status']);
        // Reload full order details
        context.read<OrderProvider>().fetchOrderDetails(widget.orderId);
      }
    });

    // Listen for live delivery location
    _socket.onDeliveryLocationUpdate((data) {
      if (data['order_id'] == widget.orderId && mounted) {
        final lat = (data['lat'] as num?)?.toDouble();
        final lng = (data['lng'] as num?)?.toDouble();
        if (lat != null && lng != null) {
          _updateDeliveryMarker(LatLng(lat, lng));
        }
      }
    });

    // Initial load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrderProvider>().fetchOrderDetails(widget.orderId);
    });

    // Polling fallback every 10 s (in case WebSocket is unavailable)
    _pollTimer = Timer.periodic(const Duration(seconds: 10), (_) async {
      try {
        final tracking = await _api.trackOrder(widget.orderId);
        if (mounted) {
          setState(() => _currentStatus = tracking['status'] ?? _currentStatus);
          final loc = tracking['current_location'];
          if (loc != null && loc['lat'] != null) {
            _updateDeliveryMarker(LatLng(
              (loc['lat'] as num).toDouble(),
              (loc['lng'] as num).toDouble(),
            ));
          }
        }
      } catch (_) {}
    });
  }

  @override
  void dispose() {
    _socket.leaveOrderRoom(widget.orderId);
    _socket.dispose();
    _pollTimer?.cancel();
    _mapController?.dispose();
    super.dispose();
  }

  void _updateDeliveryMarker(LatLng position) {
    setState(() {
      _deliveryLocation = position;
      _markers.removeWhere((m) => m.markerId.value == 'delivery');
      _markers.add(Marker(
        markerId: const MarkerId('delivery'),
        position: position,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
        infoWindow: const InfoWindow(title: '🚴 Delivery Partner'),
      ));
    });
    // Animate camera to delivery partner
    _mapController?.animateCamera(CameraUpdate.newLatLng(position));
  }

  void _showStatusSnack(String status) {
    if (!mounted) return;
    final labels = {
      'confirmed': '✅ Order confirmed!',
      'preparing': '👨‍🍳 Your food is being prepared',
      'ready': '📦 Order is ready for pickup',
      'on_the_way': '🚴 Delivery partner is on the way!',
      'delivered': '🎉 Order delivered!',
      'cancelled': '❌ Order cancelled',
    };
    final msg = labels[status.toLowerCase()] ?? 'Status: $status';
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: status == 'delivered' ? Colors.green : _brand,
      duration: const Duration(seconds: 3),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: _brand,
        foregroundColor: Colors.white,
        title: const Text('📍 Order Tracking'),
      ),
      body: Consumer<OrderProvider>(
        builder: (context, orderProvider, _) {
          if (orderProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final order = orderProvider.currentOrder;
          if (order == null) {
            return const Center(child: Text('Order not found'));
          }

          final status = _currentStatus.isNotEmpty ? _currentStatus : order.status;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Live Map (shows when delivery is on the way)
                if (status == 'on_the_way' || _deliveryLocation != null)
                  _buildLiveMap(order),

                // Order Status Timeline
                _buildStatusTimeline(status),
                const SizedBox(height: 24),

                // Order Details
                _buildOrderDetails(order),
                const SizedBox(height: 24),

                // Order Items
                _buildOrderItems(order),
                const SizedBox(height: 24),

                // Review Section (if delivered)
                if (status.toLowerCase() == 'delivered')
                  _ReviewSection(orderId: order.id),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildLiveMap(dynamic order) {
    // Default to restaurant location if delivery location unknown
    final LatLng initialPosition = _deliveryLocation ??
        const LatLng(11.0089, 76.0305); // Malappuram, Kerala

    return Container(
      height: 250,
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8)],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: GoogleMap(
          initialCameraPosition: CameraPosition(
            target: initialPosition,
            zoom: 14,
          ),
          markers: _markers,
          myLocationEnabled: false,
          zoomControlsEnabled: false,
          onMapCreated: (controller) {
            _mapController = controller;
            if (_deliveryLocation != null) {
              _mapController?.animateCamera(
                CameraUpdate.newLatLng(_deliveryLocation!),
              );
            }
          },
        ),
      ),
    );
  }

  Widget _buildStatusTimeline(String currentStatus) {
    const steps = ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way', 'delivered'];
    final labels = {
      'pending': 'Order Placed',
      'confirmed': 'Confirmed',
      'preparing': 'Preparing',
      'ready': 'Ready for Pickup',
      'on_the_way': 'On the Way',
      'delivered': 'Delivered',
    };
    final icons = {
      'pending': Icons.receipt,
      'confirmed': Icons.thumb_up,
      'preparing': Icons.restaurant,
      'ready': Icons.inventory,
      'on_the_way': Icons.delivery_dining,
      'delivered': Icons.check_circle,
    };

    final currentIndex = steps.indexOf(currentStatus.toLowerCase());

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 6)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Order Status',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          ...List.generate(steps.length, (index) {
            final isActive = index <= currentIndex;
            final isCurrent = index == currentIndex;
            return Column(
              children: [
                Row(
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isActive ? _brand : Colors.grey[200],
                        boxShadow: isCurrent
                            ? [BoxShadow(color: _brand.withOpacity(0.4), blurRadius: 8)]
                            : null,
                      ),
                      child: Center(
                        child: Icon(
                          isActive ? icons[steps[index]] : icons[steps[index]],
                          color: isActive ? Colors.white : Colors.grey,
                          size: 18,
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Text(
                        labels[steps[index]] ?? steps[index],
                        style: TextStyle(
                          fontWeight:
                              isCurrent ? FontWeight.bold : FontWeight.normal,
                          color: isActive ? Colors.black : Colors.grey,
                          fontSize: isCurrent ? 15 : 13,
                        ),
                      ),
                    ),
                    if (isCurrent)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: _brand.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          'Current',
                          style: TextStyle(
                              color: _brand,
                              fontSize: 11,
                              fontWeight: FontWeight.bold),
                        ),
                      ),
                  ],
                ),
                if (index < steps.length - 1)
                  Padding(
                    padding: const EdgeInsets.only(left: 18),
                    child: SizedBox(
                      height: 20,
                      child: VerticalDivider(
                        color: index < currentIndex ? _brand : Colors.grey[300]!,
                        thickness: 2,
                      ),
                    ),
                  ),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _buildOrderDetails(dynamic order) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 6)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Order Details',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const Divider(),
          _detailRow('Order ID', '#${order.id.substring(0, 12)}...'),
          _detailRow('Restaurant', order.restaurantName),
          _detailRow('Items', '${order.items.length} item(s)'),
          _detailRow('Total', '₹${order.totalAmount.toStringAsFixed(2)}'),
          _detailRow('Delivery Address', order.deliveryAddress),
          _detailRow(
            'Estimated Time',
            '${order.estimatedDelivery.hour}:${order.estimatedDelivery.minute.toString().padLeft(2, '0')}',
          ),
        ],
      ),
    );
  }

  Widget _buildOrderItems(dynamic order) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 6)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Items Ordered',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const Divider(),
          ...order.items.map<Widget>((item) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.name,
                          style: const TextStyle(fontWeight: FontWeight.w500)),
                      Text('${item.quantity} × ₹${item.price}',
                          style: const TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                ),
                Text(
                  '₹${(item.price * item.quantity).toStringAsFixed(2)}',
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, color: _brand),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Review Section ────────────────────────────────────────────────────────────

class _ReviewSection extends StatefulWidget {
  final String orderId;

  const _ReviewSection({required this.orderId});

  @override
  State<_ReviewSection> createState() => _ReviewSectionState();
}

class _ReviewSectionState extends State<_ReviewSection> {
  int _rating = 0;
  final _commentController = TextEditingController();
  bool _submitted = false;

  static const Color _brand = Color(0xFFff6b35);

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_submitted) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.green[50],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.green[200]!),
        ),
        child: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green),
            SizedBox(width: 8),
            Text('Thank you for your feedback! 🎉'),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Share Your Feedback',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          const Text('Rate your experience'),
          const SizedBox(height: 8),
          Row(
            children: List.generate(
              5,
              (index) => GestureDetector(
                onTap: () => setState(() => _rating = index + 1),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: Icon(
                    index < _rating ? Icons.star : Icons.star_border,
                    size: 36,
                    color: _brand,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _commentController,
            minLines: 3,
            maxLines: 5,
            decoration: InputDecoration(
              hintText: 'Share your comments...',
              border:
                  OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                if (_rating == 0) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please rate your experience')),
                  );
                  return;
                }
                context
                    .read<OrderProvider>()
                    .submitReview(
                      widget.orderId,
                      _rating,
                      _commentController.text,
                    )
                    .then((_) => setState(() => _submitted = true));
              },
              style: ElevatedButton.styleFrom(backgroundColor: _brand),
              child: const Text('Submit Review',
                  style: TextStyle(color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }
}
