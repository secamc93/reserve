import 'package:flutter/material.dart';

/// Helper class for responsive design across different screen sizes.
///
/// Breakpoints:
/// - Mobile: < 600px
/// - Tablet: 600px - 899px
/// - Large Tablet/iPad Pro: 900px - 1199px
/// - Desktop: >= 1200px
class ResponsiveHelper {
  // Breakpoint constants
  static const double mobileMaxWidth = 600;
  static const double tabletMaxWidth = 900;
  static const double desktopMinWidth = 1200;

  /// Returns true if the screen width is >= 600px (tablet or larger)
  static bool isTablet(BuildContext context) {
    return MediaQuery.sizeOf(context).width >= mobileMaxWidth;
  }

  /// Returns true if the screen width is >= 900px (large tablet or desktop)
  static bool isLargeTablet(BuildContext context) {
    return MediaQuery.sizeOf(context).width >= tabletMaxWidth;
  }

  /// Returns true if the screen width is >= 1200px (desktop)
  static bool isDesktop(BuildContext context) {
    return MediaQuery.sizeOf(context).width >= desktopMinWidth;
  }

  /// Returns true if the screen width is < 600px (mobile only)
  static bool isMobile(BuildContext context) {
    return MediaQuery.sizeOf(context).width < mobileMaxWidth;
  }

  /// Returns true if the device is in landscape orientation
  static bool isLandscape(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    return size.width > size.height;
  }

  /// Returns the device type as an enum
  static DeviceType getDeviceType(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    if (width >= desktopMinWidth) return DeviceType.desktop;
    if (width >= tabletMaxWidth) return DeviceType.largeTablet;
    if (width >= mobileMaxWidth) return DeviceType.tablet;
    return DeviceType.mobile;
  }

  /// Returns an adaptive value based on the current screen size
  ///
  /// Example:
  /// ```dart
  /// final padding = ResponsiveHelper.value(
  ///   context,
  ///   mobile: 16.0,
  ///   tablet: 24.0,
  ///   desktop: 32.0,
  /// );
  /// ```
  static T value<T>(
    BuildContext context, {
    required T mobile,
    T? tablet,
    T? largeTablet,
    T? desktop,
  }) {
    final width = MediaQuery.sizeOf(context).width;

    if (width >= desktopMinWidth && desktop != null) return desktop;
    if (width >= tabletMaxWidth && largeTablet != null) return largeTablet;
    if (width >= mobileMaxWidth && tablet != null) return tablet;

    // Fallback chain
    return tablet ?? largeTablet ?? desktop ?? mobile;
  }

  /// Returns the number of columns for a grid layout based on screen width
  ///
  /// Default behavior:
  /// - Mobile: 1 column
  /// - Tablet: 2 columns
  /// - Large Tablet: 3 columns
  /// - Desktop: 4 columns
  static int getGridColumns(
    BuildContext context, {
    int mobile = 1,
    int tablet = 2,
    int largeTablet = 3,
    int desktop = 4,
  }) {
    return value(
      context,
      mobile: mobile,
      tablet: tablet,
      largeTablet: largeTablet,
      desktop: desktop,
    );
  }

  /// Returns adaptive padding based on screen size
  static EdgeInsets getAdaptivePadding(
    BuildContext context, {
    EdgeInsets? mobile,
    EdgeInsets? tablet,
    EdgeInsets? largeTablet,
    EdgeInsets? desktop,
  }) {
    return value(
      context,
      mobile: mobile ?? const EdgeInsets.all(16),
      tablet: tablet ?? const EdgeInsets.all(24),
      largeTablet: largeTablet ?? const EdgeInsets.all(32),
      desktop: desktop ?? const EdgeInsets.all(40),
    );
  }

  /// Returns adaptive spacing value
  static double getSpacing(
    BuildContext context, {
    double mobile = 16.0,
    double tablet = 24.0,
    double largeTablet = 32.0,
    double desktop = 40.0,
  }) {
    return value(
      context,
      mobile: mobile,
      tablet: tablet,
      largeTablet: largeTablet,
      desktop: desktop,
    );
  }

  /// Returns maximum content width for centered layouts
  /// Useful for preventing content from stretching too wide on large screens
  static double getMaxContentWidth(BuildContext context) {
    return value(
      context,
      mobile: double.infinity,
      tablet: 800,
      largeTablet: 1000,
      desktop: 1200,
    );
  }

  /// Returns the appropriate font size scale based on screen size
  static double getFontSizeScale(BuildContext context) {
    return value(
      context,
      mobile: 1.0,
      tablet: 1.1,
      largeTablet: 1.15,
      desktop: 1.2,
    );
  }

  /// Returns adaptive icon size
  static double getIconSize(
    BuildContext context, {
    double mobile = 24.0,
    double tablet = 28.0,
    double largeTablet = 32.0,
    double desktop = 36.0,
  }) {
    return value(
      context,
      mobile: mobile,
      tablet: tablet,
      largeTablet: largeTablet,
      desktop: desktop,
    );
  }

  /// Returns adaptive border radius
  static double getBorderRadius(
    BuildContext context, {
    double mobile = 12.0,
    double tablet = 16.0,
    double largeTablet = 20.0,
    double desktop = 24.0,
  }) {
    return value(
      context,
      mobile: mobile,
      tablet: tablet,
      largeTablet: largeTablet,
      desktop: desktop,
    );
  }

  /// Helper to build different widgets for different screen sizes
  ///
  /// Example:
  /// ```dart
  /// ResponsiveHelper.builder(
  ///   context,
  ///   mobile: (context) => MobileLayout(),
  ///   tablet: (context) => TabletLayout(),
  /// )
  /// ```
  static Widget builder(
    BuildContext context, {
    required WidgetBuilder mobile,
    WidgetBuilder? tablet,
    WidgetBuilder? largeTablet,
    WidgetBuilder? desktop,
  }) {
    final width = MediaQuery.sizeOf(context).width;

    if (width >= desktopMinWidth && desktop != null) {
      return desktop(context);
    }
    if (width >= tabletMaxWidth && largeTablet != null) {
      return largeTablet(context);
    }
    if (width >= mobileMaxWidth && tablet != null) {
      return tablet(context);
    }

    return mobile(context);
  }
}

/// Enum representing different device types
enum DeviceType { mobile, tablet, largeTablet, desktop }
