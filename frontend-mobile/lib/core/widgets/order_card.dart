import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_typography.dart';

/// Order card for displaying order history and tracking
class OrderCard extends StatelessWidget {
  final String orderId;
  final String restaurantName;
  final String status;
  final double totalAmount;
  final String orderDate;
  final int itemCount;
  final VoidCallback onTap;
  final VoidCallback? onReorderTap;
  final Color? statusColor;

  const OrderCard({
    Key? key,
    required this.orderId,
    required this.restaurantName,
    required this.status,
    required this.totalAmount,
    required this.orderDate,
    required this.itemCount,
    required this.onTap,
    this.onReorderTap,
    this.statusColor,
  }) : super(key: key);

  Color _getStatusColor() {
    return statusColor ??
        switch (status.toLowerCase()) {
          'delivered' => AppColors.statusDelivered,
          'pending' => AppColors.statusPending,
          'confirmed' => AppColors.statusConfirmed,
          'preparing' => AppColors.statusPreparing,
          'on the way' => AppColors.statusOnTheWay,
          'cancelled' => AppColors.statusCancelled,
          _ => AppColors.textSecondary,
        };
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.paddingMd),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Row: Restaurant and Status Badge
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Restaurant Name
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          restaurantName,
                          style: AppTypography.headline6,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: AppSpacing.paddingXs),
                        Text(
                          'Order #$orderId',
                          style: AppTypography.caption,
                        ),
                      ],
                    ),
                  ),
                  // Status Badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.paddingMd,
                      vertical: AppSpacing.paddingXs,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(
                        color: _getStatusColor(),
                        width: 1,
                      ),
                    ),
                    child: Text(
                      status,
                      style: AppTypography.labelSmall.copyWith(
                        color: _getStatusColor(),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.paddingMd),
              // Divider
              const Divider(
                height: 1,
                color: AppColors.border,
              ),
              const SizedBox(height: AppSpacing.paddingMd),
              // Bottom Row: Details
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Items Count and Date
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$itemCount item${itemCount > 1 ? 's' : ''}',
                        style: AppTypography.bodySmall,
                      ),
                      const SizedBox(height: AppSpacing.paddingXs),
                      Text(
                        orderDate,
                        style: AppTypography.caption,
                      ),
                    ],
                  ),
                  // Price and Reorder Button
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '₹${totalAmount.toStringAsFixed(0)}',
                        style: AppTypography.headline6.copyWith(
                          color: AppColors.primary,
                        ),
                      ),
                      if (onReorderTap != null &&
                          status.toLowerCase() == 'delivered') ...[
                        const SizedBox(height: AppSpacing.paddingXs),
                        GestureDetector(
                          onTap: onReorderTap,
                          child: Text(
                            'Reorder',
                            style: AppTypography.labelSmall.copyWith(
                              color: AppColors.primary,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
