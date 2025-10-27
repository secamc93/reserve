import 'package:flutter/material.dart';

import '../../views/../views/views.dart';

class PerfilScreen extends StatelessWidget {
  static const name = 'perfil-screen';
  final int pageIndex;

  const PerfilScreen({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final viewRoutes = <Widget>[
      PerfilView(pageIndex: pageIndex),
      const SizedBox(),
    ];

    return Scaffold(
      body: IndexedStack(index: pageIndex, children: viewRoutes),
    );
  }
}
