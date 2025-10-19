import 'package:rupu/domain/entities/roles_permisos.dart';
import 'package:rupu/domain/infrastructure/models/permisos_roles_response_model.dart';

class PermisosRolesMapper {
  /// Mapea la respuesta completa a la entidad de dominio [RolesPermisos].
  static RolesPermisos responseToEntity(PermisosRolesResponseModel model) =>
      _fromDataModel(model.data);

  static RolesPermisos _fromDataModel(AccessControlDataModel m) =>
      RolesPermisos(
        isSuper: m.isSuper,
        roles: m.roles.map(_roleFromModel).toList(),
        permissions: m.permissions.map(_permissionFromModel).toList(),
        resources: m.resources.map(_resourceFromModel).toList(),
      );

  static Role _roleFromModel(RoleModel m) => Role(
        id: m.id,
        name: m.name,
        code: m.code,
        description: m.description,
        level: m.level,
        scopeId: m.scopeId,
        scopeName: m.scopeName ?? m.scope,
        scopeCode: m.scopeCode,
        isSystem: m.isSystem ?? false,
      );

  static Permission _permissionFromModel(PermissionModel m) => Permission(
        id: m.id,
        name: m.name,
        code: m.code,
        description: m.description,
        resource: m.resource,
        action: m.action,
        scopeId: m.scopeId,
        scopeName: m.scopeName ?? m.scope,
        scopeCode: m.scopeCode,
      );

  static ResourcePermissions _resourceFromModel(ResourceModel m) =>
      ResourcePermissions(
        resource: m.resource,
        resourceName: m.resourceName,
        actions: m.actions.map(_permissionFromModel).toList(),
        isActive: m.active ?? true,
      );

  static RolesCatalog rolesListToEntity(RolesListResponseModel model) =>
      RolesCatalog(
        roles: model.data.map(_roleFromModel).toList(),
        count: model.count,
      );

  static PermissionsCatalog permissionsListToEntity(
    PermissionsListResponseModel model,
  ) =>
      PermissionsCatalog(
        permissions: model.data.map(_permissionFromModel).toList(),
        count: model.count,
      );
}
