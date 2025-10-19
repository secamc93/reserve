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

  final LoginController _loginController = Get.find<LoginController>();

  final isLoading = false.obs;
  final errorMessage = RxnString();
  final Rxn<RolesPermisos> rolesPermisos = Rxn();

  bool get isSuper => rolesPermisos.value?.isSuper ?? false;

  Worker? _businessWorker;

  /// Verifica si el usuario cuenta con el permiso indicado.
  /// - Si [resource] es `null`, busca la acción en todos los permisos.
  /// - Si [resource] tiene valor, filtra por recurso y acción.
  bool hasPermission({required String action, String? resource}) {
    final rp = rolesPermisos.value;
    if (rp == null) return false;
    if (rp.isSuper) return true;

    final normalizedAction = action.toLowerCase();

    if (resource == null) {
      return rp.permissions
          .any((permission) => permission.action.toLowerCase() == normalizedAction);
    }

    final normalizedResource = resource.toLowerCase();
    return rp.permissions.any(
      (permission) =>
          permission.resource.toLowerCase() == normalizedResource &&
          permission.action.toLowerCase() == normalizedAction,
    );
  }

  /// Permite validar acceso a un recurso en particular considerando:
  /// - Si el usuario es super administrador: acceso total.
  /// - Que el recurso exista y esté activo (a menos que [requireActive] sea
  ///   `false`).
  /// - Que cuente con al menos una de las [actions] indicadas.
  bool canAccessResource(
    String resource, {
    List<String> actions = const [],
    bool requireActive = true,
  }) {
    final rp = rolesPermisos.value;
    if (rp == null) return false;
    if (rp.isSuper) return true;

    final normalizedResource = resource.toLowerCase();
    final normalizedActions = actions.map((a) => a.toLowerCase()).toList();

    final group = rp.resources.firstWhereOrNull(
      (r) =>
          r.resource.toLowerCase() == normalizedResource ||
          (r.resourceName?.toLowerCase() == normalizedResource),
    );

    if (group != null) {
      if (requireActive && !group.isActive) return false;
      if (normalizedActions.isEmpty) {
        return group.actions.isNotEmpty;
      }

      return group.actions.any(
        (permission) => normalizedActions.contains(permission.action.toLowerCase()),
      );
    }

    if (normalizedActions.isEmpty) {
      return rp.permissions.any(
        (permission) => permission.resource.toLowerCase() == normalizedResource,
      );
    }

    return rp.permissions.any(
      (permission) =>
          permission.resource.toLowerCase() == normalizedResource &&
          normalizedActions.contains(permission.action.toLowerCase()),
    );
  }

  @override
  void onInit() {
    super.onInit();
    _applyBusinessTheme();
    loadRolesPermisos();
    _businessWorker = ever(_loginController.selectedBusiness, (_) {
      _applyBusinessTheme();
      loadRolesPermisos();
    });
  }

  Future<void> loadRolesPermisos() async {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      final businessId = _loginController.selectedBusinessId;
      if (businessId == null) {
        errorMessage.value = 'Debes seleccionar un negocio para continuar.';
        return;
      }

      final rp = await repository.obtenerRolesPermisos(businessId: businessId);
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
    final businesses = _loginController.sessionModel.value?.data.businesses ?? [];
    final selected = _loginController.selectedBusiness.value;
    final business = selected ?? (businesses.isNotEmpty ? businesses.first : null);
    if (business == null) return;

    final primary = business.primaryColor;
    final secondary = business.secondaryColor;

    // Post-frame para no hacerlo en medio de un build.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      AppTheme.instance.updateColors(primary, secondary);
    });
  }

  @override
  void onClose() {
    _businessWorker?.dispose();
    super.onClose();
  }
}
