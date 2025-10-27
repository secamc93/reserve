import 'package:flutter/material.dart';

import '../../views/views.dart';

class SettingsScreen extends StatelessWidget {
  static const name = 'settings-screen';
  final int pageIndex;

  const SettingsScreen({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final viewRoutes = <Widget>[
      SettingsView(pageIndex: pageIndex),
      const SizedBox(),
    ];
    return Scaffold(
      body: IndexedStack(index: pageIndex, children: viewRoutes),
    );
  }
}
