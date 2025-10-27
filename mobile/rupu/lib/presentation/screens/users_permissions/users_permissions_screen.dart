import 'package:flutter/material.dart';
import 'package:rupu/config/routers/app_bindings.dart';
import 'package:rupu/presentation/views/roles_permissions/roles_permissions_view.dart';

class UsersPermissionsScreen extends StatelessWidget {
  static const name = 'users-permissions-screen';
  final int pageIndex;

  const UsersPermissionsScreen({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    RolesPermissionsBinding.register();
    return RolesPermissionsView(pageIndex: pageIndex);
  }
}
