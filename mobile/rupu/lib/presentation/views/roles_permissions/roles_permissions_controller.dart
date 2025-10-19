import 'package:get/get.dart';

import 'package:rupu/domain/entities/roles_permisos.dart';
import 'package:rupu/presentation/views/home/home_controller.dart';

enum RolesPermissionsTab { roles, permissions }

class RolesPermissionsController extends GetxController {
  RolesPermissionsController({HomeController? home})
      : homeController = home ?? Get.find<HomeController>();

  final HomeController homeController;

  final selectedTab = RolesPermissionsTab.roles.obs;
  final roles = <Role>[].obs;
  final permissions = <Permission>[].obs;
  final isLoading = false.obs;
  final errorMessage = RxnString();

  Worker? _rolesWorker;
  Worker? _loadingWorker;
  Worker? _errorWorker;

  bool get isSuperAdmin => homeController.rolesPermisos.value?.isSuper ?? false;

  @override
  void onInit() {
    super.onInit();
    _syncFromHome();
    _rolesWorker = ever<RolesPermisos?>(
      homeController.rolesPermisos,
      (_) => _syncFromHome(),
    );
    _loadingWorker = ever<bool>(
      homeController.isLoading,
      (value) => isLoading.value = value,
    );
    _errorWorker = ever<String?>(
      homeController.errorMessage,
      (value) => errorMessage.value = value,
    );
  }

  void selectTab(RolesPermissionsTab tab) {
    selectedTab.value = tab;
  }

  Future<void> refreshData() {
    return homeController.loadRolesPermisos();
  }

  void _syncFromHome() {
    final data = homeController.rolesPermisos.value;
    roles.value = data?.roles ?? <Role>[];
    permissions.value = data?.permissions ?? <Permission>[];
  }

  @override
  void onClose() {
    _rolesWorker?.dispose();
    _loadingWorker?.dispose();
    _errorWorker?.dispose();
    super.onClose();
  }
}
