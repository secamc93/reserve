// presentation/views/login/login_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';
import 'package:rupu/config/helpers/design_helper.dart';
import 'package:rupu/config/helpers/dialog_helper.dart';
import 'package:rupu/config/helpers/responsive_helper.dart';

import '../../screens/screens.dart';
import '../../widgets/widgets.dart';

class LoginView extends GetView<LoginController> {
  final int pageIndex;
  const LoginView({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => FocusScope.of(context).unfocus(),
        child: ResponsiveHelper.isTablet(context)
            ? _TabletLayout(pageIndex: pageIndex)
            : _MobileLayout(pageIndex: pageIndex),
      ),
    );
  }
}

// Mobile Layout - Single column with stacked logo and form
class _MobileLayout extends GetView<LoginController> {
  final int pageIndex;
  const _MobileLayout({required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isLandscape = ResponsiveHelper.isLandscape(context);

    // Adjust logo size and spacing based on orientation
    final logoHeight = isLandscape ? 80.0 : 140.0;
    final topSpacing = isLandscape ? 16.0 : 48.0;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            cs.primary.withValues(alpha: 0.1),
            cs.secondary.withValues(alpha: 0.05),
            cs.tertiary.withValues(alpha: 0.08),
          ],
        ),
      ),
      child: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Logo with animation
                  TweenAnimationBuilder<double>(
                    duration: const Duration(milliseconds: 800),
                    tween: Tween(begin: 0.0, end: 1.0),
                    curve: Curves.easeOutBack,
                    builder: (context, value, child) {
                      return Transform.scale(
                        scale: value.clamp(0.0, 1.0),
                        child: Opacity(
                          opacity: value.clamp(0.0, 1.0),
                          child: child,
                        ),
                      );
                    },
                    child: CustomLogo(
                      height: logoHeight,
                      imagePath: "assets/images/logorufu.png",
                    ),
                  ),
                  SizedBox(height: topSpacing),

                  // Login Form Card
                  _LoginFormCard(pageIndex: pageIndex),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// Tablet Layout - Split screen with branding on left, form on right
