import 'package:rupu/domain/datasource/permisos_roles_datasource.dart';
import 'package:rupu/domain/entities/roles_permisos.dart';
import 'package:rupu/domain/repositories/permisos_roles_repository.dart';

class PermisosRolesRespositoryImpl extends PermisosRolesRepository {
  final PermisosRolesDatasource datasource;
  PermisosRolesRespositoryImpl(this.datasource);

  @override
  Future<RolesPermisos> obtenerRolesPermisos({required int businessId}) {
    return datasource.obtenerRolesPermisos(businessId: businessId);
  }

  @override
  Future<RolesCatalog> obtenerCatalogoRoles() {
    return datasource.obtenerCatalogoRoles();
  }

  @override
  Future<PermissionsCatalog> obtenerCatalogoPermisos() {
    return datasource.obtenerCatalogoPermisos();
  }
}
