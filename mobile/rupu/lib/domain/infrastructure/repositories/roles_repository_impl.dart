import 'package:rupu/domain/datasource/roles_datasource.dart';
import 'package:rupu/domain/entities/role.dart';
import 'package:rupu/domain/entities/role_action_result.dart';
import 'package:rupu/domain/entities/iam_resource.dart' show IamMessageResult;
import 'package:rupu/domain/repositories/roles_repository.dart';

class RolesRepositoryImpl extends RolesRepository {
  final RolesDatasource datasource;

  RolesRepositoryImpl(this.datasource);

  @override
  Future<RolesCatalog> obtenerRoles() {
    return datasource.obtenerRoles();
  }

  @override
  Future<RoleActionResult> crearRol(Map<String, dynamic> payload) {
    return datasource.crearRol(payload);
  }

  @override
  Future<RoleActionResult> actualizarRol(int id, Map<String, dynamic> payload) {
    return datasource.actualizarRol(id, payload);
  }

  @override
  Future<IamMessageResult> eliminarRol(int id) {
    return datasource.eliminarRol(id);
  }

  @override
  Future<List<int>> obtenerPermisosAsignados(int roleId) {
    return datasource.obtenerPermisosAsignados(roleId);
  }

  @override
  Future<IamMessageResult> asignarPermisos(int roleId, List<int> permissionIds) {
    return datasource.asignarPermisos(roleId, permissionIds);
  }

  @override
  Future<IamMessageResult> eliminarPermiso(int roleId, int permissionId) {
    return datasource.eliminarPermiso(roleId, permissionId);
  }
}
