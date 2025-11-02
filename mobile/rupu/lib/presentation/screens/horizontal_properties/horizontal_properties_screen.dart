import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';

import 'package:rupu/config/routers/app_bindings.dart';
import 'package:rupu/presentation/views/home/home_controller.dart';
import 'package:rupu/presentation/views/horizontal_properties/horizontal_properties_view.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';

class HorizontalPropertiesScreen extends StatefulWidget {
  static const name = 'horizontal-properties-screen';
  final int pageIndex;

  const HorizontalPropertiesScreen({super.key, required this.pageIndex});

  @override
  State<HorizontalPropertiesScreen> createState() =>
      _HorizontalPropertiesScreenState();
}

class _HorizontalPropertiesScreenState
    extends State<HorizontalPropertiesScreen> {
  bool _redirecting = false;

  @override
  void initState() {
    super.initState();
    HorizontalPropertiesBinding.register();
    WidgetsBinding.instance.addPostFrameCallback((_) => _attemptRedirect());
  }

  void _attemptRedirect() {
    if (!mounted || _redirecting) return;

    final login = Get.isRegistered<LoginController>()
        ? Get.find<LoginController>()
        : null;
    final home = Get.isRegistered<HomeController>()
        ? Get.find<HomeController>()
        : null;

    final isSuperAdmin = home?.isSuper ?? login?.isSuperAdmin ?? false;
    if (isSuperAdmin) return;

    final businessId = login?.selectedBusinessId;
    if (businessId == null) return;

    setState(() => _redirecting = true);
    GoRouter.of(context).go(
      '/home/${widget.pageIndex}/horizontal-properties/$businessId',
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_redirecting) {
      return const SizedBox.shrink();
    }
    return HorizontalPropertiesView(pageIndex: widget.pageIndex);
  }
}
