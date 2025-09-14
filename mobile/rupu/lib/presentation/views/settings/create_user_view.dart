// presentation/views/settings/create_user_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'create_user_controller.dart';

class CreateUserView extends GetView<CreateUserController> {
  static const name = 'create-user';
  const CreateUserView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Crear usuario')),
      body: const Center(
        child: Text('Vista de creación de usuario (dummy)'),
      ),
    );
  }
}
