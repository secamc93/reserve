class Role {
  final int id;
  final String name;
  final String code;
  final String description;
  final int level;
  final int? scopeId;
  final String? scopeName;
  final String? scopeCode;
  final bool isSystem;

  const Role({
    required this.id,
    required this.name,
    required this.code,
    required this.description,
    required this.level,
    this.scopeId,
    this.scopeName,
    this.scopeCode,
    this.isSystem = false,
  });
}

class RolesCatalog {
  final List<Role> roles;
  final int count;

  const RolesCatalog({
    required this.roles,
    required this.count,
  });
}
