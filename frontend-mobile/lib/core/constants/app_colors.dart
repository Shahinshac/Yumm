import 'package:flutter/material.dart';

/// FoodHub Professional Color Palette
/// Based on modern food delivery app design patterns
class AppColors {
  AppColors._(); // Prevent instantiation

  // ─────────────────────────────────────────────────────────
  // PRIMARY COLORS
  // ─────────────────────────────────────────────────────────
  /// Main brand color - vibrant orange for food delivery
  static const Color primary = Color(0xFFFF6B35);

  /// Light variant of primary
  static const Color primaryLight = Color(0xFFFFB380);

  /// Dark variant of primary
  static const Color primaryDark = Color(0xFFC94A1E);

  // ─────────────────────────────────────────────────────────
  // SECONDARY COLORS
  // ─────────────────────────────────────────────────────────
  /// Secondary brand color - warm orange
  static const Color secondary = Color(0xFFF7931E);

  /// Light variant of secondary
  static const Color secondaryLight = Color(0xFFFDBC6B);

  /// Dark variant of secondary
  static const Color secondaryDark = Color(0xFFC97000);

  // ─────────────────────────────────────────────────────────
  // TERTIARY COLORS
  // ─────────────────────────────────────────────────────────
  /// Tertiary color - modern blue for accents
  static const Color tertiary = Color(0xFF004E89);

  /// Light variant of tertiary
  static const Color tertiaryLight = Color(0xFF5FA8D3);

  /// Dark variant of tertiary
  static const Color tertiaryDark = Color(0xFF002E5C);

  // ─────────────────────────────────────────────────────────
  // SEMANTIC COLORS
  // ─────────────────────────────────────────────────────────
  /// Success/positive action color
  static const Color success = Color(0xFF4CAF50);

  /// Success light variant
  static const Color successLight = Color(0xFF81C784);

  /// Error/destructive action color
  static const Color error = Color(0xFFF44336);

  /// Error light variant
  static const Color errorLight = Color(0xFFEF5350);

  /// Warning/alert color
  static const Color warning = Color(0xFFFFC107);

  /// Warning light variant
  static const Color warningLight = Color(0xFFFFD54F);

  /// Info color
  static const Color info = Color(0xFF2196F3);

  /// Info light variant
  static const Color infoLight = Color(0xFF64B5F6);

  // ─────────────────────────────────────────────────────────
  // NEUTRAL COLORS
  // ─────────────────────────────────────────────────────────
  /// Pure white
  static const Color white = Color(0xFFFFFFFF);

  /// Light gray background
  static const Color gray50 = Color(0xFFFAFAFA);

  /// Very light gray
  static const Color gray100 = Color(0xFFF5F5F5);

  /// Light gray
  static const Color gray200 = Color(0xFFEEEEEE);

  /// Medium light gray
  static const Color gray300 = Color(0xFFE0E0E0);

  /// Medium gray
  static const Color gray400 = Color(0xFFBDBDBD);

  /// Medium dark gray
  static const Color gray500 = Color(0xFF9E9E9E);

  /// Dark gray
  static const Color gray600 = Color(0xFF757575);

  /// Very dark gray
  static const Color gray700 = Color(0xFF616161);

  /// Near black gray
  static const Color gray800 = Color(0xFF424242);

  /// Pure black
  static const Color black = Color(0xFF000000);

  // ─────────────────────────────────────────────────────────
  // SEMANTIC GRAYS FOR UI
  // ─────────────────────────────────────────────────────────
  /// Surface background color
  static const Color surface = gray50;

  /// Container/card background
  static const Color surfaceVariant = white;

  /// Disabled state color
  static const Color disabled = gray300;

  /// Placeholder/hint text color
  static const Color hint = gray500;

  /// Border/divider color
  static const Color border = gray300;

  /// Overlay/scrim color
  static const Color scrim =
      Color.fromARGB(82, 0, 0, 0); // black with 0.32 opacity

  // ─────────────────────────────────────────────────────────
  // TEXT COLORS
  // ─────────────────────────────────────────────────────────
  /// Primary text color
  static const Color textPrimary = black;

  /// Secondary text color (for secondary content)
  static const Color textSecondary = gray600;

  /// Tertiary text color (weak content)
  static const Color textTertiary = gray500;

  /// Text on primary color background
  static const Color textOnPrimary = white;

  /// Text on secondary color background
  static const Color textOnSecondary = white;

  /// Text on accent background
  static const Color textOnAccent = white;

  // ─────────────────────────────────────────────────────────
  // RATING & RATING COLORS
  // ─────────────────────────────────────────────────────────
  /// Star/rating color
  static const Color rating = Color(0xFFFFB800);

  /// Empty star color
  static const Color ratingEmpty = gray300;

  // ─────────────────────────────────────────────────────────
  // DELIVERY STATUS COLORS
  // ─────────────────────────────────────────────────────────
  /// Pending order status
  static const Color statusPending = warning;

  /// Confirmed order status
  static const Color statusConfirmed = info;

  /// Preparing order status
  static const Color statusPreparing = secondary;

  /// On the way status
  static const Color statusOnTheWay = tertiary;

  /// Delivered status
  static const Color statusDelivered = success;

  /// Cancelled status
  static const Color statusCancelled = error;
}
