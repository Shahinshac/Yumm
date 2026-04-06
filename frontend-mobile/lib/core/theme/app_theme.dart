import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// FoodHub Professional Material 3 Theme
/// Complete design system with colors, typography, and component styling
class AppTheme {
  AppTheme._(); // Prevent instantiation

  /// Light theme configuration
  static ThemeData lightTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,

      // ─────────────────────────────────────────────────────────
      // COLOR SCHEME
      // ─────────────────────────────────────────────────────────
      colorScheme: ColorScheme.light(
        primary: AppColors.primary,
        onPrimary: AppColors.textOnPrimary,
        primaryContainer: AppColors.primaryLight,
        onPrimaryContainer: AppColors.primary,
        secondary: AppColors.secondary,
        onSecondary: AppColors.textOnSecondary,
        secondaryContainer: AppColors.secondaryLight,
        onSecondaryContainer: AppColors.secondary,
        tertiary: AppColors.tertiary,
        onTertiary: AppColors.textOnAccent,
        tertiaryContainer: AppColors.tertiaryLight,
        onTertiaryContainer: AppColors.tertiary,
        error: AppColors.error,
        onError: AppColors.white,
        errorContainer: AppColors.errorLight,
        onErrorContainer: AppColors.error,
        surface: AppColors.surface,
        onSurface: AppColors.textPrimary,
        surfaceVariant: AppColors.surfaceVariant,
        onSurfaceVariant: AppColors.textSecondary,
        outline: AppColors.border,
        outlineVariant: AppColors.gray200,
        scrim: AppColors.scrim,
      ),

      // ─────────────────────────────────────────────────────────
      // TYPOGRAPHY / TEXT THEME
      // ─────────────────────────────────────────────────────────
      textTheme: TextTheme(
        displayLarge: AppTypography.displayLarge,
        displayMedium: AppTypography.displayMedium,
        displaySmall: AppTypography.displaySmall,
        headlineLarge: AppTypography.headline1,
        headlineMedium: AppTypography.headline2,
        headlineSmall: AppTypography.headline3,
        titleLarge: AppTypography.headline4,
        titleMedium: AppTypography.headline5,
        titleSmall: AppTypography.headline6,
        bodyLarge: AppTypography.bodyLarge,
        bodyMedium: AppTypography.bodyMedium,
        bodySmall: AppTypography.bodySmall,
        labelLarge: AppTypography.labelLarge,
        labelMedium: AppTypography.labelMedium,
        labelSmall: AppTypography.labelSmall,
      ),

