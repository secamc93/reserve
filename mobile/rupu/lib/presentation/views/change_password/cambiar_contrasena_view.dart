// presentation/views/cambiar_contrasena/cambiar_contrasena_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';

import '../../screens/screens.dart';
import '../../widgets/widgets.dart';
import 'cambiar_contrasena_controller.dart';

class CambiarContrasenaView extends GetView<ChangePasswordController> {
  const CambiarContrasenaView({super.key});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    BoxDecoration neu([double r = 22]) {
      final isDark = Theme.of(context).brightness == Brightness.dark;
      final darkShadow = isDark
          ? Colors.black.withValues(alpha: .45)
          : const Color(0x33000000);
      final lightShadow = isDark
          ? Colors.white.withValues(alpha: .08)
          : const Color(0x33FFFFFF);
      return BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(r),
        boxShadow: [
          BoxShadow(
            offset: const Offset(8, 8),
            blurRadius: 24,
            color: darkShadow,
          ),
          BoxShadow(
            offset: const Offset(-8, -8),
            blurRadius: 24,
            color: lightShadow,
          ),
        ],
        border: Border.all(color: cs.outlineVariant.withValues(alpha: .4)),
      );
    }

    return Scaffold(
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => FocusScope.of(context).unfocus(),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(22),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 560),
              child: Container(
                decoration: neu(22),
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 28,
                ),
                child: Form(
                  key: controller.formKey,
                  child: Obx(() {
                    final loading = controller.isLoading.value;

                    return AbsorbPointer(
                      absorbing: loading,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Encabezado con ícono y títulos
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: cs.primaryContainer,
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Icon(
                                  Icons.lock_reset_rounded,
                                  color: cs.onPrimaryContainer,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Cambiar contraseña',
                                      style: Theme.of(context)
                                          .textTheme
                                          .titleLarge!
                                          .copyWith(
                                            fontWeight: FontWeight.w800,
                                          ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      'Por seguridad, usa una combinación de mayúsculas, números y símbolos.',
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall!
                                          .copyWith(color: cs.onSurfaceVariant),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 18),

                          // Campo: contraseña actual
                          CustomField(
                            controller: controller.currentPasswordController,
                            labelText: 'Contraseña actual',
                            hintText: 'Ingresa contraseña actual',
                            obscureText: true,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Por favor ingresa la contraseña actual';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),

                          // Campo: nueva contraseña
                          CustomField(
                            controller: controller.newPasswordController,
                            labelText: 'Nueva contraseña',
                            hintText: 'Ingresa nueva contraseña',
                            obscureText: true,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Por favor ingresa la nueva contraseña';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),

                          // Campo: repetir nueva contraseña
                          CustomField(
                            controller: controller.repeatPasswordController,
                            labelText: 'Repite nueva contraseña',
                            hintText: 'Vuelve a ingresar la nueva contraseña',
                            obscureText: true,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Por favor repite la nueva contraseña';
                              }
                              if (value !=
                                  controller.newPasswordController.text) {
                                return 'Las contraseñas no coinciden';
                              }
                              return null;
                            },
                          ),

                          const SizedBox(height: 16),

                          // Mensajes inline (opcionales) — sin cambiar tu flujo de diálogos
                          if (controller.errorMessage.value != null)
                            Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: cs.errorContainer,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: cs.error.withValues(alpha: .2),
                                ),
                              ),
                              child: Text(
                                controller.errorMessage.value!,
                                style: TextStyle(color: cs.onErrorContainer),
                              ),
                            ),

                          const SizedBox(height: 8),

                          // Botón / loading
                          if (loading)
                            const Center(child: CircularProgressIndicator())
                          else
                            CustomButton(
                              onPressed: () async {
                                if (!controller.formKey.currentState!
                                    .validate()) {
                                  return;
                                }

                                final ok = await controller.submit();
                                if (!context.mounted) return;

                                if (ok) {
                                  await showDialog(
                                    context: context,
                                    builder: (dialogContext) => AlertDialog(
                                      title: const Text('Éxito'),
                                      content: const Text(
                                        'La contraseña se cambió correctamente.',
                                      ),
                                      actions: [
                                        TextButton(
                                          onPressed: () =>
                                              Navigator.of(dialogContext).pop(),
                                          child: const Text('OK'),
                                        ),
                                      ],
                                    ),
                                  );
                                  controller.clearFields();
                                  if (!context.mounted) return;
                                  GoRouter.of(context).goNamed(
                                    PerfilScreen.name,
                                    pathParameters: {'page': '0'},
                                  );
                                } else if (controller.errorMessage.value !=
                                    null) {
                                  await showDialog(
                                    context: context,
                                    builder: (dialogContext) => AlertDialog(
                                      title: const Text('Error'),
                                      content: Text(
                                        controller.errorMessage.value!,
                                      ),
                                      actions: [
                                        TextButton(
                                          onPressed: () =>
                                              Navigator.of(dialogContext).pop(),
                                          child: const Text('OK'),
                                        ),
                                      ],
                                    ),
                                  );
                                }
                              },
                              textButton: 'Cambiar contraseña',
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
}
