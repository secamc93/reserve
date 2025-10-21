class HorizontalProperty {
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

  const HorizontalProperty({
    required this.id,
    required this.name,
    required this.code,
    this.businessTypeName,
    this.businessId,
    this.address,
    this.totalUnits,
    required this.isActive,
    this.createdAt,
    this.updatedAt,
  });
}
