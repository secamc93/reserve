import 'package:rupu/domain/entities/roles_permisos.dart';
import 'package:rupu/domain/infrastructure/models/permisos_roles_response_model.dart';

class PermisosRolesMapper {
  /// Mapea la respuesta completa a la entidad de dominio [RolesPermisos].
  static RolesPermisos responseToEntity(PermisosRolesResponseModel model) =>
      _fromDataModel(model.data);

  static RolesPermisos _fromDataModel(AccessControlDataModel m) =>
      RolesPermisos(
        isSuper: m.isSuper,
        permissions: m.permissions.map(_permissionFromModel).toList(),
        resources: m.resources.map(_resourceFromModel).toList(),
        roles: m.roles.map(_roleFromModel).toList(),
      );

  static Permission _permissionFromModel(PermissionModel m) => Permission(
    action: m.action,
    code: m.code,
    description: m.description,
    id: m.id,
    name: m.name,
    resource: m.resource,
    scope: m.scope,
  );

  static Role _roleFromModel(RoleModel m) => Role(
    code: m.code,
    description: m.description,
    id: m.id,
    level: m.level,
    name: m.name,
    scope: m.scope,
  );

  static Resource _resourceFromModel(ResourceModel m) => Resource(
    actions: m.actions.map(_permissionFromModel).toList(),
    resource: m.resource,
    resourceName: m.resourceName,
  );
}
