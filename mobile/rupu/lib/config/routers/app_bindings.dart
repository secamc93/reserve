import 'package:get/get.dart';

import '../../presentation/views/views.dart';

class LoginBinding {
  static void register() {
    if (!Get.isRegistered<LoginController>()) {
      Get.put(LoginController());
    }
  }
}

class HomeBinding {
  static void register() {
    LoginBinding.register();
    if (!Get.isRegistered<HomeController>()) {
      Get.put(HomeController());
    }
  }
}

class CambiarContrasenaBinding {
  static void register() {
    if (!Get.isRegistered<ChangePasswordController>()) {
      Get.put(ChangePasswordController());
    }
  }
}

class PerfilBinding {
  static void register() {
    if (!Get.isRegistered<PerfilController>()) {
      Get.put(PerfilController());
    }
  }
}

class ReserveBinding {
  static void register() {
    if (!Get.isRegistered<ReserveController>()) {
      Get.put(ReserveController());
    }
  }
}

class ReserveDetailBinding {
  static void register() {
    if (!Get.isRegistered<ReserveDetailController>()) {
      Get.put(ReserveDetailController());
    }
  }
}
