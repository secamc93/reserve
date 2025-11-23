// presentation/views/login/login_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';
import 'package:rupu/config/helpers/design_helper.dart';
import 'package:rupu/config/helpers/dialog_helper.dart';

import '../../screens/screens.dart';
import '../../widgets/widgets.dart';

class LoginView extends GetView<LoginController> {
  final int pageIndex;
  const LoginView({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    void showErrorMessage(String message) {
      if (message.isEmpty) return;
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(
            content: Text(message),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        );
    }

    return Scaffold(
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => FocusScope.of(context).unfocus(),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: GlassContainer(
                borderRadius: BorderRadius.circular(32),
                blur: 20,
                opacity: 0.7,
                border: Border.all(
                  color: cs.outlineVariant.withValues(alpha: 0.3),
                  width: 1.5,
                ),
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Títulos de marca
                      Text(
                        "Bienvenidos a Rupü",
                        style: Theme.of(context).textTheme.headlineSmall
                            ?.copyWith(
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.5,
                            ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "Iniciar sesión",
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: cs.onSurfaceVariant,
                            ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),

                      // Logo
                      CustomLogo(
                        height: 120,
                        imagePath: "assets/images/logorufu.png",
                      ),
                      const SizedBox(height: 32),

                      // Formulario
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

                            Row(
                              children: [
                                const Spacer(),
                                TextButton(
                                  onPressed:
                                      () {}, // hook para recuperar contraseña
                                  child: Text(
                                    "¿Olvidaste contraseña?",
                                    style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),

                            // Botón enviar
                            Obx(() {
                              return controller.isLoading.value
                                  ? const Padding(
                                      padding: EdgeInsets.symmetric(
                                        vertical: 12,
                                      ),
                                      child: CircularProgressIndicator(
                                        strokeWidth: 3,
                                      ),
                                    )
                                  : CustomButton(
                                      onPressed: () async {
                                        final ok = await controller.submit();
                                        if (!context.mounted) return;
                                        if (ok) {
                                          if (controller.isSuperAdmin) {
                                            final activated = await controller
                                                .activateSuperAdminSession();
                                            if (!context.mounted) return;
                                            if (activated) {
                                              GoRouter.of(context).goNamed(
                                                HomeScreen.name,
                                                pathParameters: {
                                                  'page': '$pageIndex',
                                                },
                                              );
                                            } else {
                                              final message =
                                                  controller
                                                      .errorMessage
                                                      .value ??
                                                  'No fue posible completar la sesión del super administrador.';
                                              showErrorMessage(message);
                                            }
                                            return;
                                          }

                                          final businesses =
                                              controller.businesses;
                                          if (businesses.isEmpty) {
                                            const message =
                                                'Tu usuario no tiene negocios disponibles.';
                                            controller.errorMessage.value ??=
                                                message;
                                            showErrorMessage(
                                              controller.errorMessage.value ??
                                                  message,
                                            );
                                            return;
                                          }

                                          if (controller.hasBusinessScope) {
                                            GoRouter.of(context).goNamed(
                                              BusinessSelectorScreen.name,
                                            );
                                            return;
                                          }

                                          if (businesses.length == 1) {
                                            final activated = await controller
                                                .activateBusinessSession(
                                                  businesses.first,
                                                );
                                            if (!context.mounted) return;
                                            if (activated) {
                                              GoRouter.of(context).goNamed(
                                                HomeScreen.name,
                                                pathParameters: {
                                                  'page': '$pageIndex',
                                                },
                                              );
                                            } else {
                                              final message =
                                                  controller
                                                      .errorMessage
                                                      .value ??
                                                  'No fue posible activar el negocio seleccionado.';
                                              showErrorMessage(message);
                                            }
                                          } else {
                                            GoRouter.of(context).goNamed(
                                              BusinessSelectorScreen.name,
                                            );
                                          }
                                        } else if (controller
                                                .errorMessage
                                                .value !=
                                            null) {
                                          DialogHelper.showBlurredDialog(
                                            context: context,
                                            barrierColor: Colors.black
                                                .withValues(alpha: 0.3),
                                            builder: (_) => AlertDialog(
                                              shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(20),
                                              ),
                                              title: const Text(
                                                'Error',
                                                style: TextStyle(
                                                  fontWeight: FontWeight.w700,
                                                ),
                                              ),
                                              content: Text(
                                                controller.errorMessage.value!,
                                              ),
                                              actions: [
                                                TextButton(
                                                  onPressed: () => Navigator.of(
                                                    context,
                                                  ).pop(),
                                                  child: const Text(
                                                    'OK',
                                                    style: TextStyle(
                                                      fontWeight:
                                                          FontWeight.w600,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          );
                                        }
                                      },
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
            ),
          ),
        ),
      ),
    );
  }
}
