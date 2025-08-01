/// Modelo de datos para la respuesta de permisos/roles/recursos.
class PermisosRolesResponseModel {
  final bool success;
  final AccessControlDataModel data;

  PermisosRolesResponseModel({required this.success, required this.data});

  factory PermisosRolesResponseModel.fromJson(Map<String, dynamic> json) {
    return PermisosRolesResponseModel(
      success: json['success'] as bool,
      data: AccessControlDataModel.fromJson(
        json['data'] as Map<String, dynamic>,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {'success': success, 'data': data.toJson()};
  }
}

/// Modelo de datos para el campo "data" de la respuesta de control de acceso.
class AccessControlDataModel {
  final bool isSuper;
  final List<PermissionModel> permissions;
  final List<ResourceModel> resources;
  final List<RoleModel> roles;

  AccessControlDataModel({
    required this.isSuper,
    required this.permissions,
    required this.resources,
    required this.roles,
  });

  factory AccessControlDataModel.fromJson(Map<String, dynamic> json) {
    final permissionsJson = json['permissions'];
    final resourcesJson = json['resources'];
    final rolesJson = json['roles'];

    final permissions = <PermissionModel>[];
    if (permissionsJson is List) {
      permissions.addAll(
        permissionsJson.whereType<Map<String, dynamic>>().map(
          PermissionModel.fromJson,
        ),
      );
    }

    final resources = <ResourceModel>[];
    if (resourcesJson is List) {
      resources.addAll(
        resourcesJson.whereType<Map<String, dynamic>>().map(
          ResourceModel.fromJson,
        ),
      );
    }

    final roles = <RoleModel>[];
    if (rolesJson is List) {
      roles.addAll(
        rolesJson.whereType<Map<String, dynamic>>().map(RoleModel.fromJson),
      );
    }

    return AccessControlDataModel(
      isSuper: json['is_super'] as bool? ?? false,
      permissions: permissions,
      resources: resources,
      roles: roles,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'is_super': isSuper,
      'permissions': permissions.map((e) => e.toJson()).toList(),
      'resources': resources.map((e) => e.toJson()).toList(),
      'roles': roles.map((e) => e.toJson()).toList(),
    };
  }
}

class PermissionModel {
  final String action;
  final String code;
  final String description;
  final int id;
  final String name;
  final String resource;
  final String scope;

  PermissionModel({
    required this.action,
    required this.code,
    required this.description,
    required this.id,
    required this.name,
    required this.resource,
    required this.scope,
  });

  factory PermissionModel.fromJson(Map<String, dynamic> json) {
    return PermissionModel(
      action: json['action'] as String,
      code: json['code'] as String,
      description: json['description'] as String,
      id: json['id'] as int,
      name: json['name'] as String,
      resource: json['resource'] as String,
      scope: json['scope'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'action': action,
      'code': code,
      'description': description,
      'id': id,
      'name': name,
      'resource': resource,
      'scope': scope,
    };
  }
}

class ResourceModel {
  final List<PermissionModel> actions;
  final String resource;
  final String resourceName;

  ResourceModel({
    required this.actions,
    required this.resource,
    required this.resourceName,
  });

  factory ResourceModel.fromJson(Map<String, dynamic> json) {
    return ResourceModel(
      actions: (json['actions'] as List<dynamic>)
          .map((e) => PermissionModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      resource: json['resource'] as String,
      resourceName: json['resource_name'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'actions': actions.map((e) => e.toJson()).toList(),
      'resource': resource,
      'resource_name': resourceName,
    };
  }
}

class RoleModel {
  final String code;
  final String description;
  final int id;
  final int level;
  final String name;
  final String scope;

  RoleModel({
    required this.code,
    required this.description,
    required this.id,
    required this.level,
    required this.name,
    required this.scope,
  });

  factory RoleModel.fromJson(Map<String, dynamic> json) {
    return RoleModel(
      code: json['code'] as String,
      description: json['description'] as String,
      id: json['id'] as int,
      level: json['level'] as int,
      name: json['name'] as String,
      scope: json['scope'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'description': description,
      'id': id,
      'level': level,
      'name': name,
      'scope': scope,
    };
  }
}
