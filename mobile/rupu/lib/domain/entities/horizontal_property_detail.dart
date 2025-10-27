const _unset = Object();

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

  HorizontalPropertyDetail copyWith({
    Object? id = _unset,
    Object? name = _unset,
    Object? code = _unset,
    Object? description = _unset,
    Object? address = _unset,
    Object? timezone = _unset,
    Object? businessTypeId = _unset,
    Object? businessTypeName = _unset,
    Object? parentBusinessId = _unset,
    Object? isActive = _unset,
    Object? createdAt = _unset,
    Object? updatedAt = _unset,
    Object? totalUnits = _unset,
    Object? totalFloors = _unset,
    Object? hasElevator = _unset,
    Object? hasParking = _unset,
    Object? hasPool = _unset,
    Object? hasGym = _unset,
    Object? hasSocialArea = _unset,
    Object? logoUrl = _unset,
    Object? navbarImageUrl = _unset,
    Object? customDomain = _unset,
    Object? primaryColor = _unset,
    Object? secondaryColor = _unset,
    Object? tertiaryColor = _unset,
    Object? quaternaryColor = _unset,
    Object? committees = _unset,
    Object? propertyUnits = _unset,
  }) {
    return HorizontalPropertyDetail(
      id: identical(id, _unset) ? this.id : id as int,
      name: identical(name, _unset) ? this.name : name as String,
      code: identical(code, _unset) ? this.code : code as String?,
      description: identical(description, _unset)
          ? this.description
          : description as String?,
      address:
          identical(address, _unset) ? this.address : address as String?,
      timezone:
          identical(timezone, _unset) ? this.timezone : timezone as String?,
      businessTypeId: identical(businessTypeId, _unset)
          ? this.businessTypeId
          : businessTypeId as int?,
      businessTypeName: identical(businessTypeName, _unset)
          ? this.businessTypeName
          : businessTypeName as String?,
      parentBusinessId: identical(parentBusinessId, _unset)
          ? this.parentBusinessId
          : parentBusinessId as int?,
      isActive: identical(isActive, _unset) ? this.isActive : isActive as bool?,
      createdAt: identical(createdAt, _unset)
          ? this.createdAt
          : createdAt as DateTime?,
      updatedAt: identical(updatedAt, _unset)
          ? this.updatedAt
          : updatedAt as DateTime?,
      totalUnits: identical(totalUnits, _unset)
          ? this.totalUnits
          : totalUnits as int?,
      totalFloors: identical(totalFloors, _unset)
          ? this.totalFloors
          : totalFloors as int?,
      hasElevator: identical(hasElevator, _unset)
          ? this.hasElevator
          : hasElevator as bool?,
      hasParking: identical(hasParking, _unset)
          ? this.hasParking
          : hasParking as bool?,
      hasPool: identical(hasPool, _unset) ? this.hasPool : hasPool as bool?,
      hasGym: identical(hasGym, _unset) ? this.hasGym : hasGym as bool?,
      hasSocialArea: identical(hasSocialArea, _unset)
          ? this.hasSocialArea
          : hasSocialArea as bool?,
      logoUrl:
          identical(logoUrl, _unset) ? this.logoUrl : logoUrl as String?,
      navbarImageUrl: identical(navbarImageUrl, _unset)
          ? this.navbarImageUrl
          : navbarImageUrl as String?,
      customDomain: identical(customDomain, _unset)
          ? this.customDomain
          : customDomain as String?,
      primaryColor: identical(primaryColor, _unset)
          ? this.primaryColor
          : primaryColor as String?,
      secondaryColor: identical(secondaryColor, _unset)
          ? this.secondaryColor
          : secondaryColor as String?,
      tertiaryColor: identical(tertiaryColor, _unset)
          ? this.tertiaryColor
          : tertiaryColor as String?,
      quaternaryColor: identical(quaternaryColor, _unset)
          ? this.quaternaryColor
          : quaternaryColor as String?,
      committees: identical(committees, _unset)
          ? this.committees
          : committees as List<HorizontalPropertyCommittee>,
      propertyUnits: identical(propertyUnits, _unset)
          ? this.propertyUnits
          : propertyUnits as List<HorizontalPropertyUnit>,
    );
  }
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
