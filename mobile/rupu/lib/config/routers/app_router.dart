import 'package:go_router/go_router.dart';

import '../../presentation/screens/screens.dart';

final appRouter = GoRouter(
  initialLocation: '/login/0',
  routes: [
    GoRoute(
      path: '/login/:page',
      name: LoginScreen.name,
      builder: (context, state) {
        final pageIndex = state.pathParameters['page'] ?? '0';
        // if (pageIndex > 2 || pageIndex < 0) {

        // }
        return LoginScreen(pageIndex: int.parse(pageIndex));
      },
      routes: [],
    ),
    GoRoute(path: '/', redirect: (_, __) => '/login/0'),
  ],
);
