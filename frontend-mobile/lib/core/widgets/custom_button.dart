import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_typography.dart';

/// Custom button widget with variants and consistent styling
enum ButtonVariant { primary, secondary, tertiary, danger }

enum ButtonSize { small, medium, large }

class CustomButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final VoidCallback? onLongPress;
  final ButtonVariant variant;
  final ButtonSize size;
  final bool isLoading;
  final bool isEnabled;
  final IconData? icon;
  final double? width;
  final EdgeInsets? padding;

  const CustomButton({
    Key? key,
    required this.label,
    required this.onPressed,
    this.onLongPress,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.medium,
    this.isLoading = false,
    this.isEnabled = true,
    this.icon,
    this.width,
    this.padding,
  }) : super(key: key);

  Color _getBackgroundColor() {
    if (!isEnabled) return AppColors.disabled;
    switch (variant) {
      case ButtonVariant.primary:
        return AppColors.primary;
      case ButtonVariant.secondary:
        return AppColors.secondary;
      case ButtonVariant.tertiary:
        return AppColors.tertiary;
      case ButtonVariant.danger:
        return AppColors.error;
    }
  }

  Color _getTextColor() {
    if (!isEnabled) return AppColors.textTertiary;
    return AppColors.textOnPrimary;
  }

  double _getHeight() {
    switch (size) {
      case ButtonSize.small:
        return 40;
      case ButtonSize.medium:
        return 48;
      case ButtonSize.large:
        return 56;
    }
  }

  TextStyle _getTextStyle() {
    double fontSize;
    switch (size) {
      case ButtonSize.small:
        fontSize = 12;
        break;
      case ButtonSize.medium:
        fontSize = 14;
        break;
      case ButtonSize.large:
        fontSize = 16;
        break;
    }
    return AppTypography.labelLarge.copyWith(fontSize: fontSize);
  }

  @override
  Widget build(BuildContext context) {
    final buttonContent = isLoading
        ? SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(_getTextColor()),
            ),
          )
        : icon != null
            ? Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(icon, size: 20),
                  const SizedBox(width: AppSpacing.paddingSm),
                  Text(label),
                ],
              )
            : Text(label);

    final buttonStyle = ElevatedButton.styleFrom(
      backgroundColor: variant == ButtonVariant.secondary ||
              variant == ButtonVariant.tertiary ||
              variant == ButtonVariant.danger
          ? _getBackgroundColor()
          : _getBackgroundColor(),
      foregroundColor: _getTextColor(),
      disabledBackgroundColor: AppColors.disabled,
      disabledForegroundColor: AppColors.textTertiary,
      padding: padding ??
          EdgeInsets.symmetric(
            horizontal: AppSpacing.paddingLg,
            vertical: AppSpacing.paddingMd,
          ),
      minimumSize: Size(width ?? double.infinity, _getHeight()),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.buttonRadius),
      ),
      elevation: 2,
      shadowColor: _getBackgroundColor().withOpacity(0.5),
    );

    return SizedBox(
      width: width,
      child: ElevatedButton(
        onPressed: isEnabled && !isLoading ? onPressed : null,
        onLongPress: isEnabled && !isLoading ? onLongPress : null,
        style: buttonStyle,
        child: buttonContent,
      ),
    );
  }
}

/// Secondary/Outlined button variant
class CustomOutlinedButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final ButtonVariant variant;
  final ButtonSize size;
  final bool isLoading;
  final bool isEnabled;
  final IconData? icon;
  final double? width;

  const CustomOutlinedButton({
    Key? key,
    required this.label,
    required this.onPressed,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.medium,
    this.isLoading = false,
    this.isEnabled = true,
    this.icon,
    this.width,
  }) : super(key: key);

  Color _getBorderColor() {
    if (!isEnabled) return AppColors.disabled;
    switch (variant) {
      case ButtonVariant.primary:
        return AppColors.primary;
      case ButtonVariant.secondary:
        return AppColors.secondary;
      case ButtonVariant.tertiary:
        return AppColors.tertiary;
      case ButtonVariant.danger:
        return AppColors.error;
    }
  }

  double _getHeight() {
    switch (size) {
      case ButtonSize.small:
        return 40;
      case ButtonSize.medium:
        return 48;
      case ButtonSize.large:
        return 56;
    }
  }

  @override
  Widget build(BuildContext context) {
    final borderColor = _getBorderColor();

    final buttonContent = isLoading
        ? SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(borderColor),
            ),
          )
        : icon != null
            ? Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(icon, size: 20),
                  const SizedBox(width: AppSpacing.paddingSm),
                  Text(label),
                ],
              )
            : Text(label);

    return SizedBox(
      width: width,
      child: OutlinedButton(
        onPressed: isEnabled && !isLoading ? onPressed : null,
        style: OutlinedButton.styleFrom(
          foregroundColor: borderColor,
          disabledForegroundColor: AppColors.disabled,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.paddingLg,
            vertical: AppSpacing.paddingMd,
          ),
          minimumSize: Size(width ?? double.infinity, _getHeight()),
          side: BorderSide(color: borderColor, width: 2),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.buttonRadius),
          ),
        ),
        child: buttonContent,
      ),
    );
  }
}
