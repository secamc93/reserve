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

  AccessControlDataModel({
    required this.isSuper,
    required this.resources,
    required this.roles,
  });

  factory AccessControlDataModel.fromJson(Map<String, dynamic> json) {
    final resourcesJson = json['resources'];
    final rolesJson = json['roles'];

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

    return AccessControlDataModel(
      isSuper: json['is_super'] as bool? ?? false,
      resources: resources,
      roles: roles,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'is_super': isSuper,
      'resources': resources.map((e) => e.toJson()).toList(),
      'roles': roles.map((e) => e.toJson()).toList(),
    };
  }
}

/// Modelo para cada recurso:
/// { "resource": "business_types", "actions": ["Read","Manage"] }
class ResourceModel {
  final String resource;
  final List<String> actions;

  ResourceModel({required this.resource, required this.actions});

  factory ResourceModel.fromJson(Map<String, dynamic> json) {
    final actionsJson = json['actions'];
    final actions = <String>[];

    if (actionsJson is List) {
      for (final item in actionsJson) {
        // Asegura conversión robusta a String
        actions.add(item?.toString() ?? '');
      }
    }

    return ResourceModel(
      resource: json['resource']?.toString() ?? '',
      actions: actions,
    );
  }

  Map<String, dynamic> toJson() {
    return {'resource': resource, 'actions': actions};
  }
}

/// Modelo para cada rol:
/// { "id": 1, "name": "Super Administrador", "description": "..." }
class RoleModel {
  final int id;
  final String name;
  final String description;

  RoleModel({required this.id, required this.name, required this.description});

  factory RoleModel.fromJson(Map<String, dynamic> json) {
    return RoleModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'name': name, 'description': description};
  }
}
