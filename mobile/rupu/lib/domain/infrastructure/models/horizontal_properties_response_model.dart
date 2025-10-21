DateTime? _tryParseDate(String? value) {
  if (value == null || value.isEmpty) return null;
  return DateTime.tryParse(value);
}

class HorizontalPropertiesResponseModel {
  final bool success;
  final String message;
  final HorizontalPropertiesDataModel data;

  HorizontalPropertiesResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory HorizontalPropertiesResponseModel.fromJson(Map<String, dynamic> json) {
    final dataJson = json['data'] as Map<String, dynamic>? ?? const {};
    return HorizontalPropertiesResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: HorizontalPropertiesDataModel.fromJson(dataJson),
    );
  }
}

class HorizontalPropertiesDataModel {
  final List<HorizontalPropertyModel> data;
  final int total;
  final int page;
  final int pageSize;
  final int totalPages;

  HorizontalPropertiesDataModel({
    required this.data,
    required this.total,
    required this.page,
    required this.pageSize,
    required this.totalPages,
  });

  factory HorizontalPropertiesDataModel.fromJson(Map<String, dynamic> json) {
    final list = (json['data'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .map(HorizontalPropertyModel.fromJson)
        .toList();
    return HorizontalPropertiesDataModel(
      data: list,
      total: json['total'] as int? ?? 0,
      page: json['page'] as int? ?? 1,
      pageSize: json['page_size'] as int? ?? list.length,
      totalPages: json['total_pages'] as int? ?? 1,
    );
  }
}

class HorizontalPropertyModel {
  final int id;
  final String name;
  final String code;
  final String? businessTypeName;
  final int? businessId;
  final String? address;
  final int? totalUnits;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  HorizontalPropertyModel({
    required this.id,
    required this.name,
    required this.code,
    required this.businessTypeName,
    required this.businessId,
    required this.address,
    required this.totalUnits,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory HorizontalPropertyModel.fromJson(Map<String, dynamic> json) {
    return HorizontalPropertyModel(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      code: json['code'] as String? ?? '',
      businessTypeName: json['business_type_name'] as String?,
      businessId: json['business_id'] as int? ??
          json['parent_business_id'] as int?,
      address: json['address'] as String?,
      totalUnits: json['total_units'] as int?,
      isActive: json['is_active'] as bool? ?? false,
      createdAt: _tryParseDate(json['created_at'] as String?),
      updatedAt: _tryParseDate(json['updated_at'] as String?),
    );
  }
}
