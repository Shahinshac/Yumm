import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/order_provider.dart';

class OrderTrackingPage extends StatefulWidget {
  final String orderId;

  const OrderTrackingPage({Key? key, required this.orderId}) : super(key: key);

  @override
  State<OrderTrackingPage> createState() => _OrderTrackingPageState();
}

class _OrderTrackingPageState extends State<OrderTrackingPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrderProvider>().fetchOrderDetails(widget.orderId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Order Tracking')),
      body: Consumer<OrderProvider>(
        builder: (context, orderProvider, _) {
          if (orderProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final order = orderProvider.currentOrder;
          if (order == null) {
            return const Center(child: Text('Order not found'));
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Order Status Timeline
                _buildStatusTimeline(order.status),
                const SizedBox(height: 32),

                // Order Details
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey[300]!),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Order Details',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _detailRow('Order ID', order.id.substring(0, 12) + '...'),
                      _detailRow('Restaurant', order.restaurantName),
                      _detailRow('Items', '${order.items.length} items'),
                      _detailRow(
                        'Total Amount',
                        '\₹${order.totalAmount.toStringAsFixed(2)}',
                      ),
                      _detailRow('Delivery Address', order.deliveryAddress),
                      _detailRow(
                        'Estimated Delivery',
                        '${order.estimatedDelivery.hour}:${order.estimatedDelivery.minute.toString().padLeft(2, '0')}',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Order Items
                const Text(
                  'Items Ordered',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: order.items.length,
                  itemBuilder: (context, index) {
                    final item = order.items[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.name,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    '${item.quantity} × \₹${item.price}',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Text(
                              '\₹${(item.price * item.quantity).toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFff6b35),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 24),

                // Review Section (if delivered)
                if (order.status.toLowerCase() == 'delivered')
                  _ReviewSection(orderId: order.id),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatusTimeline(String currentStatus) {
    const steps = ['pending', 'preparing', 'ready', 'on_the_way', 'delivered'];
    final currentIndex = steps.indexOf(currentStatus.toLowerCase());

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Order Status',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        ...List.generate(steps.length, (index) {
          final isActive = index <= currentIndex;
          return Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isActive
                          ? const Color(0xFFff6b35)
                          : Colors.grey[300],
                    ),
                    child: Center(
                      child: Text(
                        isActive ? '✓' : '${index + 1}',
                        style: TextStyle(
                          color: isActive ? Colors.white : Colors.grey,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      steps[index].replaceAll('_', ' ').toUpperCase(),
                      style: TextStyle(
                        fontWeight: isActive
                            ? FontWeight.bold
                            : FontWeight.normal,
                        color: isActive ? Colors.black : Colors.grey,
                      ),
                    ),
                  ),
                ],
              ),
              if (index < steps.length - 1)
                Padding(
                  padding: const EdgeInsets.only(left: 16),
                  child: SizedBox(
                    height: 24,
                    child: VerticalDivider(
                      color: isActive
                          ? const Color(0xFFff6b35)
                          : Colors.grey[300],
                      thickness: 2,
                    ),
                  ),
                ),
            ],
          );
        }),
      ],
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(fontWeight: FontWeight.bold),
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

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
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

          // Rating
          const Text('Rate your experience'),
          const SizedBox(height: 8),
          Row(
            children: List.generate(
              5,
              (index) => GestureDetector(
                onTap: () => setState(() => _rating = index + 1),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Icon(
                    Icons.star,
                    size: 32,
                    color: index < _rating
                        ? const Color(0xFFff6b35)
                        : Colors.grey[300],
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Comment
          TextField(
            controller: _commentController,
            minLines: 3,
            maxLines: 5,
            decoration: InputDecoration(
              hintText: 'Share your comments...',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Submit Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                if (_rating == 0) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Please rate your experience'),
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
                    .then((_) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Thank you for your feedback!'),
                        ),
                      );
                      setState(() {
                        _rating = 0;
                        _commentController.clear();
                      });
                    });
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFff6b35),
              ),
              child: const Text('Submit Review'),
            ),
          ),
        ],
      ),
    );
  }
}
