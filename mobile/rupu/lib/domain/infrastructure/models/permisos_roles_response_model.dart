/// Modelo de datos para la respuesta de permisos/roles/recursos.
class PermisosRolesResponseModel {
  final bool success;
  final AccessControlDataModel data;

  PermisosRolesResponseModel({required this.success, required this.data});

  factory PermisosRolesResponseModel.fromJson(Map<String, dynamic> json) {
    return PermisosRolesResponseModel(
      success: json['success'] as bool? ?? false,
      data: AccessControlDataModel.fromJson(
        (json['data'] as Map?)?.cast<String, dynamic>() ?? const {},
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {'success': success, 'data': data.toJson()};
  }
}

/// Modelo de datos para el campo "data" de la respuesta de control de acceso.
/// Estructura esperada:
/// {
///   "is_super": true,
///   "roles": [ { "id": 1, "name": "...", "description": "..." } ],
///   "resources": [ { "resource": "business_types", "actions": ["Read","Manage"] } ]
/// }
class AccessControlDataModel {
  final bool isSuper;
  final List<ResourceModel> resources;
  final List<RoleModel> roles;
  final List<PermissionModel> permissions;

  AccessControlDataModel({
    required this.isSuper,
    required this.resources,
    required this.roles,
    required this.permissions,
  });

  factory AccessControlDataModel.fromJson(Map<String, dynamic> json) {
    final resourcesJson = json['resources'];
    final rolesJson = json['roles'];
    final permissionsJson = json['permissions'];

    final resources = <ResourceModel>[];
    if (resourcesJson is List) {
      resources.addAll(
        resourcesJson
            .whereType<Map>()
            .map((e) => ResourceModel.fromJson(e.cast<String, dynamic>()))
            .toList(),
      );
    }

    final roles = <RoleModel>[];
    if (rolesJson is List) {
      roles.addAll(
        rolesJson
            .whereType<Map>()
            .map((e) => RoleModel.fromJson(e.cast<String, dynamic>()))
            .toList(),
      );
    }

    final permissions = <PermissionModel>[];
    if (permissionsJson is List) {
      permissions.addAll(
        permissionsJson
            .whereType<Map>()
            .map((e) => PermissionModel.fromJson(e.cast<String, dynamic>()))
            .toList(),
      );
    }

    return AccessControlDataModel(
      isSuper: json['is_super'] as bool? ?? false,
      resources: resources,
      roles: roles,
      permissions: permissions,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'is_super': isSuper,
      'resources': resources.map((e) => e.toJson()).toList(),
      'roles': roles.map((e) => e.toJson()).toList(),
      'permissions': permissions.map((e) => e.toJson()).toList(),
    };
  }
}

/// Modelo para cada recurso con sus acciones asociadas.
class ResourceModel {
  final String resource;
  final String? resourceName;
  final List<PermissionModel> actions;
  final bool? active;

  ResourceModel({
    required this.resource,
    required this.actions,
    this.resourceName,
    this.active,
  });

  factory ResourceModel.fromJson(Map<String, dynamic> json) {
    final actionsJson = json['actions'];
    final actions = <PermissionModel>[];

    if (actionsJson is List) {
      actions.addAll(
        actionsJson
            .whereType<Map>()
            .map((e) => PermissionModel.fromJson(e.cast<String, dynamic>()))
            .toList(),
      );
    }

    return ResourceModel(
      resource: json['resource']?.toString() ?? '',
      resourceName: json['resource_name']?.toString(),
      actions: actions,
      active: json['active'] as bool?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'resource': resource,
      if (resourceName != null) 'resource_name': resourceName,
      'actions': actions.map((e) => e.toJson()).toList(),
      if (active != null) 'active': active,
    };
  }
}

/// Modelo para cada rol.
class RoleModel {
  final int id;
  final String name;
  final String description;
  final String code;
  final int level;
  final String? scope;
  final int? scopeId;
  final String? scopeName;
  final String? scopeCode;
  final bool? isSystem;

  RoleModel({
    required this.id,
    required this.name,
    required this.description,
    required this.code,
    required this.level,
    this.scope,
    this.scopeId,
    this.scopeName,
    this.scopeCode,
    this.isSystem,
  });

  factory RoleModel.fromJson(Map<String, dynamic> json) {
    return RoleModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      code: json['code']?.toString() ?? '',
      level: (json['level'] as num?)?.toInt() ?? 0,
      scope: json['scope']?.toString(),
      scopeId: (json['scope_id'] as num?)?.toInt(),
      scopeName:
          json['scope_name']?.toString() ?? json['scope']?.toString(),
      scopeCode: json['scope_code']?.toString(),
      isSystem: json['is_system'] as bool?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'code': code,
      'level': level,
      if (scope != null) 'scope': scope,
      if (scopeId != null) 'scope_id': scopeId,
      if (scopeName != null) 'scope_name': scopeName,
      if (scopeCode != null) 'scope_code': scopeCode,
      if (isSystem != null) 'is_system': isSystem,
    };
  }
}

/// Modelo para cada permiso individual.
class PermissionModel {
  final int id;
  final String name;
  final String code;
  final String description;
  final String resource;
  final String action;
  final String? scope;
  final int? scopeId;
  final String? scopeName;
  final String? scopeCode;

