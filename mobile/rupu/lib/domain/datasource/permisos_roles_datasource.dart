import 'package:rupu/domain/entities/roles_permisos.dart';

abstract class PermisosRolesDatasource {
  Future<RolesPermisos> obtenerRolesPermisos();
}
