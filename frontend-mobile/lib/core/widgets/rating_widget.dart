import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_typography.dart';

/// Rating display widget with stars
class RatingWidget extends StatelessWidget {
  final double rating;
  final int reviewCount;
  final bool showReviewCount;
  final double starSize;
  final TextStyle? textStyle;

  const RatingWidget({
    Key? key,
    required this.rating,
    required this.reviewCount,
    this.showReviewCount = true,
    this.starSize = 20,
    this.textStyle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final stars = List<Icon>.generate(5, (index) {
      return Icon(
        index < rating.toInt()
            ? Icons.star
            : (index < rating ? Icons.star_half : Icons.star_border),
        color: AppColors.rating,
        size: starSize,
      );
    });

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Stars
        ...stars,
        const SizedBox(width: AppSpacing.paddingSm),
        // Rating number
        Text(
          rating.toStringAsFixed(1),
          style: textStyle ??
              AppTypography.labelMedium.copyWith(
                color: AppColors.textPrimary,
              ),
        ),
        // Review count
        if (showReviewCount) ...[
          const SizedBox(width: AppSpacing.paddingXs),
          Text(
            '($reviewCount)',
            style: AppTypography.caption,
          ),
        ],
      ],
    );
  }
}

/// Interactive rating selector for giving ratings
class RatingSelector extends StatefulWidget {
  final double initialRating;
  final ValueChanged<double> onRatingChanged;
  final int maxRating;
  final double starSize;

  const RatingSelector({
    Key? key,
    this.initialRating = 0,
    required this.onRatingChanged,
    this.maxRating = 5,
    this.starSize = 40,
  }) : super(key: key);

  @override
  State<RatingSelector> createState() => _RatingSelectorState();
}

class _RatingSelectorState extends State<RatingSelector> {
  late double _currentRating;

  @override
  void initState() {
    super.initState();
    _currentRating = widget.initialRating;
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(widget.maxRating, (index) {
          return GestureDetector(
            onTap: () {
              setState(() {
                _currentRating = (index + 1).toDouble();
              });
              widget.onRatingChanged(_currentRating);
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.paddingXs),
              child: Icon(
                index < _currentRating.toInt()
                    ? Icons.star
                    : (index < _currentRating ? Icons.star_half : Icons.star_border),
                color: AppColors.rating,
                size: widget.starSize,
              ),
            ),
          );
        }),
      ),
    );
  }
}
