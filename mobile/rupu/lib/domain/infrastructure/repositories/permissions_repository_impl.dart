import 'package:rupu/domain/datasource/permissions_datasource.dart';
import 'package:rupu/domain/entities/permission.dart';
import 'package:rupu/domain/entities/role_action_result.dart';
import 'package:rupu/domain/entities/iam_resource.dart' show IamMessageResult;
import 'package:rupu/domain/repositories/permissions_repository.dart';

class PermissionsRepositoryImpl extends PermissionsRepository {
  final PermissionsDatasource datasource;

  PermissionsRepositoryImpl(this.datasource);

  @override
  Future<PermissionsCatalog> obtenerPermisos() {
    return datasource.obtenerPermisos();
  }

  @override
  Future<PermissionActionResult> crearPermiso(Map<String, dynamic> payload) {
    return datasource.crearPermiso(payload);
  }

  @override
  Future<IamMessageResult> actualizarPermiso(
    int id,
    Map<String, dynamic> payload,
  ) {
    return datasource.actualizarPermiso(id, payload);
  }

  @override
  Future<IamMessageResult> eliminarPermiso(int id) {
    return datasource.eliminarPermiso(id);
  }
}
