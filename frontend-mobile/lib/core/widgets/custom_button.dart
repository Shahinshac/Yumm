import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../constants/app_typography.dart';

enum ButtonVariant { primary, secondary, outline, danger }

/// Professional Custom Button with multiple variants
class CustomButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final bool isLoading;
  final bool isEnabled;
  final double? width;
  final double? height;
  final Widget? prefixIcon;
  final Widget? suffixIcon;

  const CustomButton({
    Key? key,
    required this.label,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.isLoading = false,
    this.isEnabled = true,
    this.width,
    this.height,
    this.prefixIcon,
    this.suffixIcon,
  }) : super(key: key);

  @override
  State<CustomButton> createState() => _CustomButtonState();
}

class _CustomButtonState extends State<CustomButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onPressed() {
    if (widget.isEnabled && !widget.isLoading && widget.onPressed != null) {
      _controller.forward().then((_) {
        _controller.reverse();
      });
      widget.onPressed!();
    }
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scaleAnimation,
      child: GestureDetector(
        onTapDown: widget.isEnabled && !widget.isLoading ? (_) => _controller.forward() : null,
        onTapUp: widget.isEnabled && !widget.isLoading ? (_) => _controller.reverse() : null,
        onTapCancel: widget.isEnabled && !widget.isLoading ? () => _controller.reverse() : null,
        child: _buildButton(),
      ),
    );
  }

  Widget _buildButton() {
    final colors = _getButtonColors();
    final width = widget.width ?? double.infinity;
    final height = widget.height ?? AppSpacing.buttonHeight;

    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        gradient: _getGradient(colors),
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: widget.variant == ButtonVariant.outline
            ? Border.all(color: colors['border'] ?? colors['bg']!, width: 2)
            : null,
        boxShadow: widget.isEnabled && widget.variant != ButtonVariant.outline
            ? [
                BoxShadow(
                  color: colors['shadow']!.withOpacity(0.3),
                  blurRadius: AppSpacing.elevationMd,
                  offset: const Offset(0, 4),
                ),
              ]
            : [],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _onPressed,
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.md,
              ),
              child: widget.isLoading
                  ? _buildLoadingState(colors)
                  : _buildContent(colors),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContent(Map<String, Color> colors) {
    if (widget.prefixIcon != null || widget.suffixIcon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (widget.prefixIcon != null) ...[
            widget.prefixIcon!,
            const SizedBox(width: AppSpacing.md),
          ],
          Flexible(
            child: Text(
              widget.label,
              style: AppTypography.labelLarge.copyWith(
                color: colors['text'],
              ),
              textAlign: TextAlign.center,
            ),
          ),
          if (widget.suffixIcon != null) ...[
            const SizedBox(width: AppSpacing.md),
            widget.suffixIcon!,
          ],
        ],
      );
    }

    return Text(
      widget.label,
      style: AppTypography.labelLarge.copyWith(
        color: colors['text'],
      ),
      textAlign: TextAlign.center,
    );
  }

  Widget _buildLoadingState(Map<String, Color> colors) {
    return SizedBox(
      width: 20,
      height: 20,
      child: CircularProgressIndicator(
        strokeWidth: 2,
        valueColor: AlwaysStoppedAnimation<Color>(colors['text']!),
      ),
    );
  }

  Gradient? _getGradient(Map<String, Color> colors) {
    if (widget.variant == ButtonVariant.primary && widget.isEnabled) {
      return LinearGradient(
        colors: [
          colors['bg']!,
          colors['bg']!.withOpacity(0.9),
        ],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }
    return null;
  }

  Map<String, Color> _getButtonColors() {
    if (!widget.isEnabled) {
      return {
        'bg': AppColors.disabled,
        'text': AppColors.gray400,
        'shadow': AppColors.gray300,
        'border': AppColors.gray300,
      };
    }

    switch (widget.variant) {
      case ButtonVariant.primary:
        return {
          'bg': AppColors.primary,
          'text': AppColors.white,
          'shadow': AppColors.primary,
          'border': AppColors.primary,
        };
      case ButtonVariant.secondary:
        return {
          'bg': AppColors.secondary,
          'text': AppColors.white,
          'shadow': AppColors.secondary,
          'border': AppColors.secondary,
        };
      case ButtonVariant.danger:
        return {
          'bg': AppColors.error,
          'text': AppColors.white,
          'shadow': AppColors.error,
          'border': AppColors.error,
        };
      case ButtonVariant.outline:
        return {
          'bg': Colors.transparent,
          'text': AppColors.primary,
          'shadow': AppColors.gray200,
          'border': AppColors.primary,
        };
    }
  }
}
