// presentation/views/roles_permissions/roles_permissions_controller.dart
import 'package:dio/dio.dart';
import 'package:get/get.dart';
import 'package:rupu/config/helpers/string_match.dart';

import 'package:rupu/domain/entities/roles_permisos.dart';
import 'package:rupu/domain/infrastructure/datasources/permissions_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/datasources/roles_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/repositories/permissions_repository_impl.dart';
import 'package:rupu/domain/infrastructure/repositories/roles_repository_impl.dart';
import 'package:rupu/domain/repositories/permissions_repository.dart';
import 'package:rupu/domain/repositories/roles_repository.dart';
import 'package:rupu/presentation/views/home/home_controller.dart';

// <<< importa tu helper >>>
// Debe exponer: String _norm(String), bool safeContains(String, String)

enum RolesPermissionsTab { roles, permissions }

class RolesPermissionsController extends GetxController {
  RolesPermissionsController({
    HomeController? home,
    RolesRepository? rolesRepo,
    PermissionsRepository? permissionsRepo,
  }) : homeController = home ?? Get.find<HomeController>(),
       rolesRepository =
           rolesRepo ?? RolesRepositoryImpl(RolesDatasourceImpl()),
       permissionsRepository =
           permissionsRepo ??
           PermissionsRepositoryImpl(PermissionsDatasourceImpl());

  // ───────────────── deps/repos ─────────────────
  final HomeController homeController;
  final RolesRepository rolesRepository;
  final PermissionsRepository permissionsRepository;

  // ───────────────── estado base ─────────────────
  final selectedTab = RolesPermissionsTab.roles.obs;
  final roles = <Role>[].obs;
  final permissions = <Permission>[].obs;

  final rolesCount = 0.obs;
  final permissionsCount = 0.obs;

  final isLoading = false.obs;
  final errorMessage = RxnString();

  // ───────────────── búsqueda segura (sin RegExp) ─────────────────
  /// Texto de búsqueda *único* para ambos tabs.
  final searchText = ''.obs;

  /// Atajo de lectura/edición desde la vista.
  void setSearch(String v) => searchText.value = v;
  void clearSearch() => searchText.value = '';

  /// Lista filtrada (roles)
  List<Role> get filteredRoles {
    final q = searchText.value.trim();
    if (q.isEmpty) return roles;
    return roles
        .where((r) {
          final scope = r.scopeName?.isNotEmpty == true
              ? r.scopeName!
              : (r.scopeCode ?? '');
          return safeContains(r.name, q) ||
              safeContains(r.description, q) ||
              safeContains(scope, q) ||
              safeContains('${r.level}', q) ||
              safeContains('${r.id}', q);
        })
        .toList(growable: false);
  }

  /// Lista filtrada (permisos)
  List<Permission> get filteredPermissions {
    final q = searchText.value.trim();
    if (q.isEmpty) return permissions;
    return permissions
        .where((p) {
          return safeContains(p.resource, q) ||
              safeContains(p.action, q) ||
              safeContains(p.description, q) ||
              safeContains('${p.id}', q);
        })
        .toList(growable: false);
  }

  bool get isSuperAdmin => homeController.isSuper;

  // ───────────────── lifecycle ─────────────────
  @override
  void onInit() {
    super.onInit();
    _loadCatalogs();

    // Opcional: si quieres limpiar búsqueda al cambiar de tab:
    ever<RolesPermissionsTab>(selectedTab, (_) => clearSearch());
  }

  void selectTab(RolesPermissionsTab tab) {
    selectedTab.value = tab;
  }

  Future<void> refreshData() async {
    await Future.wait([homeController.loadRolesPermisos(), _loadCatalogs()]);
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
        final data = (e.response!.data as Map).cast<String, dynamic>();
        errorMessage.value =
            data['message']?.toString() ?? 'Error cargando roles y permisos';
      } else {
        errorMessage.value = 'Error cargando roles y permisos: ${e.message}';
      }
    } catch (e) {
      errorMessage.value = 'Error inesperado cargando roles y permisos: $e';
    } finally {
      isLoading.value = false;
    }
  }
}
