import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_typography.dart';

class RatingWidget extends StatelessWidget {
  final double rating;
  final int? reviewCount;
  final double size;
  final bool interactive;

  const RatingWidget({
    super.key,
    required this.rating,
    this.reviewCount,
    this.size = 20,
    this.interactive = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildStars(),
        if (reviewCount != null) ...[
          const SizedBox(width: AppSpacing.xs),
          Text(
            '($reviewCount)',
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.textTertiary,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildStars() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final starRating = index + 1;
        final isFilled = starRating <= rating;
        final isHalf = starRating - 1 < rating && rating < starRating;

        return Padding(
          padding: EdgeInsets.only(
            right: index < 4 ? AppSpacing.xs : 0,
          ),
          child: Icon(
            isHalf ? Icons.star_half : Icons.star,
            color: isFilled || isHalf ? AppColors.rating : AppColors.gray300,
            size: size,
          ),
        );
      }),
    );
  }
}

class RatingSelector extends StatefulWidget {
  final double initialRating;
  final Function(double) onRatingChanged;
  final double size;

  const RatingSelector({
    super.key,
    this.initialRating = 0,
    required this.onRatingChanged,
    this.size = 40,
  });

  @override
  State<RatingSelector> createState() => _RatingSelectorState();
}

class _RatingSelectorState extends State<RatingSelector> {
  late double _rating;

  @override
  void initState() {
    super.initState();
    _rating = widget.initialRating;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: List.generate(5, (index) {
            return GestureDetector(
              onTap: () {
                setState(() {
                  _rating = (index + 1).toDouble();
                });
                widget.onRatingChanged(_rating);
              },
              child: Padding(
                padding: EdgeInsets.only(
                  right: index < 4 ? AppSpacing.md : 0,
                ),
                child: Icon(
                  (index + 1) <= _rating ? Icons.star : Icons.star_border,
                  color: (index + 1) <= _rating
                      ? AppColors.rating
                      : AppColors.gray300,
                  size: widget.size,
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: AppSpacing.md),
        Text(
          'Rating: ${_rating.toStringAsFixed(0)}/5',
          style: AppTypography.bodyMedium.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
