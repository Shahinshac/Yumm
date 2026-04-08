import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme.dart';
import '../../core/components/custom_button.dart';
import '../../providers/order_provider.dart';
import '../../services/api_service.dart';
import '../../services/socket_service.dart';

class OrderTrackingPage extends StatefulWidget {
  final String orderId;

  const OrderTrackingPage({super.key, required this.orderId});

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

  // Default map center
  static const LatLng _defaultLocation = LatLng(11.0089, 76.0305);

  @override
  void initState() {
    super.initState();
    _api = context.read<ApiService>();
    _socket = SocketService();
    _socket.connect();

    _socket.joinOrderRoom(widget.orderId);

    _socket.onOrderStatusUpdate((data) {
      if (data['order_id'] == widget.orderId && mounted) {
        setState(() => _currentStatus = data['status'] ?? _currentStatus);
        _showStatusSnack(data['status']);
        context.read<OrderProvider>().fetchOrderDetails(widget.orderId);
      }
    });

    _socket.onDeliveryLocationUpdate((data) {
      if (data['order_id'] == widget.orderId && mounted) {
        final lat = (data['lat'] as num?)?.toDouble();
        final lng = (data['lng'] as num?)?.toDouble();
        if (lat != null && lng != null) {
          _updateDeliveryMarker(LatLng(lat, lng));
        }
      }
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrderProvider>().fetchOrderDetails(widget.orderId);
    });

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
      backgroundColor: status == 'delivered' ? Colors.green : AppTheme.primary,
      duration: const Duration(seconds: 3),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        title: const Text('📍 Order Tracking', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: AppTheme.surfaceDark,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Consumer<OrderProvider>(
        builder: (context, orderProvider, _) {
          if (orderProvider.isLoading) {
            return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
          }

          final order = orderProvider.currentOrder;
          if (order == null) {
            return const Center(child: Text('Order not found', style: TextStyle(color: Colors.white)));
          }

          final status = _currentStatus.isNotEmpty ? _currentStatus : order.status;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (status == 'on_the_way' || _deliveryLocation != null)
                  _buildLiveMap(order).animate().fadeIn().scale(begin: const Offset(0.95, 0.95)),

                _buildStatusTimeline(status).animate().fadeIn(delay: 100.ms).slideX(),
                const SizedBox(height: 24),

                _buildOrderDetails(order).animate().fadeIn(delay: 200.ms).slideX(),
                const SizedBox(height: 24),

                _buildOrderItems(order).animate().fadeIn(delay: 300.ms).slideX(),
                const SizedBox(height: 24),

                if (status.toLowerCase() == 'delivered')
                  _ReviewSection(orderId: order.id).animate().fadeIn(delay: 500.ms).moveY(),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildLiveMap(dynamic order) {
    final LatLng initialPosition = _deliveryLocation ?? _defaultLocation;

    return Container(
      height: 250,
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderDark),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 15)
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
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
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderDark),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Order Status', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 24),
          ...List.generate(steps.length, (index) {
            final isActive = index <= currentIndex;
            final isCurrent = index == currentIndex;
            return Column(
              children: [
                Row(
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isActive ? AppTheme.primary : AppTheme.backgroundDark,
                        border: Border.all(color: isActive ? AppTheme.primary : AppTheme.borderDark),
                        boxShadow: isCurrent
                            ? [
                                BoxShadow(
                                    color: AppTheme.primary.withValues(alpha: 0.4),
                                    blurRadius: 12)
                              ]
                            : null,
                      ),
                      child: Center(
                        child: Icon(
                          icons[steps[index]],
                          color: isActive ? Colors.white : AppTheme.textSecondary,
                          size: 18,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        labels[steps[index]] ?? steps[index],
                        style: TextStyle(
                          fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                          color: isActive ? Colors.white : AppTheme.textSecondary,
                          fontSize: isCurrent ? 16 : 14,
                        ),
                      ),
                    ),
                    if (isCurrent)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'Current',
                          style: TextStyle(color: AppTheme.primary, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ).animate().pulse(),
                  ],
                ),
                if (index < steps.length - 1)
                  Padding(
                    padding: const EdgeInsets.only(left: 20),
                    child: SizedBox(
                      height: 24,
                      child: VerticalDivider(
                        color: index < currentIndex ? AppTheme.primary : AppTheme.borderDark,
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
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderDark),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Order Details', style: Theme.of(context).textTheme.titleLarge),
          const Divider(color: AppTheme.borderDark, height: 32),
          _detailRow('Order ID', '#${(order.id.toString()).padRight(12).substring(0, 12).trimRight()}...'),
          _detailRow('Restaurant', order.restaurantName),
          _detailRow('Items', '${order.items.length} item(s)'),
          _detailRow('Total', '₹${order.totalAmount.toStringAsFixed(2)}'),
          _detailRow('Delivery Address', order.deliveryAddress),
          _detailRow('Estimated Time', '${order.estimatedDelivery.hour}:${order.estimatedDelivery.minute.toString().padLeft(2, '0')}'),
        ],
      ),
    );
  }

  Widget _buildOrderItems(dynamic order) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.borderDark),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Items Ordered', style: Theme.of(context).textTheme.titleLarge),
          const Divider(color: AppTheme.borderDark, height: 32),
          ...order.items.map<Widget>((item) => Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16, color: Colors.white)),
                          const SizedBox(height: 4),
                          Text('${item.quantity} × ₹${item.price}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
                        ],
                      ),
                    ),
                    Text(
                      '₹${(item.price * item.quantity).toStringAsFixed(2)}',
                      style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary, fontSize: 16),
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
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 16)),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.white, fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }
}

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

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_submitted) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.green.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.green.withValues(alpha: 0.3)),
        ),
        child: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green),
            SizedBox(width: 16),
            Text('Thank you for your feedback! 🎉', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.primary.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Share Your Feedback', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          const Text('Rate your experience', style: TextStyle(color: AppTheme.textSecondary, fontSize: 16)),
          const SizedBox(height: 16),
          Row(
            children: List.generate(
              5,
              (index) => GestureDetector(
                onTap: () => setState(() => _rating = index + 1),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Icon(
                    index < _rating ? Icons.star : Icons.star_border,
                    size: 40,
                    color: index < _rating ? Colors.amber : AppTheme.borderDark,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _commentController,
            minLines: 3,
            maxLines: 5,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Share your comments...',
              hintStyle: const TextStyle(color: AppTheme.textSecondary),
              filled: true,
              fillColor: AppTheme.backgroundDark,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppTheme.primary)),
            ),
          ),
          const SizedBox(height: 24),
          CustomButton(
            text: 'Submit Review',
            onPressed: () {
              if (_rating == 0) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please rate your experience'), backgroundColor: Colors.red),
                );
                return;
              }
              context
                  .read<OrderProvider>()
                  .submitReview(widget.orderId, _rating, _commentController.text)
                  .then((_) => setState(() => _submitted = true));
            },
          ),
        ],
      ),
    );
  }
}
