class Permission {
  final int id;
  final String name;
  final String code;
  final String description;
  final String resource;
  final String action;
  final int? scopeId;
  final String? scopeName;
  final String? scopeCode;

  const Permission({
    required this.id,
    required this.name,
    required this.code,
    required this.description,
    required this.resource,
    required this.action,
    this.scopeId,
    this.scopeName,
    this.scopeCode,
  });
}

class PermissionsCatalog {
  final List<Permission> permissions;
  final int count;

  const PermissionsCatalog({
    required this.permissions,
    required this.count,
  });
}
