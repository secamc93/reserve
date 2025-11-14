class Permission {
  final int id;
  final String name;
  final String code;
  final String description;
  final String resource;
  final String action;
  final int? resourceId;
  final int? actionId;
  final int? businessTypeId;
  final String? businessTypeName;
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
    this.resourceId,
    this.actionId,
    this.businessTypeId,
    this.businessTypeName,
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
