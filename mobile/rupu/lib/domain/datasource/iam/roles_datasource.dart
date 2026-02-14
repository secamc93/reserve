import 'package:rupu/domain/entities/role.dart';
import 'package:rupu/domain/entities/role_action_result.dart';
import 'package:rupu/domain/entities/iam_resource.dart' show IamMessageResult;

abstract class RolesDatasource {
  Future<RolesCatalog> obtenerRoles();

  Future<RoleActionResult> crearRol(Map<String, dynamic> payload);

  Future<RoleActionResult> actualizarRol(
    int id,
    Map<String, dynamic> payload,
  );

  Future<IamMessageResult> eliminarRol(int id);

  Future<List<int>> obtenerPermisosAsignados(int roleId);

  Future<IamMessageResult> asignarPermisos(
    int roleId,
    List<int> permissionIds,
  );

  Future<IamMessageResult> eliminarPermiso(
    int roleId,
    int permissionId,
  );
}