class _TabletLayout extends GetView<LoginController> {
  final int pageIndex;
  const _TabletLayout({required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isLargeTablet = ResponsiveHelper.isLargeTablet(context);

    return Row(
      children: [
        // Left side - Branding section
        Expanded(
          flex: isLargeTablet ? 5 : 4,
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [cs.primary, cs.secondary, cs.tertiary],
                stops: const [0.0, 0.5, 1.0],
              ),
            ),
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(48),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Animated logo
                    TweenAnimationBuilder<double>(
                      duration: const Duration(milliseconds: 1000),
                      tween: Tween(begin: 0.0, end: 1.0),
                      curve: Curves.elasticOut,
                      builder: (context, value, child) {
                        final clampedValue = value.clamp(0.0, 1.0);
                        return Transform.scale(
                          scale: 0.5 + (clampedValue * 0.5),
                          child: Opacity(opacity: clampedValue, child: child),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(32),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.3),
                            width: 2,
                          ),
                        ),
                        child: CustomLogo(
                          height: isLargeTablet ? 200 : 160,
                          imagePath: "assets/images/logorufu.png",
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Welcome text
                    TweenAnimationBuilder<double>(
                      duration: const Duration(milliseconds: 1200),
                      tween: Tween(begin: 0.0, end: 1.0),
                      curve: Curves.easeOut,
                      builder: (context, value, child) {
                        final clampedValue = value.clamp(0.0, 1.0);
                        return Transform.translate(
                          offset: Offset(0, 30 * (1 - clampedValue)),
                          child: Opacity(opacity: clampedValue, child: child),
                        );
                      },
                      child: Column(
                        children: [
                          Text(
                            "Bienvenidos a Rupü",
                            style: Theme.of(context).textTheme.displaySmall
                                ?.copyWith(
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                  letterSpacing: -1.5,
                                  shadows: [
                                    Shadow(
                                      color: Colors.black.withValues(
                                        alpha: 0.3,
                                      ),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),

        // Right side - Login form
        Expanded(
          flex: isLargeTablet ? 6 : 5,
          child: Container(
            color: cs.surface,
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(48),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 500),
                  child: _LoginFormCard(pageIndex: pageIndex, isTablet: true),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// Reusable Login Form Card
class _LoginFormCard extends GetView<LoginController> {
  final int pageIndex;
  final bool isTablet;

  const _LoginFormCard({required this.pageIndex, this.isTablet = false});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return TweenAnimationBuilder<double>(
      duration: const Duration(milliseconds: 600),
      tween: Tween(begin: 0.0, end: 1.0),
      curve: Curves.easeOut,
      builder: (context, value, child) {
        final clampedValue = value.clamp(0.0, 1.0);
        return Transform.translate(
          offset: Offset(0, 20 * (1 - clampedValue)),
          child: Opacity(opacity: clampedValue, child: child),
        );
      },
      child: GlassContainer(
        borderRadius: BorderRadius.circular(isTablet ? 24 : 32),
        blur: isTablet ? 0 : 20,
        opacity: isTablet ? 0 : 0.7,
        border: isTablet
            ? null
            : Border.all(
                color: cs.outlineVariant.withValues(alpha: 0.3),
                width: 1.5,
              ),
        child: Padding(
          padding: EdgeInsets.all(isTablet ? 8 : 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Title section
              if (!isTablet) ...[
                Text(
                  "Bienvenidos a Rupü",
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
              ],
              Text(
                "Iniciar sesión",
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: isTablet ? cs.onSurface : cs.onSurfaceVariant,
                ),
                textAlign: isTablet ? TextAlign.left : TextAlign.center,
              ),
              if (isTablet) ...[
                const SizedBox(height: 8),
                Text(
                  "Ingresa tus credenciales para continuar",
                  style: Theme.of(
                    context,
                  ).textTheme.bodyLarge?.copyWith(color: cs.onSurfaceVariant),
                ),
              ],
              const SizedBox(height: 32),

              // Form
              Form(
                key: controller.formKey,
                child: Column(
                  children: [
                    CustomEmailField(
                      controller: controller.emailController,
                      labelText: "Email",
                      hintText: "ejemplo@dominio.com",
                    ),
                    const SizedBox(height: 20),
                    CustomPasswordField(
                      controller: controller.passwordController,
                      labelText: "Contraseña",
                      hintText: "Ingresa tu contraseña",
                    ),
                    const SizedBox(height: 12),

                    // Forgot password link
                    Row(
                      children: [
                        const Spacer(),
                        TextButton(
                          onPressed: () {}, // hook para recuperar contraseña
                          child: Text(
                            "¿Olvidaste contraseña?",
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                              color: cs.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Submit button
                    Obx(() {
                      return controller.isLoading.value
                          ? const Padding(
                              padding: EdgeInsets.symmetric(vertical: 12),
                              child: CircularProgressIndicator(strokeWidth: 3),
                            )
                          : CustomButton(
                              onPressed: () => _handleLogin(context),
                              textButton: 'Iniciar sesión',
                            );
                    }),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleLogin(BuildContext context) async {
    final ok = await controller.submit();
    if (!context.mounted) return;

    if (ok) {
      if (controller.isSuperAdmin) {
        final activated = await controller.activateSuperAdminSession();
        if (!context.mounted) return;
        if (activated) {
          GoRouter.of(
            context,
          ).goNamed(HomeScreen.name, pathParameters: {'page': '$pageIndex'});
        } else {
          _showError(
            context,
            controller.errorMessage.value ??
                'No fue posible completar la sesión del super administrador.',
          );
        }
        return;
      }

      final businesses = controller.businesses;
      if (businesses.isEmpty) {
        const message = 'Tu usuario no tiene negocios disponibles.';
        controller.errorMessage.value ??= message;
        _showError(context, controller.errorMessage.value ?? message);
        return;
      }

      if (controller.hasBusinessScope) {
        GoRouter.of(context).goNamed(BusinessSelectorScreen.name);
        return;
      }

      if (businesses.length == 1) {
        final activated = await controller.activateBusinessSession(
          businesses.first,
        );
        if (!context.mounted) return;
        if (activated) {
          GoRouter.of(
            context,
          ).goNamed(HomeScreen.name, pathParameters: {'page': '$pageIndex'});
        } else {
          _showError(
            context,
            controller.errorMessage.value ??
                'No fue posible activar el negocio seleccionado.',
          );
        }
      } else {
        GoRouter.of(context).goNamed(BusinessSelectorScreen.name);
      }
    } else if (controller.errorMessage.value != null) {
      _showError(context, controller.errorMessage.value!);
    }
  }

  void _showError(BuildContext context, String message) {
    DialogHelper.showBlurredDialog(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.3),
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          'Error',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text(
              'OK',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}
