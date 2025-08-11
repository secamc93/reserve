import 'package:animate_do/animate_do.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/config/routers/app_bindings.dart';
import 'package:rupu/presentation/widgets/shared/custom_bottom_navigation.dart';
import '../../presentation/screens/screens.dart';
import '../../presentation/views/views.dart';

final _shellNavigatorKey = GlobalKey<NavigatorState>();

int _calculateIndex(String location) {
  if (location.endsWith('/perfil')) return 1;
  if (location.startsWith('/home/') && !location.contains('/')) return 0;
  return 0;
}

final appRouter = GoRouter(
  initialLocation: '/login/0',
  routes: [
    // --------------- Shell para /home ---------------
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (BuildContext context, GoRouterState state, Widget child) {
        final idx = _calculateIndex(state.matchedLocation);
        return Scaffold(
          body: child,
          bottomNavigationBar: CustomBottomNavigation(currentIndex: idx),
        );
      },
      routes: [
        GoRoute(
          path: '/home/:page',
          name: HomeScreen.name,
          builder: (context, state) {
            final pageIndex = int.parse(state.pathParameters['page']!);
            HomeBinding.register();
            return FadeInLeft(
              curve: Curves.fastLinearToSlowEaseIn,
              delay: const Duration(milliseconds: 100),
              child: HomeView(pageIndex: pageIndex),
            );
          },
        ),
        GoRoute(
          path: '/home/:page/reserve',
          name: ReserveScreen.name,
          builder: (context, state) {
            ReserveBinding.register();
            final page = int.tryParse(state.pathParameters['page'] ?? '0') ?? 0;
            return ReserveScreen(pageIndex: page);
          },
        ),
        GoRoute(
          path: '/home/:page/calendar',
          name: CalendarViewReserve.name,
          builder: (context, state) {
            // Si necesitas bindings, llámalos aquí (CalendarBinding.register();)
            ReserveBinding.register();
            return CalendarViewReserve(); // tu vista
          },
        ),
        GoRoute(
          path: '/home/:page/cambiar_contrasena',
          name: CambiarContrasenaScreen.name,
          builder: (context, state) {
            CambiarContrasenaBinding.register();
            return CambiarContrasenaScreen();
          },
        ),

        GoRoute(
          path: '/home/:page/perfil',
          name: PerfilScreen.name,
          builder: (context, state) {
            final pageIndex = int.parse(state.pathParameters['page']!);

            PerfilBinding.register();
            return FadeInLeft(
              curve: Curves.fastEaseInToSlowEaseOut,
              delay: const Duration(milliseconds: 200),
              child: PerfilView(pageIndex: pageIndex),
            );
          },
        ),
      ],
    ),

    // --------------- Ruta de Login ---------------
    GoRoute(
      path: '/login/:page',
      name: LoginScreen.name,
      builder: (context, state) {
        final pageIndex = int.parse(state.pathParameters['page']!);
        LoginBinding.register();
        return LoginScreen(pageIndex: pageIndex);
      },
    ),

    // Redirect de comodín
    GoRoute(path: '/', redirect: (_, __) => '/login/0'),
  ],
);
