import 'package:dio/dio.dart';
import 'package:get/get.dart';

import 'package:rupu/domain/entities/roles_permisos.dart';
import 'package:rupu/domain/infrastructure/datasources/permissions_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/datasources/roles_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/repositories/permissions_repository_impl.dart';
import 'package:rupu/domain/infrastructure/repositories/roles_repository_impl.dart';
import 'package:rupu/domain/repositories/permissions_repository.dart';
import 'package:rupu/domain/repositories/roles_repository.dart';
import 'package:rupu/presentation/views/home/home_controller.dart';

enum RolesPermissionsTab { roles, permissions }

class RolesPermissionsController extends GetxController {
  RolesPermissionsController({
    HomeController? home,
    RolesRepository? rolesRepo,
    PermissionsRepository? permissionsRepo,
  })  : homeController = home ?? Get.find<HomeController>(),
        rolesRepository =
            rolesRepo ?? RolesRepositoryImpl(RolesDatasourceImpl()),
        permissionsRepository = permissionsRepo ??
            PermissionsRepositoryImpl(PermissionsDatasourceImpl());

  final HomeController homeController;
  final RolesRepository rolesRepository;
  final PermissionsRepository permissionsRepository;

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
      final rolesCatalog = await rolesRepository.obtenerRoles();
      final permissionsCatalog = await permissionsRepository.obtenerPermisos();

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
