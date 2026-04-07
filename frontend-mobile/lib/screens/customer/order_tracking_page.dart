import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_spacing.dart';
import '../../core/constants/app_typography.dart';
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

  // Default map center (Malappuram, Kerala) – used when delivery location is unknown
  static const LatLng _defaultLocation = LatLng(11.0089, 76.0305);

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
      backgroundColor: status == 'delivered' ? Colors.green : AppColors.primary,
      duration: const Duration(seconds: 3),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
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

          final status =
              _currentStatus.isNotEmpty ? _currentStatus : order.status;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.lg),
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
    final LatLng initialPosition = _deliveryLocation ?? _defaultLocation;

    return Container(
      height: 250,
      margin: const EdgeInsets.only(bottom: AppSpacing.xxl),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        boxShadow: [
          BoxShadow(
              color: AppColors.black.withOpacity(0.12),
              blurRadius: AppSpacing.elevationMd)
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
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
    const steps = [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'on_the_way',
      'delivered'
    ];
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
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        boxShadow: [
          BoxShadow(
              color: AppColors.black.withOpacity(0.12),
              blurRadius: AppSpacing.elevationMd)
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Order Status',
            style: AppTypography.titleMedium
                .copyWith(color: AppColors.textPrimary),
          ),
          const SizedBox(height: AppSpacing.lg),
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
                        color: isActive ? AppColors.primary : AppColors.gray100,
                        boxShadow: isCurrent
                            ? [
                                BoxShadow(
                                    color: AppColors.primary.withOpacity(0.4),
                                    blurRadius: AppSpacing.elevationMd)
                              ]
                            : null,
                      ),
                      child: Center(
                        child: Icon(
                          isActive ? icons[steps[index]] : icons[steps[index]],
                          color: isActive ? AppColors.white : AppColors.gray400,
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
                          color: isActive
                              ? AppColors.textPrimary
                              : AppColors.textSecondary,
                          fontSize: isCurrent ? 15 : 13,
                        ),
                      ),
                    ),
                    if (isCurrent)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.sm, vertical: AppSpacing.xs),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.15),
                          borderRadius:
                              BorderRadius.circular(AppSpacing.radiusMd),
                        ),
                        child: const Text(
                          'Current',
                          style: TextStyle(
                              color: AppColors.primary,
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
                        color: index < currentIndex
                            ? AppColors.primary
                            : AppColors.gray200,
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
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        boxShadow: [
          BoxShadow(
              color: AppColors.black.withOpacity(0.12),
              blurRadius: AppSpacing.elevationMd)
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Order Details',
              style: AppTypography.titleMedium
                  .copyWith(color: AppColors.textPrimary)),
          const Divider(),
          _detailRow('Order ID',
              '#${order.id.padRight(12).substring(0, 12).trimRight()}...'),
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
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        boxShadow: [
          BoxShadow(
              color: AppColors.black.withOpacity(0.12),
              blurRadius: AppSpacing.elevationMd)
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Items Ordered',
              style: AppTypography.titleMedium
                  .copyWith(color: AppColors.textPrimary)),
          const Divider(),
          ...order.items.map<Widget>((item) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.md),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.name,
                              style: AppTypography.bodyMedium
                                  .copyWith(fontWeight: FontWeight.w600)),
                          Text('${item.quantity} × ₹${item.price}',
                              style: AppTypography.bodySmall
                                  .copyWith(color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                    Text(
                      '₹${(item.price * item.quantity).toStringAsFixed(2)}',
                      style: AppTypography.bodyMedium.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary),
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
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: AppTypography.bodyMedium
                  .copyWith(color: AppColors.textSecondary)),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: AppTypography.bodyMedium
                  .copyWith(fontWeight: FontWeight.w600),
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

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_submitted) {
      return Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: AppColors.successLight,
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          border: Border.all(color: AppColors.success),
        ),
        child: const Row(
          children: [
            Icon(Icons.check_circle, color: AppColors.success),
            SizedBox(width: AppSpacing.md),
            Text('Thank you for your feedback! 🎉'),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.gray50,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: AppColors.gray200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Share Your Feedback',
            style: AppTypography.titleMedium
                .copyWith(color: AppColors.textPrimary),
          ),
          const SizedBox(height: AppSpacing.lg),
          const Text('Rate your experience', style: AppTypography.bodyMedium),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: List.generate(
              5,
              (index) => GestureDetector(
                onTap: () => setState(() => _rating = index + 1),
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                  child: Icon(
                    index < _rating ? Icons.star : Icons.star_border,
                    size: 36,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          TextField(
            controller: _commentController,
            minLines: 3,
            maxLines: 5,
            decoration: InputDecoration(
              hintText: 'Share your comments...',
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.radiusMd)),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                if (_rating == 0) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Please rate your experience'),
                      backgroundColor: AppColors.error,
                    ),
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
              style:
                  ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
              child: const Text('Submit Review',
                  style: TextStyle(color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }
}
