DateTime? _parseDate(String? value) {
  if (value == null || value.isEmpty) return null;
  return DateTime.tryParse(value);
}

class IamBusinessesResponseModel {
  final bool success;
  final List<IamBusinessModel> data;
  final IamPaginationModel pagination;

  IamBusinessesResponseModel({
    required this.success,
    required this.data,
    required this.pagination,
  });

  factory IamBusinessesResponseModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'];
    final pagination = json['pagination'] as Map<String, dynamic>? ?? const {};
    return IamBusinessesResponseModel(
      success: json['success'] as bool? ?? false,
      data: data is List
          ? data
              .whereType<Map<String, dynamic>>()
              .map(IamBusinessModel.fromJson)
              .toList()
          : const [],
      pagination: IamPaginationModel.fromJson(pagination),
    );
  }
}

class IamBusinessModel {
  final int id;
  final String name;
  final String code;
  final String description;
  final String address;
  final String phone;
  final String email;
  final String website;
  final String logoUrl;
  final String primaryColor;
  final String secondaryColor;
  final String tertiaryColor;
  final String quaternaryColor;
  final String navbarImageUrl;
  final bool isActive;
  final int businessTypeId;
  final String businessType;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  IamBusinessModel({
    required this.id,
    required this.name,
    required this.code,
    required this.description,
    required this.address,
    required this.phone,
    required this.email,
    required this.website,
    required this.logoUrl,
    required this.primaryColor,
    required this.secondaryColor,
    required this.tertiaryColor,
    required this.quaternaryColor,
    required this.navbarImageUrl,
    required this.isActive,
    required this.businessTypeId,
    required this.businessType,
    required this.createdAt,
    required this.updatedAt,
  });

  factory IamBusinessModel.fromJson(Map<String, dynamic> json) =>
      IamBusinessModel(
        id: json['id'] as int,
        name: json['name'] as String? ?? '',
        code: json['code'] as String? ?? '',
        description: json['description'] as String? ?? '',
        address: json['address'] as String? ?? '',
        phone: json['phone'] as String? ?? '',
        email: json['email'] as String? ?? '',
        website: json['website'] as String? ?? '',
        logoUrl: json['logo_url'] as String? ?? '',
        primaryColor: json['primary_color'] as String? ?? '',
        secondaryColor: json['secondary_color'] as String? ?? '',
        tertiaryColor: json['tertiary_color'] as String? ?? '',
        quaternaryColor: json['quaternary_color'] as String? ?? '',
        navbarImageUrl: json['navbar_image_url'] as String? ?? '',
        isActive: json['is_active'] as bool? ?? false,
        businessTypeId: (json['business_type_id'] as num?)?.toInt() ?? 0,
        businessType: json['business_type'] as String? ?? '',
        createdAt: _parseDate(json['created_at'] as String?),
        updatedAt: _parseDate(json['updated_at'] as String?),
      );
}

class IamPaginationModel {
  final int currentPage;
  final int perPage;
  final int total;
  final int lastPage;
  final bool hasNext;
  final bool hasPrev;

  IamPaginationModel({
    required this.currentPage,
    required this.perPage,
    required this.total,
    required this.lastPage,
    required this.hasNext,
    required this.hasPrev,
  });

  factory IamPaginationModel.fromJson(Map<String, dynamic> json) =>
      IamPaginationModel(
        currentPage: (json['current_page'] as num?)?.toInt() ?? 1,
        perPage: (json['per_page'] as num?)?.toInt() ?? 10,
        total: (json['total'] as num?)?.toInt() ?? 0,
        lastPage: (json['last_page'] as num?)?.toInt() ?? 1,
        hasNext: json['has_next'] as bool? ?? false,
        hasPrev: json['has_prev'] as bool? ?? false,
      );
}
