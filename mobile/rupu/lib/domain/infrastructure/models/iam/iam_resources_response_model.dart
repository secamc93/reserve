DateTime? _parseDate(String? value) {
  if (value == null || value.isEmpty) return null;
  return DateTime.tryParse(value);
}

class IamResourcesResponseModel {
  final bool success;
  final List<IamResourceModel> resources;
  final int total;
  final int page;
  final int pageSize;
  final int totalPages;

  IamResourcesResponseModel({
    required this.success,
    required this.resources,
    required this.total,
    required this.page,
    required this.pageSize,
    required this.totalPages,
  });

  factory IamResourcesResponseModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'];
    final resourcesData =
        data is Map<String, dynamic> ? data['resources'] : json['resources'];
    final total = data is Map<String, dynamic>
        ? (data['total'] as num?)?.toInt()
        : (json['total'] as num?)?.toInt();
    final page = data is Map<String, dynamic>
        ? (data['page'] as num?)?.toInt()
        : (json['page'] as num?)?.toInt();
    final pageSize = data is Map<String, dynamic>
        ? (data['page_size'] as num?)?.toInt()
        : (json['page_size'] as num?)?.toInt();
    final totalPages = data is Map<String, dynamic>
        ? (data['total_pages'] as num?)?.toInt()
        : (json['total_pages'] as num?)?.toInt();

    final list = resourcesData is List
        ? resourcesData
            .whereType<Map<String, dynamic>>()
            .map(IamResourceModel.fromJson)
            .toList()
        : const <IamResourceModel>[];

    return IamResourcesResponseModel(
      success: json['success'] as bool? ?? false,
      resources: list,
      total: total ?? list.length,
      page: page ?? 1,
      pageSize: pageSize ?? list.length,
      totalPages: totalPages ?? 1,
    );
  }
}

class IamResourceModel {
  final int id;
  final String name;
  final String description;
  final int businessTypeId;
  final String businessTypeName;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  IamResourceModel({
    required this.id,
    required this.name,
    required this.description,
    required this.businessTypeId,
    required this.businessTypeName,
    required this.createdAt,
    required this.updatedAt,
  });

  factory IamResourceModel.fromJson(Map<String, dynamic> json) =>
      IamResourceModel(
        id: json['id'] as int,
        name: json['name'] as String? ?? '',
        description: json['description'] as String? ?? '',
        businessTypeId: (json['business_type_id'] as num?)?.toInt() ?? 0,
        businessTypeName: json['business_type_name'] as String? ?? '',
        createdAt: _parseDate(json['created_at'] as String?),
        updatedAt: _parseDate(json['updated_at'] as String?),
      );
}
