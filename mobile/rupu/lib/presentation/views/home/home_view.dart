// presentation/views/home/home_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/presentation/widgets/dashboard.dart';
import 'package:rupu/presentation/widgets/shared/custom_appbar.dart';
import 'package:rupu/presentation/widgets/widgets.dart';

import 'home_controller.dart';

/// Vista principal: solo UI. Datos/acciones vienen del HomeController.
class HomeView extends GetView<HomeController> {
  final int pageIndex;
  HomeView({super.key, required this.pageIndex});

  final _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        final error = controller.errorMessage.value;
        if (error != null) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Text(
                error,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.red),
              ),
            ),
          );
        }

        if (controller.shouldRedirectToDefault) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            final menu = controller.defaultMenuItem.value;
            if (menu == null || !context.mounted) return;
            final target = _resolveMenuRoute(menu.link, pageIndex);
            final router = GoRouter.of(context);
            final current =
                router.routeInformationProvider.value.uri.toString();
            if (current != target) {
              context.go(target);
            }
            controller.markDefaultRouteHandled();
          });
        }

        return Scaffold(
          key: _scaffoldKey,
          appBar: CustomHomeAppBar(
            avatarUrl: "https://randomuser.me/api/portraits/men/70.jpg",
            onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
          ),
          drawer: SideMenu(scaffoldKey: _scaffoldKey),
          body: DashBoard(pageIndex: pageIndex),
        );
      }),
    );
  }

  String _resolveMenuRoute(String link, int pageIndex) {
    final regex = RegExp(r'^/home/\d+');
    final prefix = '/home/$pageIndex';
    if (regex.hasMatch(link)) {
      return link.replaceFirst(regex, prefix);
    }
    final normalized = link.startsWith('/') ? link : '/$link';
    return '$prefix$normalized';
  }
}
