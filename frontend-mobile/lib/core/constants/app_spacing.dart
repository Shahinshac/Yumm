/// FoodHub Professional Spacing System
/// Based on 8px base unit for consistent, predictable layouts
class AppSpacing {
  AppSpacing._(); // Prevent instantiation

  // ─────────────────────────────────────────────────────────
  // BASE SPACING SCALE
  // ─────────────────────────────────────────────────────────
  /// 4px - Icon padding, tight spacing
  static const double xs = 4.0;

  /// 8px - Base unit, component spacing
  static const double sm = 8.0;

  /// 12px - Increased spacing
  static const double md = 12.0;

  /// 16px - Standard spacing between sections
  static const double lg = 16.0;

  /// 20px - Large spacing
  static const double xl = 20.0;

  /// 24px - Extra large spacing
  static const double xxl = 24.0;

  /// 32px - Heading spacing
  static const double xxxl = 32.0;

  /// 48px - Page-level spacing
  static const double huge = 48.0;

  // ─────────────────────────────────────────────────────────
  // PADDING: Common padding values
  // ─────────────────────────────────────────────────────────
  /// Extra small padding
  static const double paddingXs = xs;

  /// Small padding (8px)
  static const double paddingSm = sm;

  /// Medium padding (12px)
  static const double paddingMd = md;

  /// Standard padding (16px)
  static const double paddingLg = lg;

  /// Large padding (20px)
  static const double paddingXl = xl;

  /// Extra large padding (24px)
  static const double paddingXxl = xxl;

  /// Huge padding (32px)
  static const double paddingHuge = xxxl;

  // ─────────────────────────────────────────────────────────
  // MARGINS: Common margin values
  // ─────────────────────────────────────────────────────────
  /// Extra small margin
  static const double marginXs = xs;

  /// Small margin (8px)
  static const double marginSm = sm;

  /// Medium margin (12px)
  static const double marginMd = md;

  /// Standard margin (16px)
  static const double marginLg = lg;

  /// Large margin (20px)
  static const double marginXl = xl;

  /// Extra large margin (24px)
  static const double marginXxl = xxl;

  /// Huge margin (32px)
  static const double marginHuge = xxxl;

  // ─────────────────────────────────────────────────────────
  // COMPONENTS: Spacing for specific UI elements
  // ─────────────────────────────────────────────────────────
  /// Button height
  static const double buttonHeight = 48.0;

  /// Input field height
  static const double inputHeight = 48.0;

  /// App bar height
  static const double appBarHeight = 56.0;

  /// Bottom navigation height
  static const double bottomNavHeight = 56.0;

  /// Icon size (small)
  static const double iconSm = 20.0;

  /// Icon size (standard)
  static const double iconMd = 24.0;

  /// Icon size (large)
  static const double iconLg = 32.0;

  /// Icon button size (min touch target)
  static const double iconButtonSize = 48.0;

  /// Card border radius
  static const double cardRadius = 12.0;

  /// Input border radius
  static const double inputRadius = 8.0;

  /// Button border radius
  static const double buttonRadius = 8.0;

  /// Dialog border radius
  static const double dialogRadius = 16.0;

  // ─────────────────────────────────────────────────────────
  // PAGE/SCREEN LAYOUTS
  // ─────────────────────────────────────────────────────────
  /// Standard page padding (horizontal)
  static const double pageHorizontalPadding = lg;

  /// Standard page padding (vertical)
  static const double pageVerticalPadding = lg;

  /// Maximum content width for web/tablet
  static const double maxContentWidth = 600.0;

  // ─────────────────────────────────────────────────────────
  // GAPS: Spacing between items (Column, Row)
  // ─────────────────────────────────────────────────────────
  /// Extra small gap (tight list items)
  static const double gapXs = xs;

  /// Small gap (compact list items)
  static const double gapSm = sm;

  /// Medium gap (normal list items)
  static const double gapMd = md;

  /// Standard gap (between sections)
  static const double gapLg = lg;

  /// Large gap (significant spacing)
  static const double gapXl = xl;

  /// Extra large gap (major section separation)
  static const double gapXxl = xxl;

  // ─────────────────────────────────────────────────────────
  // DIVIDER SPACING
  // ─────────────────────────────────────────────────────────
  /// Divider vertical padding
  static const double dividerVerticalPadding = md;

  /// Divider height
  static const double dividerHeight = 1.0;

  // ─────────────────────────────────────────────────────────
  // SHADOW/ELEVATION SPACING
  // ─────────────────────────────────────────────────────────
  /// Small shadow blur
  static const double shadowSm = 4.0;

  /// Medium shadow blur
  static const double shadowMd = 8.0;

  /// Large shadow blur
  static const double shadowLg = 12.0;

  /// Extra large shadow blur
  static const double shadowXl = 16.0;

  // ─────────────────────────────────────────────────────────
  // ANIMATION DURATIONS (milliseconds)
  // ─────────────────────────────────────────────────────────
  /// Quick animation (100ms)
  static const Duration durationQuick = Duration(milliseconds: 100);

  /// Standard animation (300ms)
  static const Duration durationStandard = Duration(milliseconds: 300);

  /// Medium animation (500ms)
  static const Duration durationMedium = Duration(milliseconds: 500);

  /// Long animation (800ms)
  static const Duration durationLong = Duration(milliseconds: 800);

  // ─────────────────────────────────────────────────────────
  // RESPONSIVE BREAKPOINTS
  // ─────────────────────────────────────────────────────────
  /// Mobile breakpoint width
  static const double breakpointMobile = 480.0;

  /// Tablet breakpoint width
  static const double breakpointTablet = 768.0;

  /// Desktop breakpoint width
  static const double breakpointDesktop = 1024.0;

  /// Large desktop breakpoint width
  static const double breakpointLargeDesktop = 1440.0;
}
