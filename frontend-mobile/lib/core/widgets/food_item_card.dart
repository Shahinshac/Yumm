import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_typography.dart';

class FoodItemCard extends StatefulWidget {
  final String name;
  final String description;
  final double price;
  final double rating;
  final String imageUrl;
  final int quantity;
  final VoidCallback onAddToCart;
  final Function(int) onQuantityChanged;

  const FoodItemCard({
    Key? key,
    required this.name,
    required this.description,
    required this.price,
    required this.rating,
    required this.imageUrl,
    this.quantity = 0,
    required this.onAddToCart,
    required this.onQuantityChanged,
  }) : super(key: key);

  @override
  State<FoodItemCard> createState() => _FoodItemCardState();
}

class _FoodItemCardState extends State<FoodItemCard> {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withOpacity(0.08),
            blurRadius: AppSpacing.elevationMd,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              Container(
                height: 140,
                width: double.infinity,
                color: AppColors.gray200,
                child:
                    Icon(Icons.restaurant, size: 40, color: AppColors.gray400),
              ),
              Positioned(
                top: AppSpacing.md,
                right: AppSpacing.md,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.white.withOpacity(0.95),
                    borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.star_rounded,
                          color: AppColors.rating, size: 14),
                      const SizedBox(width: AppSpacing.xs),
                      Text(widget.rating.toStringAsFixed(1),
                          style: AppTypography.labelSmall),
                    ],
                  ),
                ),
              ),
            ],
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.name,
                      style: AppTypography.titleSmall,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis),
                  const SizedBox(height: AppSpacing.xs),
                  Flexible(
                    child: Text(widget.description,
                        style: AppTypography.bodySmall
                            .copyWith(color: AppColors.textTertiary),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis),
                  ),
                  const Spacer(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('₹${widget.price.toStringAsFixed(0)}',
                          style: AppTypography.titleSmall.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold)),
                      _buildAddButton(),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddButton() {
    if (widget.quantity == 0) {
      return GestureDetector(
        onTap: widget.onAddToCart,
        child: Container(
          padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md, vertical: AppSpacing.xs),
          decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd)),
          child: Text('Add',
              style: AppTypography.labelSmall.copyWith(color: AppColors.white)),
        ),
      );
    }
    return Container(
      decoration: BoxDecoration(
          border: Border.all(color: AppColors.primary),
          borderRadius: BorderRadius.circular(AppSpacing.radiusMd)),
      child: Row(
        children: [
          GestureDetector(
              onTap: () => widget.onQuantityChanged(
                  widget.quantity > 1 ? widget.quantity - 1 : 0),
              child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                  child:
                      Icon(Icons.remove, size: 16, color: AppColors.primary))),
          Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child:
                  Text('${widget.quantity}', style: AppTypography.labelSmall)),
          GestureDetector(
              onTap: () => widget.onQuantityChanged(widget.quantity + 1),
              child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                  child: const Icon(Icons.add,
                      size: 16, color: AppColors.primary))),
        ],
      ),
    );
  }
}
