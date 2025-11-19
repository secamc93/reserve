class IamConfiguredResourcesResponseModel {
  final bool success;
  final List<IamConfiguredResourceModel> resources;

  IamConfiguredResourcesResponseModel({
    required this.success,
    required this.resources,
  });

  factory IamConfiguredResourcesResponseModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final rawData = json['data'];
    List<dynamic> list = const [];
    int? businessId;
    if (rawData is List) {
      list = rawData;
    } else if (rawData is Map<String, dynamic>) {
      businessId = (rawData['id'] as num?)?.toInt();
      final nested = rawData['resources'];
      if (nested is List) {
        list = nested;
      }
    }

    return IamConfiguredResourcesResponseModel(
      success: json['success'] as bool? ?? false,
      resources: list
          .whereType<Map<String, dynamic>>()
          .map(
            (item) => IamConfiguredResourceModel.fromJson(
              item,
              businessId: businessId,
            ),
          )
          .toList(),
    );
  }
}

class IamConfiguredResourceModel {
  final int id;
  final int resourceId;
  final int businessId;
  final String name;
  final String? code;
  final String? description;
  final bool isActive;

  IamConfiguredResourceModel({
    required this.id,
    required this.resourceId,
    required this.businessId,
    required this.name,
    required this.code,
    required this.description,
    required this.isActive,
  });

  factory IamConfiguredResourceModel.fromJson(
    Map<String, dynamic> json, {
    int? businessId,
  }) {
    final resolvedId = (json['resource_id'] as num?)?.toInt() ??
        (json['id'] as num?)?.toInt() ??
        0;
    return IamConfiguredResourceModel(
      id: resolvedId,
      resourceId: resolvedId,
      businessId: (json['business_id'] as num?)?.toInt() ?? businessId ?? 0,
      name: json['resource_name'] as String? ?? json['name'] as String? ?? '',
      code: json['resource_code'] as String? ?? json['code'] as String?,
      description: json['description'] as String?,
      isActive: json['is_active'] as bool? ?? false,
    );
  }
}
