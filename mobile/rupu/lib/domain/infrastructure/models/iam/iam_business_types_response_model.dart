DateTime? _parseDate(String? value) {
  if (value == null || value.isEmpty) return null;
  return DateTime.tryParse(value);
}

class IamBusinessTypesResponseModel {
  final bool success;
  final List<IamBusinessTypeModel> data;

  IamBusinessTypesResponseModel({
    required this.success,
    required this.data,
  });

  factory IamBusinessTypesResponseModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'];
    return IamBusinessTypesResponseModel(
      success: json['success'] as bool? ?? false,
      data: data is List
          ? data
              .whereType<Map<String, dynamic>>()
              .map(IamBusinessTypeModel.fromJson)
              .toList()
          : const [],
    );
  }
}

class IamBusinessTypeModel {
  final int id;
  final String name;
  final String code;
  final String description;
  final String icon;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  IamBusinessTypeModel({
    required this.id,
    required this.name,
    required this.code,
    required this.description,
    required this.icon,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory IamBusinessTypeModel.fromJson(Map<String, dynamic> json) =>
      IamBusinessTypeModel(
        id: json['id'] as int,
        name: json['name'] as String? ?? '',
        code: json['code'] as String? ?? '',
        description: json['description'] as String? ?? '',
        icon: json['icon'] as String? ?? '',
        isActive: json['is_active'] as bool? ?? false,
        createdAt: _parseDate(json['created_at'] as String?),
        updatedAt: _parseDate(json['updated_at'] as String?),
      );
}
