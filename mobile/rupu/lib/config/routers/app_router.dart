import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/presentation/views/cambiar/cambiar_contrasena_controller.dart';

import '../../presentation/screens/screens.dart';
import '../../presentation/views/views.dart';

final appRouter = GoRouter(
  initialLocation: '/login/0',
  // initialLocation: '/home/0',
  routes: [
    GoRoute(
      path: '/login/:page',
      name: LoginScreen.name,
      builder: (context, state) {
        final pageIndex = state.pathParameters['page'] ?? '0';
        Get.put(LoginController());

        // if (pageIndex > 2 || pageIndex < 0) {

        // }
        return LoginScreen(pageIndex: int.parse(pageIndex));
      },
      routes: [],
    ),
    GoRoute(
      path: '/home/:page',
      name: HomeScreen.name,
      builder: (context, state) {
        final pageIndex = state.pathParameters['page'] ?? '0';
        Get.put(LoginController());

        // Get.put(LoginController());

        // if (pageIndex > 2 || pageIndex < 0) {

        // }
        return HomeScreen(pageIndex: int.parse(pageIndex));
      },
      routes: [
        GoRoute(
          path: 'cambiar_contrasena',
          name: CambiarContrasenaScreen.name,
          builder: (context, state) {
            Get.put(CambiarContrasenaController());

            return CambiarContrasenaScreen();
          },
        ),
      ],
    ),

    GoRoute(path: '/', redirect: (_, __) => '/login/0'),
  ],
);
