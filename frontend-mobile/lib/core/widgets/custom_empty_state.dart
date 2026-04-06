import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_typography.dart';

/// Empty state widget for showing empty lists/results
class CustomEmptyState extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;
  final VoidCallback? onActionTap;
  final String? actionLabel;
  final Color? iconColor;

  const CustomEmptyState({
    Key? key,
    required this.title,
    required this.description,
    required this.icon,
    this.onActionTap,
    this.actionLabel,
    this.iconColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.paddingXxl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Icon
              Icon(
                icon,
                size: 80,
                color: iconColor ?? AppColors.gray300,
              ),
              const SizedBox(height: AppSpacing.paddingXxl),
              // Title
              Text(
                title,
                style: AppTypography.headline4.copyWith(
                  color: AppColors.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.paddingMd),
              // Description
              Text(
                description,
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              // Action Button
              if (actionLabel != null && onActionTap != null) ...[
                const SizedBox(height: AppSpacing.paddingXxl),
                ElevatedButton(
                  onPressed: onActionTap,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.paddingXl,
                      vertical: AppSpacing.paddingMd,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(AppSpacing.buttonRadius),
                    ),
                  ),
                  child: Text(
                    actionLabel!,
                    style: AppTypography.labelLarge.copyWith(
                      fontSize: 14,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
