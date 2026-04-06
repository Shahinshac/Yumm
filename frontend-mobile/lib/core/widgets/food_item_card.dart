import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_typography.dart';

/// Food Item Card - Menu items with image, price, rating
class FoodItemCard extends StatefulWidget {
  final String name;
  final String imageUrl;
  final String description;
  final double price;
  final double? rating;
  final int? quantity;
  final VoidCallback? onAddPressed;
  final Function(int)? onQuantityChanged;

  const FoodItemCard({
    Key? key,
    required this.name,
    required this.imageUrl,
    required this.description,
    required this.price,
    this.rating,
    this.quantity,
    this.onAddPressed,
    this.onQuantityChanged,
  }) : super(key: key);

  @override
  State<FoodItemCard> createState() => _FoodItemCardState();
}

class _FoodItemCardState extends State<FoodItemCard> {
  late int _quantity;

  @override
  void initState() {
    super.initState();
    _quantity = widget.quantity ?? 0;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: AppSpacing.elevationLow,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image
          Container(
            height: 150,
            width: double.infinity,
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(AppSpacing.radiusLg),
              ),
              color: AppColors.gray200,
            ),
            child: Image.network(
              widget.imageUrl,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Center(
                  child: Icon(
                    Icons.fastfood,
                    size: 40,
                    color: AppColors.gray400,
                  ),
                );
              },
            ),
          ),

          // Content
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Name
                Text(
                  widget.name,
                  style: AppTypography.titleMedium,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AppSpacing.sm),

                // Description
                Text(
                  widget.description,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textTertiary,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AppSpacing.md),

                // Rating and Price row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Rating
                    if (widget.rating != null)
                      Row(
                        children: [
                          const Icon(
                            Icons.star_rounded,
                            color: AppColors.rating,
                            size: 16,
                          ),
                          const SizedBox(width: AppSpacing.xs),
                          Text(
                            widget.rating!.toStringAsFixed(1),
                            style: AppTypography.labelSmall,
                          ),
                        ],
                      )
                    else
                      const SizedBox(),

                    // Price
                    Text(
                      '\₹${widget.price.toStringAsFixed(2)}',
                      style: AppTypography.titleMedium.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.lg),

                // Add button or Quantity selector
                if (_quantity == 0)
                  SizedBox(
                    width: double.infinity,
                    height: AppSpacing.buttonHeight - 8,
                    child: ElevatedButton(
                      onPressed: () {
                        setState(() => _quantity = 1);
                        widget.onQuantityChanged?.call(1);
                        widget.onAddPressed?.call();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(AppSpacing.radiusLg),
                        ),
                      ),
                      child: Text(
                        'Add',
                        style: AppTypography.labelMedium.copyWith(
                          color: AppColors.white,
                        ),
                      ),
                    ),
                  )
                else
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      // Minus
                      IconButton(
                        icon: const Icon(Icons.remove_circle),
                        color: AppColors.primary,
                        onPressed: () {
                          if (_quantity > 1) {
                            setState(() => _quantity--);
                            widget.onQuantityChanged?.call(_quantity);
                          } else {
                            setState(() => _quantity = 0);
                            widget.onQuantityChanged?.call(0);
                          }
                        },
                      ),

                      // Quantity
                      Text(
                        '$_quantity',
                        style: AppTypography.headlineSmall.copyWith(
                          color: AppColors.primary,
                        ),
                      ),

                      // Plus
                      IconButton(
                        icon: const Icon(Icons.add_circle),
                        color: AppColors.primary,
                        onPressed: () {
                          setState(() => _quantity++);
                          widget.onQuantityChanged?.call(_quantity);
                        },
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
