import 'package:go_router/go_router.dart';
import 'package:rupu/config/routers/app_bindings.dart';

import '../../presentation/screens/screens.dart';

final appRouter = GoRouter(
  initialLocation: '/login/0',
  // initialLocation: '/home/0',
  routes: [
    GoRoute(
      path: '/login/:page',
      name: LoginScreen.name,
      builder: (context, state) {
        final pageIndex = state.pathParameters['page'] ?? '0';
        LoginBinding.register();
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
        HomeBinding.register();
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
            CambiarContrasenaBinding.register();

            return CambiarContrasenaScreen();
          },
        ),
      ],
    ),

    GoRoute(path: '/', redirect: (_, __) => '/login/0'),
  ],
);
