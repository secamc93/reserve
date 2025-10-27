import 'permission.dart';
import 'role.dart';

export 'permission.dart';
export 'role.dart';

class RolesPermisosResponse {
  final bool success;
  final RolesPermisos data;

  const RolesPermisosResponse({
    required this.success,
    required this.data,
  });
}

/// Representa la respuesta de control de acceso con roles, permisos y recursos.
class RolesPermisos {
  final bool isSuper;
  final List<Role> roles;
  final List<Permission> permissions;
  final List<ResourcePermissions> resources;

  const RolesPermisos({
    required this.isSuper,
    required this.roles,
    required this.permissions,
    required this.resources,
  });
}

/// Agrupación de permisos por recurso.
class ResourcePermissions {
  final String resource;
  final String? resourceName;
  final List<Permission> actions;
  final bool isActive;

  const ResourcePermissions({
    required this.resource,
    required this.actions,
    this.resourceName,
    this.isActive = true,
  });
}
