import 'package:get/get.dart';

import '../../presentation/views/views.dart';

class LoginBinding {
  static void register() {
    if (!Get.isRegistered<LoginController>()) {
      Get.put(LoginController());
    }
  }
}

class BusinessSelectorBinding {
  static void register() {
    LoginBinding.register();
    if (!Get.isRegistered<BusinessSelectorController>()) {
      Get.put(BusinessSelectorController());
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

class ReserveUpdateBinding {
  static void register() {
    if (!Get.isRegistered<ReserveUpdateController>()) {
      Get.put(ReserveUpdateController());
    }
  }
}

class ClientsBinding {
  static void register() {
    if (!Get.isRegistered<ClientsController>()) {
      Get.put(ClientsController());
    }
  }
}

class UsersBinding {
  static void register() {
    if (!Get.isRegistered<UsersController>()) {
      Get.put(UsersController());
    }
  }
}

class UserDetailBinding {
  static void register() {
    if (!Get.isRegistered<UserDetailController>()) {
      Get.put(UserDetailController());
    }
  }
}

class SettingsBinding {
  static void register() {
    if (!Get.isRegistered<SettingsController>()) {
      Get.put(SettingsController());
    }
  }
}

class CreateUserBinding {
  static void register() {
    if (!Get.isRegistered<CreateUserController>()) {
      Get.put(CreateUserController());
    }
  }
}
