import 'package:rupu/domain/entities/roles_permisos.dart';

abstract class PermisosRolesRepository {
  Future<RolesPermisos> obtenerRolesPermisos({required int businessId});
}
