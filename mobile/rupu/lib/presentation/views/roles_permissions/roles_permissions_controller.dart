import 'package:dio/dio.dart';
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
  final rolesCount = 0.obs;
  final permissionsCount = 0.obs;
  final isLoading = false.obs;
  final errorMessage = RxnString();

  bool get isSuperAdmin => homeController.rolesPermisos.value?.isSuper ?? false;

  @override
  void onInit() {
    super.onInit();
    _loadCatalogs();
  }

  void selectTab(RolesPermissionsTab tab) {
    selectedTab.value = tab;
  }

  Future<void> refreshData() async {
    await Future.wait([
      homeController.loadRolesPermisos(),
      _loadCatalogs(),
    ]);
  }

  Future<void> _loadCatalogs() async {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      final repo = homeController.repository;

      final rolesFuture = repo.obtenerCatalogoRoles();
      final permissionsFuture = repo.obtenerCatalogoPermisos();

      final rolesCatalog = await rolesFuture;
      final permissionsCatalog = await permissionsFuture;

      roles
        ..clear()
        ..addAll(rolesCatalog.roles);
      permissions
        ..clear()
        ..addAll(permissionsCatalog.permissions);
      rolesCount.value = rolesCatalog.count;
      permissionsCount.value = permissionsCatalog.count;
    } on DioException catch (e) {
      if (e.response?.data is Map) {
        final data =
            (e.response!.data as Map).cast<String, dynamic>();
        errorMessage.value = data['message']?.toString() ??
            'Error cargando roles y permisos';
      } else {
        errorMessage.value =
            'Error cargando roles y permisos: ${e.message}';
      }
    } catch (e) {
      errorMessage.value = 'Error inesperado cargando roles y permisos: $e';
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    super.onClose();
  }
}
