class HorizontalPropertyResidentDetailResponseModel {
  final bool success;
  final String message;
  final HorizontalPropertyResidentDetailModel? data;

  const HorizontalPropertyResidentDetailResponseModel({
    required this.success,
    required this.message,
    this.data,
  });

  factory HorizontalPropertyResidentDetailResponseModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return HorizontalPropertyResidentDetailResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: json['data'] is Map<String, dynamic>
          ? HorizontalPropertyResidentDetailModel.fromJson(
              json['data'] as Map<String, dynamic>,
            )
          : null,
    );
  }
}

class HorizontalPropertyResidentDetailModel {
  final int id;
  final int? propertyUnitId;
  final String? propertyUnitNumber;
  final int? residentTypeId;
  final String? residentTypeName;
  final String name;
  final String? email;
  final String? phone;
  final String? dni;
  final String? emergencyContact;
  final bool? isMainResident;
  final bool? isActive;
  final DateTime? leaseStartDate;
  final DateTime? leaseEndDate;
  final DateTime? moveInDate;
  final double? monthlyRent;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final Map<String, dynamic> extra;

  const HorizontalPropertyResidentDetailModel({
    required this.id,
    required this.name,
    this.propertyUnitId,
    this.propertyUnitNumber,
    this.residentTypeId,
    this.residentTypeName,
    this.email,
    this.phone,
    this.dni,
    this.emergencyContact,
    this.isMainResident,
    this.isActive,
    this.leaseStartDate,
    this.leaseEndDate,
    this.moveInDate,
    this.monthlyRent,
    this.createdAt,
    this.updatedAt,
    this.extra = const {},
  });

  factory HorizontalPropertyResidentDetailModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final Map<String, dynamic> working = Map<String, dynamic>.of(json);
    final extra = working['extra_attributes'];
    return HorizontalPropertyResidentDetailModel(
      id: working['id'] as int? ?? 0,
      propertyUnitId: working['property_unit_id'] as int?,
      propertyUnitNumber: working['property_unit_number'] as String?,
      residentTypeId: working['resident_type_id'] as int?,
      residentTypeName: working['resident_type_name'] as String?,
      name: working['name'] as String? ?? '',
      email: working['email'] as String?,
      phone: working['phone'] as String?,
      dni: working['dni'] as String?,
      emergencyContact: working['emergency_contact'] as String?,
      isMainResident: working['is_main_resident'] as bool?,
      isActive: working['is_active'] as bool?,
      leaseStartDate: _parseDate(working['lease_start_date']),
      leaseEndDate: _parseDate(working['lease_end_date']),
      moveInDate: _parseDate(working['move_in_date']),
      monthlyRent: (working['monthly_rent'] as num?)?.toDouble(),
      createdAt: _parseDate(working['created_at']),
      updatedAt: _parseDate(working['updated_at']),
      extra: extra is Map<String, dynamic> ? extra : const {},
    );
  }

  static DateTime? _parseDate(dynamic value) {
    if (value is String && value.isNotEmpty) {
      return DateTime.tryParse(value);
    }
    return null;
  }
}
