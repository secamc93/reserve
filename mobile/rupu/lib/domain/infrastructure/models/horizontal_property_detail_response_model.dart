DateTime? _tryParseDate(String? value) {
  if (value == null || value.isEmpty) return null;
  return DateTime.tryParse(value);
}

double? _tryParseDouble(dynamic value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  return double.tryParse(value.toString());
}

int? _tryParseInt(dynamic value) {
  if (value == null) return null;
  if (value is int) return value;
  if (value is double) return value.round();
  return int.tryParse(value.toString());
}

bool? _tryParseBool(dynamic value) {
  if (value == null) return null;
  if (value is bool) return value;
  if (value is num) return value != 0;
  final normalized = value.toString().trim().toLowerCase();
  if (normalized.isEmpty) return null;
  if (normalized == 'true' || normalized == '1' || normalized == 'yes') {
    return true;
  }
  if (normalized == 'false' || normalized == '0' || normalized == 'no') {
    return false;
  }
  return null;
}

class HorizontalPropertyDetailResponseModel {
  final bool success;
  final String message;
  final HorizontalPropertyDetailModel? data;

  HorizontalPropertyDetailResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory HorizontalPropertyDetailResponseModel.fromJson(
      Map<String, dynamic> json) {
    final rawData = json['data'];
    final dataJson = rawData is Map<String, dynamic> ? rawData : null;
    return HorizontalPropertyDetailResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: dataJson == null
          ? null
          : HorizontalPropertyDetailModel.fromJson(dataJson),
    );
  }
}

class HorizontalPropertyDetailModel {
  final int id;
  final String name;
  final String? code;
  final String? description;
  final String? address;
  final String? timezone;
  final int? businessTypeId;
  final String? businessTypeName;
  final int? parentBusinessId;
  final bool? isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final int? totalUnits;
  final int? totalFloors;
  final bool? hasElevator;
  final bool? hasParking;
  final bool? hasPool;
  final bool? hasGym;
  final bool? hasSocialArea;
  final String? logoUrl;
  final String? navbarImageUrl;
  final String? customDomain;
  final String? primaryColor;
  final String? secondaryColor;
  final String? tertiaryColor;
  final String? quaternaryColor;
  final List<HorizontalPropertyCommitteeModel> committees;
  final List<HorizontalPropertyUnitModel> propertyUnits;

  HorizontalPropertyDetailModel({
    required this.id,
    required this.name,
    this.code,
    this.description,
    this.address,
    this.timezone,
    this.businessTypeId,
    this.businessTypeName,
    this.parentBusinessId,
    this.isActive,
    this.createdAt,
    this.updatedAt,
    this.totalUnits,
    this.totalFloors,
    this.hasElevator,
    this.hasParking,
    this.hasPool,
    this.hasGym,
    this.hasSocialArea,
    this.logoUrl,
    this.navbarImageUrl,
    this.customDomain,
    this.primaryColor,
    this.secondaryColor,
    this.tertiaryColor,
    this.quaternaryColor,
    this.committees = const [],
    this.propertyUnits = const [],
  });

  factory HorizontalPropertyDetailModel.fromJson(Map<String, dynamic> json) {
    return HorizontalPropertyDetailModel(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      code: json['code'] as String?,
      description: json['description'] as String?,
      address: json['address'] as String?,
      timezone: json['timezone'] as String?,
      businessTypeId: _tryParseInt(json['business_type_id']),
      businessTypeName: json['business_type_name'] as String?,
      parentBusinessId: _tryParseInt(json['parent_business_id']),
      isActive: _tryParseBool(json['is_active']),
      createdAt: _tryParseDate(json['created_at'] as String?),
      updatedAt: _tryParseDate(json['updated_at'] as String?),
      totalUnits: _tryParseInt(json['total_units']),
      totalFloors: _tryParseInt(json['total_floors']),
      hasElevator: _tryParseBool(json['has_elevator']),
      hasParking: _tryParseBool(json['has_parking']),
      hasPool: _tryParseBool(json['has_pool']),
      hasGym: _tryParseBool(json['has_gym']),
      hasSocialArea: _tryParseBool(json['has_social_area']),
      logoUrl: json['logo_url'] as String?,
      navbarImageUrl: json['navbar_image_url'] as String?,
      customDomain: json['custom_domain'] as String?,
      primaryColor: json['primary_color'] as String?,
      secondaryColor: json['secondary_color'] as String?,
      tertiaryColor: json['tertiary_color'] as String?,
      quaternaryColor: json['quaternary_color'] as String?,
      committees: (json['committees'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(HorizontalPropertyCommitteeModel.fromJson)
          .toList(),
      propertyUnits: (json['property_units'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(HorizontalPropertyUnitModel.fromJson)
          .toList(),
    );
  }
}

class HorizontalPropertyCommitteeModel {
  final int id;
  final String? name;
  final String? typeName;
  final String? typeCode;
  final int? committeeTypeId;
  final bool? isActive;
  final DateTime? startDate;
  final DateTime? endDate;
  final String? notes;

  HorizontalPropertyCommitteeModel({
    required this.id,
    this.name,
    this.typeName,
    this.typeCode,
    this.committeeTypeId,
    this.isActive,
    this.startDate,
    this.endDate,
    this.notes,
  });

  factory HorizontalPropertyCommitteeModel.fromJson(
      Map<String, dynamic> json) {
    return HorizontalPropertyCommitteeModel(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String?,
      typeName: json['type_name'] as String?,
      typeCode: json['type_code'] as String?,
      committeeTypeId: json['committee_type_id'] as int?,
      isActive: json['is_active'] as bool?,
      startDate: _tryParseDate(json['start_date'] as String?),
      endDate: _tryParseDate(json['end_date'] as String?),
      notes: json['notes'] as String?,
    );
  }
}

class HorizontalPropertyUnitModel {
  final int id;
  final String? number;
  final String? block;
  final int? floor;
  final double? area;
  final int? bedrooms;
  final int? bathrooms;
  final String? description;
  final String? unitType;
  final bool? isActive;

  HorizontalPropertyUnitModel({
    required this.id,
    this.number,
    this.block,
    this.floor,
    this.area,
    this.bedrooms,
    this.bathrooms,
    this.description,
    this.unitType,
    this.isActive,
  });

  factory HorizontalPropertyUnitModel.fromJson(Map<String, dynamic> json) {
    return HorizontalPropertyUnitModel(
      id: json['id'] as int? ?? 0,
      number: json['number'] as String?,
      block: json['block'] as String?,
      floor: _tryParseInt(json['floor']),
      area: _tryParseDouble(json['area']),
      bedrooms: _tryParseInt(json['bedrooms']),
      bathrooms: _tryParseInt(json['bathrooms']),
      description: json['description'] as String?,
      unitType: json['unit_type'] as String?,
      isActive: _tryParseBool(json['is_active']),
    );
  }
}
