import 'package:get/get.dart';
import 'package:rupu/domain/entities/horizontal_property_voting_groups.dart';

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

class HorizontalPropertiesBinding {
  static void register() {
    if (!Get.isRegistered<HorizontalPropertiesController>()) {
      Get.put(HorizontalPropertiesController());
    }
  }
}

class HorizontalPropertyDetailBinding {
  static void register({required int propertyId}) {
    final tag = HorizontalPropertyDetailController.tagFor(propertyId);
    if (!Get.isRegistered<HorizontalPropertyDetailController>(tag: tag)) {
      Get.put(
        HorizontalPropertyDetailController(propertyId: propertyId),
        tag: tag,
      );
    }
    final detailController =
        Get.find<HorizontalPropertyDetailController>(tag: tag);

    final unitsTag = HorizontalPropertyUnitsController.tagFor(propertyId);
    if (!Get.isRegistered<HorizontalPropertyUnitsController>(tag: unitsTag)) {
      Get.put(
        HorizontalPropertyUnitsController(
          propertyId: propertyId,
          repository: detailController.repository,
        ),
        tag: unitsTag,
      );
    }

    final residentsTag =
        HorizontalPropertyResidentsController.tagFor(propertyId);
    if (!Get.isRegistered<HorizontalPropertyResidentsController>(
        tag: residentsTag)) {
      Get.put(
        HorizontalPropertyResidentsController(
          propertyId: propertyId,
          repository: detailController.repository,
        ),
        tag: residentsTag,
      );
    }

    final votingTag = HorizontalPropertyVotingController.tagFor(propertyId);
    if (!Get.isRegistered<HorizontalPropertyVotingController>(tag: votingTag)) {
      Get.put(
        HorizontalPropertyVotingController(
          propertyId: propertyId,
          repository: detailController.repository,
        ),
        tag: votingTag,
      );
    }

    final dashboardTag =
        HorizontalPropertyDashboardController.tagFor(propertyId);
    if (!Get.isRegistered<HorizontalPropertyDashboardController>(
        tag: dashboardTag)) {
      Get.put(
        HorizontalPropertyDashboardController(
          propertyId: propertyId,
          detailTag: tag,
          unitsTag: unitsTag,
          residentsTag: residentsTag,
          votingTag: votingTag,
        ),
        tag: dashboardTag,
      );
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

class RolesPermissionsBinding {
  static void register() {
    HomeBinding.register();
    if (!Get.isRegistered<RolesPermissionsController>()) {
      Get.put(RolesPermissionsController());
    }
  }
}

class AttendanceManagementBinding {
  static void register({
    required int propertyId,
    required int votingGroupId,
    required int businessId,
    HorizontalPropertyVotingGroup? group,
  }) {
    final tag =
        AttendanceManagementController.tagFor(propertyId: propertyId, votingGroupId: votingGroupId);
    if (Get.isRegistered<AttendanceManagementController>(tag: tag)) {
      return;
    }

    var resolvedGroup = group;
    var resolvedBusinessId = businessId;

    if (resolvedGroup == null || resolvedBusinessId <= 0) {
      final votingTag = HorizontalPropertyVotingController.tagFor(propertyId);
      if (Get.isRegistered<HorizontalPropertyVotingController>(tag: votingTag)) {
        final votingController =
            Get.find<HorizontalPropertyVotingController>(tag: votingTag);
        resolvedGroup ??=
            votingController.groups.firstWhereOrNull((g) => g.id == votingGroupId);
        resolvedBusinessId = resolvedGroup?.businessId ?? resolvedBusinessId;
      }
    }

    if (resolvedBusinessId <= 0) {
      resolvedBusinessId = propertyId;
    }

    if (resolvedBusinessId <= 0 &&
        Get.isRegistered<LoginController>() &&
        Get.find<LoginController>().selectedBusinessId != null) {
      resolvedBusinessId = Get.find<LoginController>().selectedBusinessId!;
    }

    Get.put(
      AttendanceManagementController(
        propertyId: propertyId,
        votingGroupId: votingGroupId,
        businessId: resolvedBusinessId,
        group: resolvedGroup,
      ),
      tag: tag,
    );
  }
}
