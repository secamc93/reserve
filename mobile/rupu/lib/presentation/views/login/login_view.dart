// presentation/views/login/login_view.dart
import 'dart:io' show Platform;
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:lottie/lottie.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:local_auth/local_auth.dart';
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
      resizeToAvoidBottomInset: false, // Manejamos el teclado manualmente
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

    // Detectar si el teclado está visible
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    final isKeyboardVisible = bottomInset > 0;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            cs.primary.withValues(alpha: 0.15),
            cs.surface,
            cs.secondary.withValues(alpha: 0.1),
          ],
          stops: const [0.0, 0.5, 1.0],
        ),
      ),
      child: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                top: 16,
                bottom: bottomInset + 16, // Padding dinámico para el teclado
              ),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight - bottomInset - 32,
                  maxWidth: 480,
                ),
                child: IntrinsicHeight(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Logo con animación - Se oculta/achica con teclado
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                        height: isKeyboardVisible
                            ? (isLandscape
                                  ? 0
                                  : 60) // Muy pequeño o oculto con teclado
                            : (isLandscape ? 80 : 140), // Tamaño normal
                        child: isKeyboardVisible && isLandscape
                            ? const SizedBox.shrink()
                            : TweenAnimationBuilder<double>(
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
                                child: const CustomLogo(
                                  height: 170,
                                  imagePath: "assets/images/logorufu.png",
                                ),
                              ),
                      ),

                      SizedBox(height: isKeyboardVisible ? 6 : 20),

                      // Login Form Card
                      _LoginFormCard(pageIndex: pageIndex),

                      if (!isKeyboardVisible)
                        const Spacer(), // Empuja contenido al centro si hay espacio
                    ],
                  ),
                ),
              ),
            );
          },
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
        opacity: isTablet ? 0 : 0.8, // Más opacidad para mejor lectura
        border: isTablet
            ? null
            : Border.all(
                color: cs.outlineVariant.withValues(alpha: 0.4),
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
                    color: cs.primary,
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
                  fontSize: 24,
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
                          style: TextButton.styleFrom(
                            padding: EdgeInsets.zero,
                            minimumSize: const Size(0, 0),
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
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

                    // Biometric authentication button
                    Obx(() {
                      final showBiometric =
                          controller.isBiometricAvailable.value &&
                          controller.hasSavedCredentials.value;

                      // Estado de carga general para deshabilitar botones
                      final anyLoading =
                          controller.isFormLoading.value ||
                          controller.isBiometricLoading.value;

                      if (!showBiometric) {
                        // Submit button without biometric option
                        return controller.isFormLoading.value
                            ? Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 12,
                                ),
                                child: SizedBox(
                                  width: 60,
                                  height: 60,
                                  child: Lottie.asset(
                                    'assets/animation/loader/rupu_loader.json',
                                    fit: BoxFit.contain,
                                  ),
                                ),
                              )
                            : CustomButton(
                                onPressed: anyLoading
                                    ? null
                                    : () {
                                        _handleLogin(context);
                                      },
                                textButton: 'Iniciar sesión',
                              );
                      }

                      // Show biometric authentication option
                      return Column(
                        children: [
                          // Submit button with email/password
                          controller.isFormLoading.value
                              ? Padding(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                  ),
                                  child: SizedBox(
                                    width: 60,
                                    height: 60,
                                    child: Lottie.asset(
                                      'assets/animation/loader/rupu_loader.json',
                                      fit: BoxFit.contain,
                                    ),
                                  ),
                                )
                              : CustomButton(
                                  onPressed: anyLoading
                                      ? null
                                      : () {
                                          _handleLogin(context);
                                        },
                                  textButton: 'Iniciar sesión',
                                ),

                          const SizedBox(height: 24),

                          // Divider with text
                          Row(
                            children: [
                              Expanded(
                                child: Container(
                                  height: 1,
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        Colors.transparent,
                                        cs.outlineVariant.withValues(
                                          alpha: 0.5,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                ),
                                child: Text(
                                  'O continuar con',
                                  style: Theme.of(context).textTheme.bodySmall
                                      ?.copyWith(
                                        color: cs.onSurfaceVariant,
                                        fontWeight: FontWeight.w500,
                                      ),
                                ),
                              ),
                              Expanded(
                                child: Container(
                                  height: 1,
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        cs.outlineVariant.withValues(
                                          alpha: 0.5,
                                        ),
                                        Colors.transparent,
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 24),

                          // Biometric button
                          _BiometricButton(
                            biometricType: controller.biometricType.value,
                            description: controller.biometricDescription.value,
                            onPressed: anyLoading
                                ? null
                                : () {
                                    _handleBiometricLogin(context);
                                  },
                            isLoading: controller.isBiometricLoading.value,
                          ),
                        ],
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

  Future<void> _handleLogin(
    BuildContext context, {
    bool saveBiometric = false,
  }) async {
    final ok = await controller.submit(saveBiometric: saveBiometric);
    if (!context.mounted) return;

    if (ok) {
      // Si el login fue exitoso y NO se guardaron credenciales, preguntar si desea guardarlas
      if (!saveBiometric &&
          controller.isBiometricAvailable.value &&
          !controller.hasSavedCredentials.value) {
        await _askToSaveCredentials(context);
      }

      if (!context.mounted) return;

      if (controller.isSuperAdmin) {
        final activated = await controller.activateSuperAdminSession();
        if (!context.mounted) return;
        if (activated) {
          // REDIRECCIÓN SUPER ADMIN A IAM
          GoRouter.of(
            context,
          ).goNamed(IamScreen.name, pathParameters: {'page': '$pageIndex'});
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

  /// Pregunta al usuario si desea guardar sus credenciales para login biométrico
  Future<void> _askToSaveCredentials(BuildContext context) async {
    final cs = Theme.of(context).colorScheme;

    final shouldSave = await DialogHelper.showBlurredDialog<bool>(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.4),
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: cs.primaryContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.fingerprint, color: cs.primary, size: 28),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                '¿Guardar credenciales?',
                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '¿Deseas guardar tus credenciales para iniciar sesión con ${controller.biometricDescription.value} la próxima vez?',
              style: TextStyle(
                fontSize: 15,
                color: cs.onSurfaceVariant,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: cs.surfaceContainerHighest.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: cs.outlineVariant.withValues(alpha: 0.5),
                ),
              ),
              child: Row(
                children: [
                  Icon(Icons.security, size: 20, color: cs.primary),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Tus credenciales se guardarán de forma segura en el llavero del dispositivo.',
                      style: TextStyle(
                        fontSize: 12,
                        color: cs.onSurfaceVariant,
                        height: 1.3,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(
              'Ahora no',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: cs.onSurfaceVariant,
              ),
            ),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: FilledButton.styleFrom(
              backgroundColor: cs.primary,
              foregroundColor: cs.onPrimary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'Guardar',
              style: TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );

    if (shouldSave == true && context.mounted) {
      // Guardar las credenciales
      await controller.biometricService.saveCredentials(
        email: controller.emailController.text.trim().toLowerCase(),
        password: controller.passwordController.text,
      );
      controller.hasSavedCredentials.value = true;

      // Mostrar confirmación
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle, color: cs.onPrimary),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Credenciales guardadas. Ahora puedes usar ${controller.biometricDescription.value} para iniciar sesión.',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: cs.onPrimary,
                    ),
                  ),
                ),
              ],
            ),
            backgroundColor: cs.primary,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            duration: const Duration(seconds: 4),
          ),
        );
      }
    }
  }

  Future<void> _handleBiometricLogin(BuildContext context) async {
    final ok = await controller.loginWithBiometrics();
    if (!context.mounted) return;

    if (ok) {
      if (controller.isSuperAdmin) {
        final activated = await controller.activateSuperAdminSession();
        if (!context.mounted) return;
        if (activated) {
          // REDIRECCIÓN SUPER ADMIN A IAM
          GoRouter.of(
            context,
          ).goNamed(IamScreen.name, pathParameters: {'page': '$pageIndex'});
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
    final cs = Theme.of(context).colorScheme;

    // Detectar si es un error de cancelación o biometría
    final isBiometricError =
        message.contains('biométrica') || message.contains('biométrico');

    DialogHelper.showBlurredDialog(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.3),
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(
              isBiometricError ? Icons.fingerprint : Icons.error_outline,
              color: cs.error,
            ),
            const SizedBox(width: 8),
            const Expanded(
              child: Text(
                'Error',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(message),
            if (isBiometricError && message.contains('cancelada')) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: cs.surfaceContainerHighest.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: cs.outlineVariant),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.info_outline, size: 16, color: cs.primary),
                        const SizedBox(width: 8),
                        Text(
                          'Verifica:',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: cs.primary,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      Platform.isIOS
                          ? '• Face ID/Touch ID esté configurado en Ajustes\n• Tengas permiso para usar biometría\n• No hayas cancelado el diálogo'
                          : '• La huella digital esté configurada en Ajustes\n• Tengas permiso para usar biometría\n• No hayas cancelado el diálogo',
                      style: TextStyle(
                        fontSize: 12,
                        color: cs.onSurfaceVariant,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
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

/// Botón de autenticación biométrica con diseño moderno
class _BiometricButton extends StatefulWidget {
  final BiometricType? biometricType;
  final String description;
  final VoidCallback? onPressed;
  final bool isLoading;

  const _BiometricButton({
    required this.biometricType,
    required this.description,
    required this.onPressed,
    this.isLoading = false,
  });

  @override
  State<_BiometricButton> createState() => _BiometricButtonState();
}

class _BiometricButtonState extends State<_BiometricButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.08).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Widget _getBiometricIcon(Color color) {
    // Usar icono específico por plataforma para mejor experiencia nativa
    if (Platform.isIOS) {
      // En iOS, usar el SVG de Face ID para una experiencia más nativa
      return SvgPicture.asset(
        'assets/images/svg/face_id.svg',
        width: 28,
        height: 28,
        colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
      );
    } else {
      // En Android, mostrar huella digital
      return Icon(Icons.fingerprint_outlined, color: color, size: 28);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    if (widget.isLoading) {
      return SizedBox(
        height: 72,
        child: Center(
          child: SizedBox(
            width: 60,
            height: 60,
            child: Lottie.asset(
              'assets/animation/loader/rupu_loader.json',
              fit: BoxFit.contain,
            ),
          ),
        ),
      );
    }

    return AnimatedBuilder(
      animation: _pulseAnimation,
      builder: (context, child) {
        return Transform.scale(scale: _pulseAnimation.value, child: child);
      },
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: widget.onPressed,
          borderRadius: BorderRadius.circular(24),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  cs.primaryContainer.withValues(alpha: 0.9),
                  cs.secondaryContainer.withValues(alpha: 0.8),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: cs.primary.withValues(alpha: 0.3),
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: cs.primary.withValues(alpha: 0.2),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: cs.primary.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: _getBiometricIcon(cs.primary),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Iniciar con ${widget.description}',
                      style: tt.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: cs.onPrimaryContainer,
                      ),
                    ),
                    Text(
                      'Rápido y seguro',
                      style: tt.bodySmall?.copyWith(
                        color: cs.onPrimaryContainer.withValues(alpha: 0.7),
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
