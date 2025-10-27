import 'package:rupu/domain/datasource/permissions_datasource.dart';
import 'package:rupu/domain/entities/permission.dart';
import 'package:rupu/domain/repositories/permissions_repository.dart';

class PermissionsRepositoryImpl extends PermissionsRepository {
  final PermissionsDatasource datasource;

  PermissionsRepositoryImpl(this.datasource);

  @override
  Future<PermissionsCatalog> obtenerPermisos() {
    return datasource.obtenerPermisos();
  }
}
