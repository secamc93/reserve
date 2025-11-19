class IamConfiguredResourcesResponseModel {
  final bool success;
  final List<IamConfiguredResourceModel> data;

  IamConfiguredResourcesResponseModel({
    required this.success,
    required this.data,
  });

  factory IamConfiguredResourcesResponseModel.fromJson(
      Map<String, dynamic> json) {
    final list = json['data'];
    return IamConfiguredResourcesResponseModel(
      success: json['success'] as bool? ?? false,
      data: list is List
          ? list
              .whereType<Map<String, dynamic>>()
              .map(IamConfiguredResourceModel.fromJson)
              .toList()
          : const [],
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

  factory IamConfiguredResourceModel.fromJson(Map<String, dynamic> json) {
    return IamConfiguredResourceModel(
      id: (json['id'] as num?)?.toInt() ??
          (json['resource_id'] as num?)?.toInt() ??
          0,
      resourceId: (json['resource_id'] as num?)?.toInt() ??
          (json['id'] as num?)?.toInt() ??
          0,
      businessId: (json['business_id'] as num?)?.toInt() ?? 0,
      name: json['resource_name'] as String? ?? json['name'] as String? ?? '',
      code: json['resource_code'] as String? ?? json['code'] as String?,
      description: json['description'] as String?,
      isActive: json['is_active'] as bool? ?? false,
    );
  }
}
