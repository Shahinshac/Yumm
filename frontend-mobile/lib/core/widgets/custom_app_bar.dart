import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_typography.dart';

/// Custom app bar with consistent styling for FoodHub
class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final bool showBack;
  final VoidCallback? onBackPressed;
  final List<Widget>? actions;
  final IconData? leadingIcon;
  final VoidCallback? onLeadingPressed;
  final Color? backgroundColor;
  final Color? titleColor;
  final double elevation;
  final bool centerTitle;

  const CustomAppBar({
    Key? key,
    required this.title,
    this.showBack = false,
    this.onBackPressed,
    this.actions,
    this.leadingIcon,
    this.onLeadingPressed,
    this.backgroundColor,
    this.titleColor,
    this.elevation = 2,
    this.centerTitle = false,
  }) : super(key: key);

  @override
  Size get preferredSize => const Size.fromHeight(AppSpacing.appBarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      elevation: elevation,
      backgroundColor: backgroundColor ?? AppColors.primary,
      foregroundColor: titleColor ?? AppColors.textOnPrimary,
      centerTitle: centerTitle,
      title: Text(
        title,
        style: AppTypography.headline6.copyWith(
          color: titleColor ?? AppColors.textOnPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),
      leading: showBack
          ? IconButton(
              icon: Icon(
                leadingIcon ?? Icons.arrow_back,
                color: titleColor ?? AppColors.textOnPrimary,
              ),
              onPressed: onBackPressed ?? () => Navigator.of(context).pop(),
            )
          : leadingIcon != null
              ? IconButton(
                  icon: Icon(
                    leadingIcon,
                    color: titleColor ?? AppColors.textOnPrimary,
                  ),
                  onPressed: onLeadingPressed,
                )
              : null,
      actions: actions,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.zero,
      ),
    );
  }
}
