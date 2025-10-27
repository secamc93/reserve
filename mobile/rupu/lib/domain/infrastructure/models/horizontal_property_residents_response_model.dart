class HorizontalPropertyResidentsResponseModel {
  final bool success;
  final String message;
  final HorizontalPropertyResidentsDataModel data;

  HorizontalPropertyResidentsResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory HorizontalPropertyResidentsResponseModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return HorizontalPropertyResidentsResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: HorizontalPropertyResidentsDataModel.fromJson(
        json['data'] as Map<String, dynamic>? ?? const {},
      ),
    );
  }
}

class HorizontalPropertyResidentsDataModel {
  final List<HorizontalPropertyResidentItemModel> residents;
  final int total;
  final int page;
  final int pageSize;
  final int totalPages;

  HorizontalPropertyResidentsDataModel({
    required this.residents,
    required this.total,
    required this.page,
    required this.pageSize,
    required this.totalPages,
  });

  factory HorizontalPropertyResidentsDataModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final residents = json['residents'];
    return HorizontalPropertyResidentsDataModel(
      residents: residents is List
          ? residents
              .whereType<Map<String, dynamic>>()
              .map(HorizontalPropertyResidentItemModel.fromJson)
              .toList()
          : const [],
      total: json['total'] as int? ?? 0,
      page: json['page'] as int? ?? 1,
      pageSize: json['page_size'] as int? ?? 0,
      totalPages: json['total_pages'] as int? ?? 0,
    );
  }
}

class HorizontalPropertyResidentItemModel {
  final int id;
  final String propertyUnitNumber;
  final String residentTypeName;
  final String name;
  final String email;
  final String phone;
  final bool isMainResident;
  final bool isActive;

  HorizontalPropertyResidentItemModel({
    required this.id,
    required this.propertyUnitNumber,
    required this.residentTypeName,
    required this.name,
    required this.email,
    required this.phone,
    required this.isMainResident,
    required this.isActive,
  });

  factory HorizontalPropertyResidentItemModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return HorizontalPropertyResidentItemModel(
      id: json['id'] as int? ?? 0,
      propertyUnitNumber: json['property_unit_number'] as String? ?? '',
      residentTypeName: json['resident_type_name'] as String? ?? '',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      isMainResident: json['is_main_resident'] as bool? ?? false,
      isActive: json['is_active'] as bool? ?? false,
    );
  }
}
