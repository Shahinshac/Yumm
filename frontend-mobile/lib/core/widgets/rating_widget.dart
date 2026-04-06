import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_typography.dart';

class RatingWidget extends StatelessWidget {
  final double rating;
  final int reviewCount;
  final double size;
  final bool showText;

  const RatingWidget({
    Key? key,
    required this.rating,
    required this.reviewCount,
    this.size = 24,
    this.showText = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.star_rounded, color: AppColors.rating, size: size),
        const SizedBox(width: AppSpacing.xs),
        if (showText)
          Text(
            '${rating.toStringAsFixed(1)} ($reviewCount)',
            style: AppTypography.labelMedium,
          ),
      ],
    );
  }
}

class RatingSelector extends StatefulWidget {
  final int initialRating;
  final Function(int) onRatingChanged;
  final double size;

  const RatingSelector({
    Key? key,
    this.initialRating = 0,
    required this.onRatingChanged,
    this.size = 32,
  }) : super(key: key);

  @override
  State<RatingSelector> createState() => _RatingSelectorState();
}

class _RatingSelectorState extends State<RatingSelector> {
  late int _rating;

  @override
  void initState() {
    super.initState();
    _rating = widget.initialRating;
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(
        5,
        (index) => GestureDetector(
          onTap: () {
            setState(() => _rating = index + 1);
            widget.onRatingChanged(index + 1);
          },
          child: Icon(
            Icons.star_rounded,
            color: index < _rating ? AppColors.rating : AppColors.gray300,
            size: widget.size,
          ),
        ),
      ).separated(const SizedBox(width: AppSpacing.sm)),
    );
  }
}

extension SeparatorExtension<T> on List<T> {
  List<T> separated(T separator) {
    final result = <T>[];
    for (int i = 0; i < length; i++) {
      result.add(this[i]);
      if (i < length - 1) result.add(separator);
    }
    return result;
  }
}
