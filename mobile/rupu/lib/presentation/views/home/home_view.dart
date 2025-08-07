import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/config/theme/app_theme.dart';
import 'package:rupu/presentation/views/home/home_controller.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';
import 'package:rupu/presentation/widgets/shared/custom_appbar.dart';

import '../../widgets/widgets.dart';

/// Vista principal que muestra el nombre del usuario y es responsive a la orientación.
class HomeView extends StatelessWidget {
  final int pageIndex;

  const HomeView({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final scaffoldKey = GlobalKey<ScaffoldState>();
    final loginController = Get.find<LoginController>();
    final negocio = loginController.sessionModel.value!.data.businesses;

    final homeController = Get.find<HomeController>();

    // Tamaño de la pantalla
    final size = MediaQuery.of(context).size;
    // Orientación de la pantalla
    final isPortrait =
        MediaQuery.of(context).orientation == Orientation.portrait;

    // Padding proporcional: más espacio en landscape
    final horizontalPadding = isPortrait ? size.width * 0.1 : size.width * 0.2;
    final verticalPadding = isPortrait ? size.height * 0.05 : size.height * 0.1;

    if (negocio.isNotEmpty) {
      // Para evitar setState en build, lo hacemos tras el frame:
      WidgetsBinding.instance.addPostFrameCallback((_) {
        AppTheme.instance.updateColors("#00FF00", "#00FF00");
      });
    }
    // Tamaño de fuente responsivo
    // final fontSize = isPortrait ? size.width * 0.08 : size.height * 0.08;

    return Scaffold(
      body: Obx(() {
        // Loading
        if (homeController.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        // Error
        if (homeController.errorMessage.value != null) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Text(
                homeController.errorMessage.value!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.red),
              ),
            ),
          );
        }

        // Ya cargó permisos/roles
        final isSuper = homeController.isSuper;
        final hasSomePermission = homeController.hasPermission(
          action: 'some_action',
        ); // ejemplo

        return Scaffold(
          key: scaffoldKey,
          appBar: CustomHomeAppBar(
            avatarUrl: "https://randomuser.me/api/portraits/men/70.jpg",
            onMenuTap: () => scaffoldKey.currentState?.openDrawer(),
          ),
          drawer: SideMenu(scaffoldKey: scaffoldKey),
          body: Center(
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: horizontalPadding,
                vertical: verticalPadding,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 16),
                  if (isSuper)
                    const Text(
                      'Eres superusuario!!!',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  if (!isSuper && hasSomePermission)
                    const Text('Tienes permiso para "some_action"'),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        );
      }),
    );
  }
}
