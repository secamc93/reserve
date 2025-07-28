import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';

import '../../screens/screens.dart';
import '../../widgets/widgets.dart';

/// Vista principal que muestra el nombre del usuario y es responsive a la orientación.
class HomeView extends StatelessWidget {
  final int pageIndex;

  const HomeView({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<LoginController>();
    final userName = controller.sessionModel.value?.data.user.name ?? 'Usuario';

    // Tamaño de la pantalla
    final size = MediaQuery.of(context).size;
    // Orientación de la pantalla
    final isPortrait =
        MediaQuery.of(context).orientation == Orientation.portrait;

    // Padding proporcional: más espacio en landscape
    final horizontalPadding = isPortrait ? size.width * 0.1 : size.width * 0.2;
    final verticalPadding = isPortrait ? size.height * 0.05 : size.height * 0.1;

    // Tamaño de fuente responsivo
    final fontSize = isPortrait ? size.width * 0.08 : size.height * 0.08;

    return Scaffold(
      body: Center(
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: horizontalPadding,
            vertical: verticalPadding,
          ),
          child: Column(
            children: [
              Text(
                userName,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: fontSize,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),

              CustomTextButton(
                onPressed: () {
                  GoRouter.of(context).goNamed(
                    CambiarContrasenaScreen.name,
                    pathParameters: {'page': pageIndex.toString()},
                  );
                },

                textButton: 'Cambiar contraseña',
              ),
              CustomTextButton(
                onPressed: () {
                  // Borra tu token, limpias estados y vuelves al login:
                  GoRouter.of(
                    context,
                  ).goNamed(LoginScreen.name, pathParameters: {'page': '0'});
                },

                textButton: 'Cerrar sesion',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
