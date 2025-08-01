import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';

import '../../screens/screens.dart';
import '../../widgets/widgets.dart';

/// Vista de login sin estado, usando GetX para reactividad.
class LoginView extends GetView<LoginController> {
  final int pageIndex;
  const LoginView({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return Scaffold(
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => FocusScope.of(context).unfocus(),
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(
              horizontal: size.width * 0.1,
              vertical: size.height * 0.05,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  "Bienvenidos a Rufü",
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 14),
                Text(
                  "Iniciar sesión",
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 5),
                CustomLogo(
                  height: size.height * 0.23,
                  imagePath: "assets/images/logorufu.png",
                ),
                const SizedBox(height: 5),
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
                      const SizedBox(height: 25),
                      Row(
                        children: [
                          const Spacer(),
                          Text("¿Olvidaste contraseña?"),
                        ],
                      ),
                      const SizedBox(height: 25),
                      Obx(() {
                        return controller.isLoading.value
                            ? const CircularProgressIndicator()
                            : CustomButton(
                                onPressed: () async {
                                  final ok = await controller.submit();
                                  if (!context.mounted) return;
                                  if (ok) {
                                    GoRouter.of(context).goNamed(
                                      HomeScreen.name,
                                      pathParameters: {'page': '0'},
                                    );
                                  } else if (controller.errorMessage.value !=
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
                                textButton: 'Iniciar sesion',
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
    );
  }
}
