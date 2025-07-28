import 'package:flutter/material.dart';

import '../../views/views.dart';

class CambiarContrasenaScreen extends StatelessWidget {
  static const name = 'cambiar_contrasena-screen';

  CambiarContrasenaScreen({super.key});

  final viewRoutes = <Widget>[CambiarContrasenaView(), const SizedBox()];

  @override
  Widget build(BuildContext context) {
    return Scaffold(body: IndexedStack(children: viewRoutes));
  }
}
