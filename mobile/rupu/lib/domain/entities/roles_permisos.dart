
class RolesPermisosResponse {
  final bool success;
  final RolesPermisos data;

  const RolesPermisosResponse({
    required this.success,
    required this.data,
  });
}

/// Representa el objeto "data" del JSON:
/// {
///   "is_super": true,
///   "roles": [ ... ],
///   "resources": [ ... ]
/// }
class RolesPermisos {
  final bool isSuper;
  final List<Role> roles;
  final List<Resource> resources;

  const RolesPermisos({
    required this.isSuper,
    required this.roles,
    required this.resources,
  });
}

/// Item de "roles":
/// { "id": 1, "name": "Super Administrador", "description": "..." }
class Role {
  final int id;
  final String name;
  final String description;

  const Role({
    required this.id,
    required this.name,
    required this.description,
  });
}

/// Item de "resources":
/// { "resource": "business_types", "actions": ["Read", "Manage"] }
class Resource {
  final String resource;
  final List<String> actions;
  final bool isActive;

  const Resource({
    required this.resource,
    required this.actions,
    required this.isActive,
  });
}