  PermissionModel({
    required this.id,
    required this.name,
    required this.code,
    required this.description,
    required this.resource,
    required this.action,
    this.scope,
    this.scopeId,
    this.scopeName,
    this.scopeCode,
  });

  factory PermissionModel.fromJson(Map<String, dynamic> json) {
    return PermissionModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name']?.toString() ?? '',
      code: json['code']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      resource: json['resource']?.toString() ?? '',
      action: json['action']?.toString() ?? '',
      scope: json['scope']?.toString(),
      scopeId: (json['scope_id'] as num?)?.toInt(),
      scopeName:
          json['scope_name']?.toString() ?? json['scope']?.toString(),
      scopeCode: json['scope_code']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code,
      'description': description,
      'resource': resource,
      'action': action,
      if (scope != null) 'scope': scope,
      if (scopeId != null) 'scope_id': scopeId,
      if (scopeName != null) 'scope_name': scopeName,
      if (scopeCode != null) 'scope_code': scopeCode,
    };
  }
}

class RolesListResponseModel {
  final bool success;
  final List<RoleModel> data;
  final int count;

  RolesListResponseModel({
    required this.success,
    required this.data,
    required this.count,
  });

  factory RolesListResponseModel.fromJson(Map<String, dynamic> json) {
    final dataJson = json['data'];
    final roles = <RoleModel>[];

    if (dataJson is List) {
      for (final item in dataJson) {
        if (item is Map<String, dynamic>) {
          roles.add(RoleModel.fromJson(item));
        }
      }
    }

    return RolesListResponseModel(
      success: json['success'] as bool? ?? false,
      data: roles,
      count: (json['count'] as num?)?.toInt() ?? roles.length,
    );
  }
}

class PermissionsListResponseModel {
  final bool success;
  final List<PermissionModel> data;
  final int count;

  PermissionsListResponseModel({
    required this.success,
    required this.data,
    required this.count,
  });

  factory PermissionsListResponseModel.fromJson(Map<String, dynamic> json) {
    final dataJson = json['data'];
    final permissions = <PermissionModel>[];

    if (dataJson is List) {
      for (final item in dataJson) {
        if (item is Map<String, dynamic>) {
          permissions.add(PermissionModel.fromJson(item));
        }
      }
    }

    final total = json['total'] ?? json['count'];

    return PermissionsListResponseModel(
      success: json['success'] as bool? ?? false,
      data: permissions,
      count: (total as num?)?.toInt() ?? permissions.length,
    );
  }
}
