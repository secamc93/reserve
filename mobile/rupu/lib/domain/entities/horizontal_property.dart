class HorizontalProperty {
  final int id;
  final String name;
  final String code;
  final String businessTypeName;
  final String? address;
  final int totalUnits;
  final bool isActive;
  final DateTime? createdAt;

  const HorizontalProperty({
    required this.id,
    required this.name,
    required this.code,
    required this.businessTypeName,
    required this.address,
    required this.totalUnits,
    required this.isActive,
    required this.createdAt,
  });
}
