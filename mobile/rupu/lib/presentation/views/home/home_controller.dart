// presentation/views/home/home_controller.dart
import 'package:dio/dio.dart';
import 'package:flutter/widgets.dart';
import 'package:get/get.dart';

import 'package:rupu/config/theme/app_theme.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';

import 'package:rupu/domain/entities/roles_permisos.dart';
import 'package:rupu/domain/repositories/permisos_roles_repository.dart';
import 'package:rupu/domain/infrastructure/repositories/permisos_roles_respository_impl.dart';
import 'package:rupu/domain/infrastructure/datasources/permisos_roles_datasource_impl.dart';

class HomeController extends GetxController {
  final PermisosRolesRepository repository;
  HomeController({PermisosRolesRepository? repository})
    : repository =
          repository ??
          PermisosRolesRespositoryImpl(PermisosRolesDatasourceImpl());

  final isLoading = false.obs;
  final errorMessage = RxnString();
  final Rxn<RolesPermisos> rolesPermisos = Rxn();

  bool get isSuper => rolesPermisos.value?.isSuper ?? false;

  /// Verifica si existe el `action` permitido.
  /// - Si [resource] es null, busca el `action` en cualquier recurso.
  /// - Si [resource] no es null, busca primero el recurso y luego el `action`.
  /// - Si el usuario es super, permite todo.
  bool hasPermission({required String action, String? resource}) {
    final rp = rolesPermisos.value;
    if (rp == null) return false;
    if (rp.isSuper) return true;

    if (resource == null) {
      return rp.resources.any((r) => r.actions.contains(action));
    }

    final res = rp.resources.firstWhereOrNull((r) => r.resource == resource);
    if (res == null) return false;

    return res.actions.contains(action);
  }

  @override
  void onInit() {
    super.onInit();
    _applyBusinessTheme();
    loadRolesPermisos();
  }

  Future<void> loadRolesPermisos() async {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      final rp = await repository.obtenerRolesPermisos();
      rolesPermisos.value = rp;
    } on DioException catch (e) {
      errorMessage.value = (e.response?.statusCode == 401)
          ? 'No autorizado al obtener permisos.'
          : 'Error cargando permisos: ${e.message}';
    } catch (e) {
      errorMessage.value = 'Error inesperado cargando permisos: $e';
    } finally {
      isLoading.value = false;
    }
  }

  /// Saca los colores de negocio desde la sesión y actualiza el tema.
  void _applyBusinessTheme() {
    final login = Get.find<LoginController>();
    final businesses = login.sessionModel.value?.data.businesses ?? [];
    if (businesses.isEmpty) return;

    final primary = businesses.first.primaryColor;
    final secondary = businesses.first.secondaryColor;

    // Post-frame para no hacerlo en medio de un build.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      AppTheme.instance.updateColors(primary, secondary);
    });
  }
}
