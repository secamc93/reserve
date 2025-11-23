import 'package:flutter/widgets.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';

import 'package:rupu/config/routers/app_bindings.dart';
import 'package:rupu/presentation/views/home/home_controller.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';

class HorizontalPropertiesScreenController extends GetxController {
  HorizontalPropertiesScreenController({required this.pageIndex});

  final int pageIndex;
  final redirecting = false.obs;
  bool _attempted = false;

  void scheduleRedirect(BuildContext context) {
    if (_attempted) return;
    _attempted = true;
    HorizontalPropertiesBinding.register();
    WidgetsBinding.instance.addPostFrameCallback((_) => _attemptRedirect(context));
  }

  void _attemptRedirect(BuildContext context) {
    if (redirecting.value) return;

    final login = Get.isRegistered<LoginController>() ? Get.find<LoginController>() : null;
    final home = Get.isRegistered<HomeController>() ? Get.find<HomeController>() : null;

    final isSuperAdmin = home?.isSuper ?? login?.isSuperAdmin ?? false;
    if (isSuperAdmin) return;

    final businessId = login?.selectedBusinessId;
    if (businessId == null) return;

    redirecting.value = true;
    GoRouter.of(context).go('/home/$pageIndex/horizontal-properties/$businessId');
  }
}
