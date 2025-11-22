class HorizontalPropertyResidentDetailResult {
  final bool success;
  final String? message;
  final HorizontalPropertyResidentDetail? resident;

  const HorizontalPropertyResidentDetailResult({
    required this.success,
    this.message,
    this.resident,
  });
}

class HorizontalPropertyResidentDetail {
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

  const HorizontalPropertyResidentDetail({
    required this.id,
    this.propertyUnitId,
    this.propertyUnitNumber,
    this.residentTypeId,
    this.residentTypeName,
    required this.name,
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
}
