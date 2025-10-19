import 'package:rupu/domain/entities/roles_permisos.dart';
import 'package:rupu/domain/infrastructure/models/permisos_roles_response_model.dart';

class PermisosRolesMapper {
  /// Mapea la respuesta completa a la entidad de dominio [RolesPermisos].
  static RolesPermisos responseToEntity(PermisosRolesResponseModel model) =>
      _fromDataModel(model.data);

  static RolesPermisos _fromDataModel(AccessControlDataModel m) =>
      RolesPermisos(
        isSuper: m.isSuper,
        roles: m.roles.map(roleFromModel).toList(),
        permissions: m.permissions.map(permissionFromModel).toList(),
        resources: m.resources.map(_resourceFromModel).toList(),
      );

  static Role roleFromModel(RoleModel m) => Role(
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

  static Permission permissionFromModel(PermissionModel m) => Permission(
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
        actions: m.actions.map(permissionFromModel).toList(),
        isActive: m.active ?? true,
      );
}
