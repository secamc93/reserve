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

/// Información del rol disponible para el usuario.
class Role {
  final int id;
  final String name;
  final String code;
  final String description;
  final int level;
  final String? scope;
  final bool isSystem;

  const Role({
    required this.id,
    required this.name,
    required this.code,
    required this.description,
    required this.level,
    this.scope,
    this.isSystem = false,
  });
}

/// Información detallada de un permiso individual.
class Permission {
  final int id;
  final String name;
  final String code;
  final String description;
  final String resource;
  final String action;
  final String? scope;

  const Permission({
    required this.id,
    required this.name,
    required this.code,
    required this.description,
    required this.resource,
    required this.action,
    this.scope,
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