      // ─────────────────────────────────────────────────────────
      // APP BAR THEME
      // ─────────────────────────────────────────────────────────
      appBarTheme: AppBarTheme(
        elevation: 2,
        scrolledUnderElevation: 4,
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textOnPrimary,
        centerTitle: false,
        titleTextStyle: AppTypography.headline6.copyWith(
          color: AppColors.textOnPrimary,
          fontSize: 20,
        ),
        toolbarHeight: AppSpacing.appBarHeight,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.zero,
        ),
      ),

      // ─────────────────────────────────────────────────────────
      // ELEVATED BUTTON THEME
      // ─────────────────────────────────────────────────────────
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.paddingLg,
            vertical: AppSpacing.paddingMd,
          ),
          minimumSize: const Size.fromHeight(AppSpacing.buttonHeight),
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.textOnPrimary,
          elevation: 2,
          shadowColor: AppColors.primary.withOpacity(0.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.buttonRadius),
          ),
          textStyle: AppTypography.labelLarge.copyWith(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // ─────────────────────────────────────────────────────────
      // OUTLINED BUTTON THEME
      // ─────────────────────────────────────────────────────────
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.paddingLg,
            vertical: AppSpacing.paddingMd,
          ),
          minimumSize: const Size.fromHeight(AppSpacing.buttonHeight),
          backgroundColor: Colors.transparent,
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary, width: 2),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.buttonRadius),
          ),
          textStyle: AppTypography.labelLarge.copyWith(
            color: AppColors.primary,
            fontSize: 16,
          ),
        ),
      ),

      // ─────────────────────────────────────────────────────────
      // TEXT BUTTON THEME
      // ─────────────────────────────────────────────────────────
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.paddingMd,
            vertical: AppSpacing.paddingSm,
          ),
          minimumSize: const Size(AppSpacing.buttonHeight, AppSpacing.buttonHeight),
          foregroundColor: AppColors.primary,
          textStyle: AppTypography.labelLarge.copyWith(
            color: AppColors.primary,
          ),
        ),
      ),

      // ─────────────────────────────────────────────────────────
      // INPUT DECORATION THEME
      // ─────────────────────────────────────────────────────────
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.gray100,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.paddingLg,
          vertical: AppSpacing.paddingMd,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.inputRadius),
          borderSide: const BorderSide(color: AppColors.border, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.inputRadius),
          borderSide: const BorderSide(color: AppColors.border, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.inputRadius),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.inputRadius),
          borderSide: const BorderSide(color: AppColors.error, width: 1),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.inputRadius),
          borderSide: const BorderSide(color: AppColors.error, width: 2),
        ),
        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.inputRadius),
          borderSide: const BorderSide(color: AppColors.disabled, width: 1),
        ),
        hintStyle: AppTypography.hint,
        errorStyle: AppTypography.error,
        labelStyle: AppTypography.labelMedium.copyWith(
          color: AppColors.textSecondary,
        ),
        floatingLabelBehavior: FloatingLabelBehavior.auto,
        isCollapsed: false,
      ),

      // ─────────────────────────────────────────────────────────
      // CARD THEME
      // ─────────────────────────────────────────────────────────
      cardTheme: CardTheme(
        color: AppColors.surfaceVariant,
        elevation: 2,
        shadowColor: AppColors.black.withOpacity(0.1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        ),
        clipBehavior: Clip.antiAlias,
        margin: const EdgeInsets.all(AppSpacing.marginMd),
      ),

      // ─────────────────────────────────────────────────────────
      // CHIP THEME
      // ─────────────────────────────────────────────────────────
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.gray100,
        disabledColor: AppColors.disabled,
        selectedColor: AppColors.primary,
        secondarySelectedColor: AppColors.secondary,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.paddingMd,
          vertical: AppSpacing.paddingSm,
        ),
        labelStyle: AppTypography.labelMedium,
        secondaryLabelStyle: AppTypography.labelMedium.copyWith(
          color: AppColors.textOnPrimary,
        ),
        brightness: Brightness.light,
        elevation: 1,
        pressElevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),

      // ─────────────────────────────────────────────────────────
      // DIALOG THEME
      // ─────────────────────────────────────────────────────────
      dialogTheme: DialogTheme(
        backgroundColor: AppColors.white,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.dialogRadius),
        ),
        contentTextStyle: AppTypography.bodyMedium,
        titleTextStyle: AppTypography.headline6,
      ),

      // ─────────────────────────────────────────────────────────
      // SCAFFOLD BACKGROUND
      // ─────────────────────────────────────────────────────────
      scaffoldBackgroundColor: AppColors.surface,

      // ─────────────────────────────────────────────────────────
      // FLOATING ACTION BUTTON THEME
      // ─────────────────────────────────────────────────────────
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textOnPrimary,
        elevation: 4,
        disabledElevation: 0,
        focusElevation: 8,
        hoverElevation: 8,
        highlightElevation: 12,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),

      // ─────────────────────────────────────────────────────────
      // SNACKBAR THEME
      // ─────────────────────────────────────────────────────────
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.gray800,
        contentTextStyle: AppTypography.bodyMedium.copyWith(
          color: AppColors.white,
        ),
        elevation: 6,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.cardRadius),
        ),
      ),

      // ─────────────────────────────────────────────────────────
      // BOTTOM SHEET THEME
      // ─────────────────────────────────────────────────────────
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: AppColors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 8,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(AppSpacing.dialogRadius),
            topRight: Radius.circular(AppSpacing.dialogRadius),
          ),
        ),
      ),

      // ─────────────────────────────────────────────────────────
      // PROGRESS INDICATOR THEME
      // ─────────────────────────────────────────────────────────
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.primary,
        linearMinHeight: 4,
      ),

      // ─────────────────────────────────────────────────────────
      // DIVIDER THEME
      // ─────────────────────────────────────────────────────────
      dividerTheme: const DividerThemeData(
        color: AppColors.border,
        thickness: AppSpacing.dividerHeight,
        space: AppSpacing.dividerVerticalPadding,
      ),

      // ─────────────────────────────────────────────────────────
      // ICON THEME
      // ─────────────────────────────────────────────────────────
      iconTheme: const IconThemeData(
        color: AppColors.textSecondary,
        size: AppSpacing.iconMd,
      ),

      // ─────────────────────────────────────────────────────────
      // PRIMARY ICON THEME
      // ─────────────────────────────────────────────────────────
      primaryIconTheme: const IconThemeData(
        color: AppColors.textOnPrimary,
        size: AppSpacing.iconMd,
      ),

      // ─────────────────────────────────────────────────────────
      // FONT FAMILY
      // ─────────────────────────────────────────────────────────
      fontFamily: 'Segoe UI',
    );
  }

  /// Dark theme configuration (prepared for future use)
  static ThemeData darkTheme() {
    return lightTheme(); // Can be customized later
  }
}
