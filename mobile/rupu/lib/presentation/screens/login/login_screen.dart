import 'package:flutter/material.dart';

import '../../views/../views/views.dart';

class LoginScreen extends StatelessWidget {
  static const name = 'login-screen';

  final int pageIndex;

  const LoginScreen({super.key, required this.pageIndex});

  final viewRoutes = const <Widget>[
    LoginView(),
    SizedBox(), // <--- categorias View
    // FavoritesView(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: pageIndex, children: viewRoutes),
    );
  }
}
