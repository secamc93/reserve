import 'package:rupu/domain/entities/permission.dart';
import 'package:rupu/domain/entities/role_action_result.dart';
import 'package:rupu/domain/entities/iam_resource.dart' show IamMessageResult;

abstract class PermissionsRepository {
  Future<PermissionsCatalog> obtenerPermisos();

  Future<PermissionActionResult> crearPermiso(Map<String, dynamic> payload);

  Future<IamMessageResult> actualizarPermiso(
    int id,
    Map<String, dynamic> payload,
  );

  Future<IamMessageResult> eliminarPermiso(int id);
}
