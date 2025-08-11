// presentation/views/login/login_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';

import '../../screens/screens.dart';
import '../../widgets/widgets.dart';

class LoginView extends GetView<LoginController> {
  final int pageIndex;
  const LoginView({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final surface = cs.surface;

    BoxDecoration neu([double r = 22]) {
      final isDark = Theme.of(context).brightness == Brightness.dark;
      // Sombras adaptadas al tema para un look “soft”
      final darkShadow = isDark
          ? Colors.black.withValues(alpha: .45)
          : const Color(0x33000000);
      final lightShadow = isDark
          ? Colors.white.withValues(alpha: .08)
          : const Color(0x33FFFFFF);

      return BoxDecoration(
        color: surface,
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
        // Borde sutil para más definición
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
              constraints: const BoxConstraints(maxWidth: 520),
              child: Container(
                decoration: neu(22),
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 28,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Títulos de marca
                    const Text(
                      "Bienvenidos a Rupü",
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Iniciar sesión",
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: cs.onSurface,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 10),

                    // Logo
                    CustomLogo(
                      height: 110,
                      imagePath: "assets/images/logorufu.png",
                    ),
                    const SizedBox(height: 12),

                    // Formulario (mantiene tu lógica y controladores)
                    Form(
                      key: controller.formKey,
                      child: Column(
                        children: [
                          CustomEmailField(
                            controller: controller.emailController,
                            labelText: "Email",
                            hintText: "ejemplo@dominio.com",
                          ),
                          const SizedBox(height: 16),
                          CustomPasswordField(
                            controller: controller.passwordController,
                            labelText: "Contraseña",
                            hintText: "Ingresa tu contraseña",
                          ),
                          const SizedBox(height: 10),

                          Row(
                            children: [
                              const Spacer(),
                              TextButton(
                                onPressed:
                                    () {}, // hook para recuperar contraseña
                                child: const Text("¿Olvidaste contraseña?"),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),

                          // Botón enviar con estado de carga y manejo de error
                          Obx(() {
                            return controller.isLoading.value
                                ? const Padding(
                                    padding: EdgeInsets.symmetric(vertical: 8),
                                    child: CircularProgressIndicator(),
                                  )
                                : CustomButton(
                                    onPressed: () async {
                                      final ok = await controller.submit();
                                      if (!context.mounted) return;
                                      if (ok) {
                                        GoRouter.of(context).goNamed(
                                          HomeScreen.name,
                                          pathParameters: {'page': '0'},
                                        );
                                      } else if (controller
                                              .errorMessage
                                              .value !=
                                          null) {
                                        showDialog(
                                          context: context,
                                          builder: (_) => AlertDialog(
                                            title: const Text('Error'),
                                            content: Text(
                                              controller.errorMessage.value!,
                                            ),
                                            actions: [
                                              TextButton(
                                                onPressed: () =>
                                                    Navigator.of(context).pop(),
                                                child: const Text('OK'),
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
    );
  }
}
