// presentation/views/cambiar_contrasena/cambiar_contrasena_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';

import '../../screens/screens.dart';
import 'cambiar_contrasena_controller.dart';
import 'package:rupu/presentation/widgets/widgets.dart';

class CambiarContrasenaView extends GetView<ChangePasswordController> {
  const CambiarContrasenaView({super.key});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(
        backgroundColor: cs.surface,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: cs.onSurface),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'Seguridad',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: cs.onSurface,
          ),
        ),
        centerTitle: false,
      ),
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => FocusScope.of(context).unfocus(),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 400),
                child: Form(
                  key: controller.formKey,
                  child: Obx(() {
                    final loading = controller.isLoading.value;

                    return AbsorbPointer(
                      absorbing: loading,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          const SizedBox(height: 20),
                          // Minimalist Icon
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: cs.onSurface.withValues(alpha: 0.1),
                                width: 2,
                              ),
                            ),
                            child: Icon(
                              Icons.lock_outline_rounded,
                              size: 64,
                              color: cs.onSurface,
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Title
                          Text(
                            'Crea una contraseña segura',
                            style: theme.textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: cs.onSurface,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 12),

                          // Subtitle
                          Text(
                            'Tu contraseña debe tener al menos 6 caracteres y debe incluir una combinación de números, letras y caracteres especiales (!@#\$%^&*).',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: cs.onSurfaceVariant,
                              height: 1.4,
                            ),
                            textAlign: TextAlign.center,
                          ),

                          const SizedBox(height: 40),

                          // Fields
                          _MinimalTextField(
                            controller: controller.currentPasswordController,
                            hint: 'Contraseña actual',
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'La contraseña actual es requerida';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),

                          _MinimalTextField(
                            controller: controller.newPasswordController,
                            hint: 'Nueva contraseña',
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'La nueva contraseña es requerida';
                              }
                              if (value.length < 6) {
                                return 'Mínimo 6 caracteres';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),

                          _MinimalTextField(
                            controller: controller.repeatPasswordController,
                            hint: 'Repetir nueva contraseña',
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Confirma tu nueva contraseña';
                              }
                              if (value !=
                                  controller.newPasswordController.text) {
                                return 'Las contraseñas no coinciden';
                              }
                              return null;
                            },
                          ),

                          const SizedBox(height: 24),

                          // Error Message
                          if (controller.errorMessage.value != null)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 24),
                              child: Text(
                                controller.errorMessage.value!,
                                style: TextStyle(color: cs.error, fontSize: 14),
                                textAlign: TextAlign.center,
                              ),
                            ),

                          // Button
                          if (loading)
                            const RupuLoader()
                          else
                            SizedBox(
                              width: double.infinity,
                              child: FilledButton(
                                onPressed: () async {
                                  if (!controller.formKey.currentState!
                                      .validate()) {
                                    return;
                                  }

                                  final ok = await controller.submit();
                                  if (!context.mounted) return;

                                  if (ok) {
                                    // Verificar si hay credenciales biométricas guardadas
                                    final hasBiometric = await controller
                                        .hasBiometricCredentials();

                                    if (hasBiometric && context.mounted) {
                                      // Preguntar si desea actualizar las credenciales biométricas
                                      final biometricDesc = await controller
                                          .getBiometricDescription();
                                      final shouldUpdate =
                                          await _showUpdateBiometricDialog(
                                            context,
                                            biometricDesc,
                                          );

                                      if (shouldUpdate == true) {
                                        final updated = await controller
                                            .updateBiometricCredentials();
                                        if (context.mounted) {
                                          ScaffoldMessenger.of(
                                            context,
                                          ).showSnackBar(
                                            SnackBar(
                                              content: Text(
                                                updated
                                                    ? 'Contraseña y credenciales biométricas actualizadas'
                                                    : 'Contraseña actualizada, pero no se pudieron actualizar las credenciales biométricas',
                                              ),
                                              backgroundColor: updated
                                                  ? cs.primary
                                                  : cs.error,
                                              behavior:
                                                  SnackBarBehavior.floating,
                                            ),
                                          );
                                        }
                                      } else {
                                        if (context.mounted) {
                                          ScaffoldMessenger.of(
                                            context,
                                          ).showSnackBar(
                                            SnackBar(
                                              content: const Text(
                                                'Contraseña actualizada. Recuerda que deberás iniciar sesión manualmente la próxima vez.',
                                              ),
                                              backgroundColor: cs.tertiary,
                                              behavior:
                                                  SnackBarBehavior.floating,
                                            ),
                                          );
                                        }
                                      }
                                    } else if (context.mounted) {
                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        SnackBar(
                                          content: const Text(
                                            'Contraseña actualizada correctamente',
                                          ),
                                          backgroundColor: cs.primary,
                                          behavior: SnackBarBehavior.floating,
                                        ),
                                      );
                                    }

                                    controller.clearFields();
                                    if (!context.mounted) return;
                                    GoRouter.of(context).goNamed(
                                      PerfilScreen.name,
                                      pathParameters: {'page': '0'},
                                    );
                                  } else if (controller.errorMessage.value !=
                                      null) {
                                    // Error is shown in UI
                                  }
                                },
                                style: FilledButton.styleFrom(
                                  backgroundColor: cs.primary,
                                  foregroundColor: cs.onPrimary,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 16,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  elevation: 0,
                                ),
                                child: const Text(
                                  'Cambiar contraseña',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),

                          const SizedBox(height: 24),

                          TextButton(
                            onPressed: () {
                              // Forgot password logic if needed
                            },
                            child: Text(
                              '¿Olvidaste tu contraseña?',
                              style: TextStyle(
                                color: cs.primary,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Muestra un diálogo preguntando si desea actualizar las credenciales biométricas
  Future<bool?> _showUpdateBiometricDialog(
    BuildContext context,
    String biometricDescription,
  ) async {
    final cs = Theme.of(context).colorScheme;

    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
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
                '¿Actualizar biometría?',
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
              'Detectamos que tienes credenciales guardadas para iniciar sesión con $biometricDescription.',
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
                color: cs.tertiaryContainer.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: cs.tertiary.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, size: 20, color: cs.tertiary),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Si no actualizas, deberás iniciar sesión manualmente la próxima vez.',
                      style: TextStyle(
                        fontSize: 12,
                        color: cs.onTertiaryContainer,
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
              'No actualizar',
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
              'Actualizar',
              style: TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

class _MinimalTextField extends StatefulWidget {
  final TextEditingController controller;
  final String hint;
  final String? Function(String?)? validator;

  const _MinimalTextField({
    required this.controller,
    required this.hint,
    this.validator,
  });

  @override
  State<_MinimalTextField> createState() => _MinimalTextFieldState();
}

class _MinimalTextFieldState extends State<_MinimalTextField> {
  bool _obscureText = true;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return TextFormField(
      controller: widget.controller,
      obscureText: _obscureText,
      validator: widget.validator,
      style: TextStyle(fontSize: 14, color: cs.onSurface),
      decoration: InputDecoration(
        hintText: widget.hint,
        hintStyle: TextStyle(
          color: cs.onSurfaceVariant.withValues(alpha: 0.6),
          fontSize: 14,
        ),
        filled: true,
        fillColor: cs.surfaceContainerHighest.withValues(alpha: 0.3),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: cs.outlineVariant.withValues(alpha: 0.5),
            width: 0.5,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: cs.outlineVariant.withValues(alpha: 0.5),
            width: 0.5,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: cs.primary, width: 1),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: cs.error, width: 1),
        ),
        suffixIcon: IconButton(
          icon: Icon(
            _obscureText
                ? Icons.visibility_off_outlined
                : Icons.visibility_outlined,
            size: 20,
            color: cs.onSurfaceVariant,
          ),
          onPressed: () {
            setState(() {
              _obscureText = !_obscureText;
            });
          },
        ),
      ),
    );
  }
}
