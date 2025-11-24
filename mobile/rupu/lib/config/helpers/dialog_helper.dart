import 'dart:ui';
import 'package:flutter/material.dart';

class DialogHelper {
  static Future<T?> showBlurredDialog<T>({
    required BuildContext context,
    required WidgetBuilder builder,
    bool barrierDismissible = true,
    Color barrierColor = Colors.black54,
    double blurSigma = 5.0,
  }) {
    return showGeneralDialog<T>(
      context: context,
      barrierDismissible: barrierDismissible,
      barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
      barrierColor: barrierColor,
      transitionDuration: const Duration(milliseconds: 200),
      pageBuilder: (ctx, anim1, anim2) {
        return builder(ctx);
      },
      transitionBuilder: (ctx, anim1, anim2, child) {
        return BackdropFilter(
          filter: ImageFilter.blur(
            sigmaX: blurSigma * anim1.value,
            sigmaY: blurSigma * anim1.value,
          ),
          child: FadeTransition(opacity: anim1, child: child),
        );
      },
    );
  }

  static Future<T?> showBlurredBottomSheet<T>({
    required BuildContext context,
    required WidgetBuilder builder,
    bool isScrollControlled = true,
    bool useRootNavigator = true,
    Color barrierColor = Colors.black54,
    double blurSigma = 3.0,
  }) {
    // Standard bottom sheet with a blurred background is tricky because
    // the barrier is handled by the route.
    // We can simulate it by using a transparent barrier and wrapping the content
    // but that doesn't blur the *rest* of the screen.
    //
    // A better approach for "Liquid Glass" feel is to just use a semi-transparent
    // barrier color (which we have) and ensure the sheet ITSELF is glass.
    //
    // However, if we really want the background blurred, we can try to use
    // a custom route or just stick to the barrier color for now as standard
    // bottom sheets don't easily support backdrop filter on the barrier.

    return showModalBottomSheet<T>(
      context: context,
      backgroundColor: Colors.transparent,
      barrierColor: barrierColor,
      isScrollControlled: isScrollControlled,
      useRootNavigator: useRootNavigator,
      builder: (ctx) {
        // We can't easily blur the background *behind* the sheet here
        // without a custom route.
        // So we will rely on the barrierColor and the GlassContainer of the sheet itself.
        return builder(ctx);
      },
    );
  }

  static Future<void> showLoading(BuildContext context) {
    return showBlurredDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const Center(child: CircularProgressIndicator()),
    );
  }
}
