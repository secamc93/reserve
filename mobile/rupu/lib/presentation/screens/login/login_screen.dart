import 'package:flutter/material.dart';

import '../../views/../views/views.dart';

class LoginScreen extends StatelessWidget {
  static const name = 'login-screen';
  final int pageIndex;

  const LoginScreen({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final viewRoutes = <Widget>[
      LoginView(pageIndex: pageIndex),
      const SizedBox(),
    ];

    return Scaffold(
      body: IndexedStack(index: pageIndex, children: viewRoutes),
    );
  }
}
