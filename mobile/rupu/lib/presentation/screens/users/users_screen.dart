import 'package:flutter/material.dart';
import '../../views/users/users_view.dart';

class UsersScreen extends StatelessWidget {
  static const name = 'users-screen';
  final int pageIndex;
  const UsersScreen({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    return UsersView(pageIndex: pageIndex);
  }
}
