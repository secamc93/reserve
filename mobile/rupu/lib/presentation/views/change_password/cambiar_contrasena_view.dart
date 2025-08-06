import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import '../../screens/screens.dart';
import '../../widgets/widgets.dart';
import 'cambiar_contrasena_controller.dart';

class CambiarContrasenaView extends StatelessWidget {
  CambiarContrasenaView({super.key});

  final controller = Get.find<CambiarContrasenaController>();

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final isPortrait =
        MediaQuery.of(context).orientation == Orientation.portrait;
    final horizontalPadding = isPortrait ? size.width * 0.1 : size.width * 0.2;
    final verticalPadding = isPortrait ? size.height * 0.05 : size.height * 0.1;
    final fontSize = isPortrait ? size.width * 0.08 : size.height * 0.08;

    return Scaffold(
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => FocusScope.of(context).unfocus(),
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(
            horizontal: horizontalPadding,
            vertical: verticalPadding,
          ),
          child: Form(
            key: controller.formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Cambiar contraseña',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: fontSize,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),

                // Contraseña actual
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

                // Nueva contraseña
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

                // Repite nueva contraseña
                CustomField(
                  controller: controller.repeatPasswordController,
                  labelText: 'Repite nueva contraseña',
                  hintText: 'Vuelve a ingresar la nueva contraseña',
                  obscureText: true,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Por favor repite la nueva contraseña';
                    }
                    if (value != controller.newPasswordController.text) {
                      return 'Las contraseñas no coinciden';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),

                Obx(() {
                  if (controller.isLoading.value) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  return CustomButton(
                    onPressed: () async {
                      // Primero validamos el formulario
                      if (!controller.formKey.currentState!.validate()) {
                        return;
                      }

                      final ok = await controller.submit();
                      if (!context.mounted) return;

                      if (ok) {
                        await showDialog(
                          context: context,
                          builder: (dialogContext) {
                            return AlertDialog(
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
                            );
                          },
                        );
                        controller.currentPasswordController.clear();
                        controller.newPasswordController.clear();
                        controller.repeatPasswordController.clear();

                        if (!context.mounted) return;
                        GoRouter.of(context).goNamed(
                          PerfilScreen.name,
                          pathParameters: {'page': '0'},
                        );
                      } else if (controller.errorMessage.value != null) {
                        await showDialog(
                          context: context,
                          builder: (dialogContext) {
                            return AlertDialog(
                              title: const Text('Error'),
                              content: Text(controller.errorMessage.value!),
                              actions: [
                                TextButton(
                                  onPressed: () =>
                                      Navigator.of(dialogContext).pop(),
                                  child: const Text('OK'),
                                ),
                              ],
                            );
                          },
                        );
                      }
                    },
                    textButton: 'Cambiar contraseña',
                  );
                }),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
