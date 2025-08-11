import 'package:animate_do/animate_do.dart';
import 'package:flutter/material.dart';

import '../../views/views.dart';

class HomeScreen extends StatelessWidget {
  static const name = 'home-screen';
  final int pageIndex;

  const HomeScreen({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final viewRoutes = <Widget>[
      HomeView(pageIndex: pageIndex),
      const SizedBox(),
    ];

    return Scaffold(
      body: FadeIn(
        child: IndexedStack(index: pageIndex, children: viewRoutes),
      ),
    );
  }
}
