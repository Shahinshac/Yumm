import 'package:flutter/material.dart';
import 'app_colors.dart';

/// FoodHub Professional Typography System
/// Material 3 based text styles with proper hierarchy
class AppTypography {
  AppTypography._(); // Prevent instantiation

  // ─────────────────────────────────────────────────────────
  // DISPLAY STYLES (Extra Large Headlines)
  // ─────────────────────────────────────────────────────────
  /// Display Large (57pt, w500) - For hero/landing sections
  static const TextStyle displayLarge = TextStyle(
    fontSize: 57,
    fontWeight: FontWeight.w500,
    letterSpacing: 0,
    height: 1.12,
    color: AppColors.textPrimary,
  );

  /// Display Medium (45pt, w500)
  static const TextStyle displayMedium = TextStyle(
    fontSize: 45,
    fontWeight: FontWeight.w500,
    letterSpacing: 0,
    height: 1.16,
    color: AppColors.textPrimary,
  );

  /// Display Small (36pt, w500)
  static const TextStyle displaySmall = TextStyle(
    fontSize: 36,
    fontWeight: FontWeight.w500,
    letterSpacing: 0,
    height: 1.22,
    color: AppColors.textPrimary,
  );

  // ─────────────────────────────────────────────────────────
  // HEADLINE STYLES (Page Titles)
  // ─────────────────────────────────────────────────────────
  /// Headline 1 (32pt, w600) - Main page titles
  static const TextStyle headline1 = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.25,
    color: AppColors.textPrimary,
  );

  /// Headline 2 (28pt, w600) - Section headers
  static const TextStyle headline2 = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.29,
    color: AppColors.textPrimary,
  );

  /// Headline 3 (24pt, w600) - Subsection headers
  static const TextStyle headline3 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.33,
    color: AppColors.textPrimary,
  );

  /// Headline 4 (20pt, w600) - Card titles
  static const TextStyle headline4 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
    height: 1.4,
    color: AppColors.textPrimary,
  );

  /// Headline 5 (18pt, w600) - Small titles
  static const TextStyle headline5 = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
    height: 1.44,
    color: AppColors.textPrimary,
  );

  /// Headline 6 (16pt, w600) - Minimal titles
  static const TextStyle headline6 = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
    height: 1.5,
    color: AppColors.textPrimary,
  );

  // ─────────────────────────────────────────────────────────
  // SUBTITLE STYLES (Secondary Headlines)
  // ─────────────────────────────────────────────────────────
  /// Subtitle 1 (18pt, w500) - Section subtitle
  static const TextStyle subtitle1 = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.15,
    height: 1.56,
    color: AppColors.textSecondary,
  );

  /// Subtitle 2 (16pt, w500) - Card subtitle
  static const TextStyle subtitle2 = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.1,
    height: 1.62,
    color: AppColors.textSecondary,
  );

  // ─────────────────────────────────────────────────────────
  // BODY STYLES (Main Text Content)
  // ─────────────────────────────────────────────────────────
  /// Body Large (16pt, w400) - Main paragraph text
  static const TextStyle bodyLarge = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.5,
    height: 1.5,
    color: AppColors.textPrimary,
  );

  /// Body Medium (14pt, w400) - Secondary content
  static const TextStyle bodyMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.25,
    height: 1.57,
    color: AppColors.textPrimary,
  );

  /// Body Small (12pt, w400) - Minor content
  static const TextStyle bodySmall = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.4,
    height: 1.67,
    color: AppColors.textSecondary,
  );

  // ─────────────────────────────────────────────────────────
  // LABEL STYLES (UI Labels & Captions)
  // ─────────────────────────────────────────────────────────
  /// Label Large (14pt, w600) - Button labels
  static const TextStyle labelLarge = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.1,
    height: 1.43,
    color: AppColors.textOnPrimary,
  );

  /// Label Medium (12pt, w600) - Tags, badges
  static const TextStyle labelMedium = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
    height: 1.67,
    color: AppColors.textOnPrimary,
  );

  /// Label Small (11pt, w600) - Small labels
  static const TextStyle labelSmall = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
    height: 1.45,
    color: AppColors.textOnPrimary,
  );

  // ─────────────────────────────────────────────────────────
  // CAPTION STYLES (Descriptions, Hints)
  // ─────────────────────────────────────────────────────────
  /// Caption (12pt, w400) - Descriptions, hints
  static const TextStyle caption = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.4,
    height: 1.33,
    color: AppColors.textTertiary,
  );

  /// Caption Small (11pt, w400) - Very small details
  static const TextStyle captionSmall = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.5,
    height: 1.27,
    color: AppColors.textTertiary,
  );

  // ─────────────────────────────────────────────────────────
  // SPECIALIZED TEXT STYLES
  // ─────────────────────────────────────────────────────────
  /// Price/Amount styling (24pt, bold)
  static const TextStyle price = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w700,
    letterSpacing: 0,
    color: AppColors.primary,
  );

  /// Rating text (16pt, bold)
  static const TextStyle rating = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w700,
    letterSpacing: 0,
    color: AppColors.rating,
  );

  /// Error message (14pt, w500)
  static const TextStyle error = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.25,
    color: AppColors.error,
  );

  /// Success message (14pt, w500)
  static const TextStyle success = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.25,
    color: AppColors.success,
  );

  /// Warning message (14pt, w500)
  static const TextStyle warning = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.25,
    color: AppColors.warning,
  );

  /// Hint/Placeholder text
  static const TextStyle hint = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.25,
    color: AppColors.hint,
  );

  /// Disabled text
  static const TextStyle disabled = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    letterSpacing: 0.25,
    color: AppColors.disabled,
  );

  /// Link text (underlined, colored)
  static TextStyle link = const TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.25,
    color: AppColors.primary,
    decoration: TextDecoration.underline,
  );

  // ─────────────────────────────────────────────────────────
  // STATUS BADGE STYLES
  // ─────────────────────────────────────────────────────────
  /// Status badge text
  static const TextStyle statusBadge = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
    height: 1.5,
  );
}
