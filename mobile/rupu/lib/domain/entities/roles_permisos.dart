class RolesPermisos {
  final bool isSuper;
  final List<Permission> permissions;
  final List<Resource> resources;
  final List<Role> roles;

  const RolesPermisos({
    required this.isSuper,
    required this.permissions,
    required this.resources,
    required this.roles,
  });
}

class Permission {
  final String action;
  final String code;
  final String description;
  final int id;
  final String name;
  final String resource;
  final String scope;

  const Permission({
    required this.action,
    required this.code,
    required this.description,
    required this.id,
    required this.name,
    required this.resource,
    required this.scope,
  });
}

class Resource {
  final List<Permission> actions;
  final String resource;
  final String resourceName;

  const Resource({
    required this.actions,
    required this.resource,
    required this.resourceName,
  });
}

class Role {
  final String code;
  final String description;
  final int id;
  final int level;
  final String name;
  final String scope;

  const Role({
    required this.code,
    required this.description,
    required this.id,
    required this.level,
    required this.name,
    required this.scope,
  });
}
