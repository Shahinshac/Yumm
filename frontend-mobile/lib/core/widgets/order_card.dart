import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_typography.dart';

class OrderCard extends StatelessWidget {
  final String orderId;
  final String restaurantName;
  final double totalAmount;
  final String status;
  final String estimatedTime;
  final int itemCount;
  final DateTime orderDate;
  final VoidCallback onTap;
  final VoidCallback? onTrackPressed;
  final VoidCallback? onReorderPressed;

  const OrderCard({
    Key? key,
    required this.orderId,
    required this.restaurantName,
    required this.totalAmount,
    required this.status,
    required this.estimatedTime,
    required this.itemCount,
    required this.orderDate,
    required this.onTap,
    this.onTrackPressed,
    this.onReorderPressed,
  }) : super(key: key);

  Color getStatusColor() {
    switch (status.toLowerCase()) {
      case 'delivered':
        return AppColors.statusDelivered;
      case 'cancelled':
        return AppColors.statusCancelled;
      default:
        return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        elevation: AppSpacing.elevationLow,
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Order #${orderId.substring(0, 8)}',
                          style: AppTypography.labelMedium,
                        ),
                        Text(
                          restaurantName,
                          style: AppTypography.titleMedium,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: getStatusColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                    ),
                    child: Text(
                      status,
                      style: AppTypography.labelSmall.copyWith(
                        color: getStatusColor(),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('$itemCount items', style: AppTypography.bodySmall),
                  Text('₹${totalAmount.toStringAsFixed(2)}',
                      style: AppTypography.titleMedium),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              Text(estimatedTime, style: AppTypography.bodySmall),
            ],
          ),
        ),
      ),
    );
  }
}
