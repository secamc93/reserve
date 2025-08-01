import 'package:dio/dio.dart';
import 'package:get/get.dart';
import 'package:rupu/domain/entities/roles_permisos.dart';
import 'package:rupu/domain/infrastructure/repositories/permisos_roles_respository_impl.dart';
import 'package:rupu/domain/repositories/permisos_roles_repository.dart';

import '../../../domain/infrastructure/datasources/permisos_roles_datasource_impl.dart';

class HomeController extends GetxController {
  final PermisosRolesRepository repository;

  HomeController({PermisosRolesRepository? repository})
      : repository = repository ??
            PermisosRolesRespositoryImpl(PermisosRolesDatasourceImpl());

  final isLoading = false.obs;
  final errorMessage = RxnString();
  final Rxn<RolesPermisos> rolesPermisos = Rxn();

  /// Indicador rápido si es superusuario.
  bool get isSuper => rolesPermisos.value?.isSuper ?? false;

  /// Verifica si tiene un permiso específico (puedes ajustar la lógica según tu dominio).
  bool hasPermission({required String action, String? resource}) {
    final rp = rolesPermisos.value;
    if (rp == null) return false;
    return rp.permissions.any((p) =>
        p.action == action && (resource == null || p.resource == resource));
  }

  @override
  void onInit() {
    super.onInit();
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
}