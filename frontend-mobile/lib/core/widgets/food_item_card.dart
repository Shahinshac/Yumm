import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_typography.dart';

/// Food item card for displaying menu items
class FoodItemCard extends StatelessWidget {
  final String itemName;
  final String description;
  final double price;
  final double rating;
  final String imageUrl;
  final int quantity;
  final VoidCallback onAddTap;
  final VoidCallback onRemoveTap;
  final VoidCallback onTap;

  const FoodItemCard({
    Key? key,
    required this.itemName,
    required this.description,
    required this.price,
    required this.rating,
    required this.imageUrl,
    required this.onAddTap,
    required this.onRemoveTap,
    required this.onTap,
    this.quantity = 0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with Rating Badge
            Stack(
              children: [
                // Image
                Container(
                  width: double.infinity,
                  height: 140,
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(AppSpacing.cardRadius),
                      topRight: Radius.circular(AppSpacing.cardRadius),
                    ),
                    color: AppColors.gray200,
                    image: imageUrl.isNotEmpty
                        ? DecorationImage(
                            image: NetworkImage(imageUrl),
                            fit: BoxFit.cover,
                          )
                        : null,
                  ),
                  child: imageUrl.isEmpty
                      ? Icon(
                          Icons.fastfood,
                          size: 50,
                          color: AppColors.textTertiary,
                        )
                      : null,
                ),
                // Rating Badge
                Positioned(
                  left: AppSpacing.paddingSm,
                  top: AppSpacing.paddingSm,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.paddingXs,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(4),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.black.withOpacity(0.1),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.star,
                          color: AppColors.rating,
                          size: 14,
                        ),
                        const SizedBox(width: 2),
                        Text(
                          rating.toStringAsFixed(1),
                          style: AppTypography.labelSmall.copyWith(
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            // Content
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.paddingMd),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Item Name
                    Text(
                      itemName,
                      style: AppTypography.headline6,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AppSpacing.paddingXs),
                    // Description
                    Text(
                      description,
                      style: AppTypography.bodySmall,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AppSpacing.paddingMd),
                    // Price and Quantity Selector
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Price
                        Text(
                          '₹${price.toStringAsFixed(0)}',
                          style: AppTypography.price.copyWith(fontSize: 18),
                        ),
                        // Quantity Selector
                        if (quantity == 0)
                          GestureDetector(
                            onTap: onAddTap,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.paddingMd,
                                vertical: AppSpacing.paddingXs,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'Add',
                                style:
                                    AppTypography.labelSmall.copyWith(fontSize: 11),
                              ),
                            ),
                          )
                        else
                          Container(
                            decoration: BoxDecoration(
                              border: Border.all(color: AppColors.border),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Row(
                              children: [
                                GestureDetector(
                                  onTap: onRemoveTap,
                                  child: Container(
                                    padding: const EdgeInsets.all(2),
                                    child: const Icon(
                                      Icons.remove,
                                      size: 16,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: AppSpacing.paddingSm,
                                  ),
                                  child: Text(
                                    quantity.toString(),
                                    style: AppTypography.labelSmall,
                                  ),
                                ),
                                GestureDetector(
                                  onTap: onAddTap,
                                  child: Container(
                                    padding: const EdgeInsets.all(2),
                                    child: const Icon(
                                      Icons.add,
                                      size: 16,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
