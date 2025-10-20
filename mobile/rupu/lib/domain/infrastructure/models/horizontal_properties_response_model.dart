DateTime? _parseDate(String? value) {
  if (value == null || value.isEmpty) return null;
  return DateTime.tryParse(value);
}

class HorizontalPropertiesResponseModel {
  final bool success;
  final String? message;
  final HorizontalPropertiesPageModel? data;

  HorizontalPropertiesResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory HorizontalPropertiesResponseModel.fromJson(Map<String, dynamic> json) {
    final dataJson = json['data'];
    return HorizontalPropertiesResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String?,
      data: dataJson is Map<String, dynamic>
          ? HorizontalPropertiesPageModel.fromJson(dataJson)
          : null,
    );
  }
}

class HorizontalPropertiesPageModel {
  final List<HorizontalPropertyModel> data;
  final int total;
  final int page;
  final int pageSize;
  final int totalPages;

  HorizontalPropertiesPageModel({
    required this.data,
    required this.total,
    required this.page,
    required this.pageSize,
    required this.totalPages,
  });

  factory HorizontalPropertiesPageModel.fromJson(Map<String, dynamic> json) {
    final dataList = json['data'];
    return HorizontalPropertiesPageModel(
      data: dataList is List
          ? dataList
              .whereType<Map<String, dynamic>>()
              .map(HorizontalPropertyModel.fromJson)
              .toList()
          : const [],
      total: json['total'] as int? ?? 0,
      page: json['page'] as int? ?? 1,
      pageSize: json['page_size'] as int? ?? 0,
      totalPages: json['total_pages'] as int? ?? 0,
    );
  }
}

class HorizontalPropertyModel {
  final int id;
  final String name;
  final String code;
  final String businessTypeName;
  final String? address;
  final int totalUnits;
  final bool isActive;
  final DateTime? createdAt;

  HorizontalPropertyModel({
    required this.id,
    required this.name,
    required this.code,
    required this.businessTypeName,
    required this.address,
    required this.totalUnits,
    required this.isActive,
    required this.createdAt,
  });

  factory HorizontalPropertyModel.fromJson(Map<String, dynamic> json) {
    return HorizontalPropertyModel(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      code: json['code'] as String? ?? '',
      businessTypeName: json['business_type_name'] as String? ?? '',
      address: json['address'] as String?,
      totalUnits: json['total_units'] is int
          ? json['total_units'] as int
          : int.tryParse('${json['total_units']}') ?? 0,
      isActive: json['is_active'] as bool? ?? false,
      createdAt: _parseDate(json['created_at'] as String?),
    );
  }
}
