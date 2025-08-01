import 'package:flutter/material.dart';
import 'package:rupu/presentation/widgets/shared/custom_appbar.dart';
import 'package:rupu/presentation/widgets/shared/custom_bottom_navigation.dart';
import 'package:rupu/presentation/widgets/side_menu.dart';

import '../../views/views.dart';

class HomeScreen extends StatelessWidget {
  static const name = 'home-screen';
  final int pageIndex;

  const HomeScreen({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final scaffoldKey = GlobalKey<ScaffoldState>();
    // final loginCtrl = Get.find<LoginController>();
    // final avatarUrl =
    //     loginCtrl.sessionModel.value?.data.user.avatarUrl ??
    //     "https://randomuser.me/api/portraits/men/70.jpg";

    final viewRoutes = <Widget>[
      HomeView(pageIndex: pageIndex),
      const SizedBox(),
    ];

    return Scaffold(
      key: scaffoldKey,
      appBar: CustomHomeAppBar(
        avatarUrl: "https://randomuser.me/api/portraits/men/70.jpg",
      ),
      body: IndexedStack(index: pageIndex, children: viewRoutes),
      drawer: SideMenu(scaffoldKey: scaffoldKey),
      bottomNavigationBar: CustomBottomNavigation(currentIndex: pageIndex),
    );
  }
}
