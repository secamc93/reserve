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
                CustomField(
                  controller: controller.currentPasswordController,
                  labelText: 'Contraseña actual',
                  hintText: 'Ingresa contraseña actual',
                  obscureText: true,
                ),
                const SizedBox(height: 16),
                CustomField(
                  controller: controller.newPasswordController,
                  labelText: 'Nueva contraseña',
                  hintText: 'Ingresa nueva contraseña',
                  obscureText: true,
                ),
                const SizedBox(height: 16),
                CustomField(
                  controller: controller.repeatPasswordController,
                  labelText: 'Repite nueva contraseña',
                  hintText: 'Vuelve a ingresar la nueva contraseña',
                  obscureText: true,
                ),
                const SizedBox(height: 24),
                Obx(() {
                  if (controller.isLoading.value) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  return CustomButton(
                    onPressed: () async {
                      final ok = await controller.submit();
                      if (!context.mounted) return;
                      if (ok) {
                        // Mostrar diálogo de éxito antes de navegar
                        showDialog(
                          context: context,
                          builder: (_) => AlertDialog(
                            title: const Text('Éxito'),
                            content: const Text(
                              'La contraseña se cambió correctamente.',
                            ),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).pop();
                                  GoRouter.of(context).goNamed(
                                    HomeScreen.name,
                                    pathParameters: {'page': '0'},
                                  );
                                },
                                child: const Text('OK'),
                              ),
                            ],
                          ),
                        );
                      } else if (controller.errorMessage.value != null) {
                        showDialog(
                          context: context,
                          builder: (_) => AlertDialog(
                            title: const Text('Error'),
                            content: Text(controller.errorMessage.value!),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.of(context).pop(),
                                child: const Text('OK'),
                              ),
                            ],
                          ),
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
