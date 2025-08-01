import 'package:get/get.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';
import 'package:rupu/presentation/views/home/home_controller.dart';
import 'package:rupu/presentation/views/cambiar/cambiar_contrasena_controller.dart';

/// Bindings independientes para mantener el router limpio.
class LoginBinding {
  static void register() {
    if (!Get.isRegistered<LoginController>()) {
      Get.put(LoginController());
    }
  }
}

class HomeBinding {
  static void register() {
    // Home depende de LoginController porque lo usa para mostrar nombre/usuario.
    LoginBinding.register();
    if (!Get.isRegistered<HomeController>()) {
      Get.put(HomeController());
    }
  }
}

class CambiarContrasenaBinding {
  static void register() {
    if (!Get.isRegistered<CambiarContrasenaController>()) {
      Get.put(CambiarContrasenaController());
    }
  }
}
