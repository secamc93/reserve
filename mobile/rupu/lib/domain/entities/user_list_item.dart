class UserListItem {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String avatarUrl;
  final bool isActive;
  final DateTime? lastLoginAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final List<UserRoleSummary> roles;
  final List<UserBusinessSummary> businesses;

  const UserListItem({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.avatarUrl,
    required this.isActive,
    this.lastLoginAt,
    this.createdAt,
    this.updatedAt,
    this.roles = const [],
    this.businesses = const [],
  });
}

class UserRoleSummary {
  final int id;
  final String name;
  final String? code;
  final String? description;
  final int? level;
  final bool? isSystem;
  final int? scopeId;
  final String? scopeName;
  final String? scopeCode;

  const UserRoleSummary({
    required this.id,
    required this.name,
    this.code,
    this.description,
    this.level,
    this.isSystem,
    this.scopeId,
    this.scopeName,
    this.scopeCode,
  });
}

class UserBusinessSummary {
  final int id;
  final String name;
  final String code;
  final int? businessTypeId;
  final String? timezone;
  final String? address;
  final String? description;
  final String? logoUrl;
  final String? primaryColor;
  final String? secondaryColor;
  final String? tertiaryColor;
  final String? quaternaryColor;
  final String? navbarImageUrl;
  final String? customDomain;
  final bool? isActive;
  final bool? enableDelivery;
  final bool? enablePickup;
  final bool? enableReservations;
  final String? businessTypeName;
  final String? businessTypeCode;

  const UserBusinessSummary({
    required this.id,
    required this.name,
    required this.code,
    this.businessTypeId,
    this.timezone,
    this.address,
    this.description,
    this.logoUrl,
    this.primaryColor,
    this.secondaryColor,
    this.tertiaryColor,
    this.quaternaryColor,
    this.navbarImageUrl,
    this.customDomain,
    this.isActive,
    this.enableDelivery,
    this.enablePickup,
    this.enableReservations,
    this.businessTypeName,
    this.businessTypeCode,
  });
}
