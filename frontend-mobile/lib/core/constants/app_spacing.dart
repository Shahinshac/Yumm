import 'package:flutter/material.dart';

/// FoodHub Spacing System
/// Based on 8px base unit for consistent, predictable layouts
class AppSpacing {
  AppSpacing._(); // Prevent instantiation

  // ─────────────────────────────────────────────────────────
  // BASE SPACING UNIT
  // ─────────────────────────────────────────────────────────
  /// Base spacing unit - 8px
  static const double baseUnit = 8.0;

  // ─────────────────────────────────────────────────────────
  // ABSOLUTE SPACING VALUES
  // ─────────────────────────────────────────────────────────
  /// 4px - Minimal spacing
  static const double xs = 4.0;

  /// 8px - Extra small spacing
  static const double sm = 8.0;

  /// 12px - Small spacing
  static const double md = 12.0;

  /// 16px - Medium spacing (1x base)
  static const double lg = 16.0;

  /// 20px - Large spacing
  static const double xl = 20.0;

  /// 24px - Extra large spacing (3x base)
  static const double xxl = 24.0;

  /// 32px - Very large spacing (4x base)
  static const double xxxl = 32.0;

  /// 48px - Huge spacing (6x base)
  static const double huge = 48.0;

  /// 64px - Massive spacing (8x base)
  static const double massive = 64.0;

  // ─────────────────────────────────────────────────────────
  // RESPONSIVE PADDING
  // ─────────────────────────────────────────────────────────
  /// Page/screen padding
  static const EdgeInsets pagePadding = EdgeInsets.all(lg);

  /// Card padding
  static const EdgeInsets cardPadding = EdgeInsets.all(lg);

  /// Button padding
  static const EdgeInsets buttonPadding = EdgeInsets.symmetric(
    horizontal: lg,
    vertical: md,
  );

  /// Text field padding
  static const EdgeInsets textFieldPadding = EdgeInsets.symmetric(
    horizontal: lg,
    vertical: lg,
  );

  /// List item padding
  static const EdgeInsets listItemPadding = EdgeInsets.symmetric(
    horizontal: lg,
    vertical: md,
  );

  /// Dialog padding
  static const EdgeInsets dialogPadding = EdgeInsets.all(xxl);

  /// Bottom sheet padding
  static const EdgeInsets bottomSheetPadding =
      EdgeInsets.fromLTRB(lg, lg, lg, lg);

  // ─────────────────────────────────────────────────────────
  // SPACING FOR GAPS
  // ─────────────────────────────────────────────────────────
  /// Minimal gap between items
  static const SizedBox gapXs = SizedBox(height: xs, width: xs);

  /// Small gap between items
  static const SizedBox gapSm = SizedBox(height: sm, width: sm);

  /// Medium gap between items
  static const SizedBox gapMd = SizedBox(height: md, width: md);

  /// Large gap between items
  static const SizedBox gapLg = SizedBox(height: lg, width: lg);

  /// Extra large gap between items
  static const SizedBox gapXl = SizedBox(height: xl, width: xl);

  /// Very large gap between items
  static const SizedBox gapXxl = SizedBox(height: xxl, width: xxl);

  /// Horizontal gap LG
  static const SizedBox gapHLg = SizedBox(width: lg);

  /// Vertical gap LG
  static const SizedBox gapVLg = SizedBox(height: lg);

  // ─────────────────────────────────────────────────────────
  // BORDER RADIUS
  // ─────────────────────────────────────────────────────────
  /// Small border radius (4px)
  static const double radiusSm = 4.0;

  /// Small border radius (8px)
  static const double radiusMd = 8.0;

  /// Medium border radius (12px)
  static const double radiusLg = 12.0;

  /// Large border radius (16px)
  static const double radiusXl = 16.0;

  // ─────────────────────────────────────────────────────────
  // ELEVATION/SHADOWS
  // ─────────────────────────────────────────────────────────
  /// Low elevation (subtle shadow)
  static const double elevationLow = 2.0;

  /// Medium elevation (standard shadow)
  static const double elevationMd = 4.0;

  /// High elevation (prominent shadow)
  static const double elevationHigh = 8.0;

  /// Maximum elevation
  static const double elevationMax = 12.0;

  // ─────────────────────────────────────────────────────────
  // COMPONENT DIMENSIONS
  // ─────────────────────────────────────────────────────────
  /// Standard button height
  static const double buttonHeight = 48.0;

  /// Divider height
  static const double dividerHeight = 1.0;

  /// Standard duration (300ms) - normal interactions
  static const Duration durationMd = Duration(milliseconds: 300);

  /// Long duration (500ms) - deliberate
  static const Duration durationLg = Duration(milliseconds: 500);

  /// Extra long duration (800ms) - slow transitions
  static const Duration durationXl = Duration(milliseconds: 800);
}
