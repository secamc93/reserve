class HorizontalPropertyDetail {
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
  final List<HorizontalPropertyCommittee> committees;
  final List<HorizontalPropertyUnit> propertyUnits;

  const HorizontalPropertyDetail({
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
}

class HorizontalPropertyCommittee {
  final int id;
  final String? name;
  final String? typeName;
  final String? typeCode;
  final int? committeeTypeId;
  final bool? isActive;
  final DateTime? startDate;
  final DateTime? endDate;
  final String? notes;

  const HorizontalPropertyCommittee({
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
}

class HorizontalPropertyUnit {
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

  const HorizontalPropertyUnit({
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
}
