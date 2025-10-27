DateTime? _tryParseDate(String? value) {
  if (value == null || value.isEmpty) return null;
  return DateTime.tryParse(value);
}

class UsersResponseModel {
  final bool success;
  final List<UserModel> data;
  final int count;

  UsersResponseModel({
    required this.success,
    required this.data,
    required this.count,
  });

  factory UsersResponseModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'];
    return UsersResponseModel(
      success: json['success'] as bool? ?? false,
      data: data is List
          ? data
              .whereType<Map<String, dynamic>>()
              .map(UserModel.fromJson)
              .toList()
          : const [],
      count: json['count'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'success': success,
        'data': data.map((e) => e.toJson()).toList(),
        'count': count,
      };
}

class UserModel {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String avatarUrl;
  final bool isActive;
  final DateTime? lastLoginAt;
  final List<RoleModel> roles;
  final List<BusinessModel> businesses;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.avatarUrl,
    required this.isActive,
    required this.lastLoginAt,
    required this.roles,
    required this.businesses,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: json['id'] as int,
        name: json['name'] as String? ?? '',
        email: json['email'] as String? ?? '',
        phone: json['phone'] as String? ?? '',
        avatarUrl: json['avatar_url'] as String? ?? '',
        isActive: json['is_active'] as bool? ?? false,
        lastLoginAt: _tryParseDate(json['last_login_at'] as String?),
        roles: (json['roles'] as List<dynamic>? ?? [])
            .whereType<Map<String, dynamic>>()
            .map(RoleModel.fromJson)
            .toList(),
        businesses: (json['businesses'] as List<dynamic>? ?? [])
            .whereType<Map<String, dynamic>>()
            .map(BusinessModel.fromJson)
            .toList(),
        createdAt: _tryParseDate(json['created_at'] as String?),
        updatedAt: _tryParseDate(json['updated_at'] as String?),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'phone': phone,
        'avatar_url': avatarUrl,
        'is_active': isActive,
        'last_login_at': lastLoginAt?.toIso8601String(),
        'roles': roles.map((e) => e.toJson()).toList(),
        'businesses': businesses.map((e) => e.toJson()).toList(),
        'created_at': createdAt?.toIso8601String(),
        'updated_at': updatedAt?.toIso8601String(),
      };
}

class RoleModel {
  final int id;
  final String name;
  final String? code;
  final String? description;
  final int? level;
  final bool? isSystem;
  final int? scopeId;
  final String? scopeName;
  final String? scopeCode;

  RoleModel({
    required this.id,
    required this.name,
    required this.code,
    required this.description,
    required this.level,
    required this.isSystem,
    required this.scopeId,
    required this.scopeName,
    required this.scopeCode,
  });

  factory RoleModel.fromJson(Map<String, dynamic> json) => RoleModel(
        id: json['id'] as int,
        name: json['name'] as String? ?? '',
        code: json['code'] as String?,
        description: json['description'] as String?,
        level: json['level'] as int?,
        isSystem: json['is_system'] as bool?,
        scopeId: json['scope_id'] as int?,
        scopeName: json['scope_name'] as String?,
        scopeCode: json['scope_code'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        if (code != null) 'code': code,
        if (description != null) 'description': description,
        if (level != null) 'level': level,
        if (isSystem != null) 'is_system': isSystem,
        if (scopeId != null) 'scope_id': scopeId,
        if (scopeName != null) 'scope_name': scopeName,
        if (scopeCode != null) 'scope_code': scopeCode,
      };
}

class BusinessModel {
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

  BusinessModel({
    required this.id,
    required this.name,
    required this.code,
    required this.businessTypeId,
    required this.timezone,
    required this.address,
    required this.description,
    required this.logoUrl,
    required this.primaryColor,
    required this.secondaryColor,
    required this.tertiaryColor,
    required this.quaternaryColor,
    required this.navbarImageUrl,
    required this.customDomain,
    required this.isActive,
    required this.enableDelivery,
    required this.enablePickup,
    required this.enableReservations,
    required this.businessTypeName,
    required this.businessTypeCode,
  });

  factory BusinessModel.fromJson(Map<String, dynamic> json) => BusinessModel(
        id: json['id'] as int,
        name: json['name'] as String? ?? '',
        code: json['code'] as String? ?? '',
        businessTypeId: json['business_type_id'] as int?,
        timezone: json['timezone'] as String?,
        address: json['address'] as String?,
        description: json['description'] as String?,
        logoUrl: json['logo_url'] as String?,
        primaryColor: json['primary_color'] as String?,
        secondaryColor: json['secondary_color'] as String?,
        tertiaryColor: json['tertiary_color'] as String?,
        quaternaryColor: json['quaternary_color'] as String?,
        navbarImageUrl: json['navbar_image_url'] as String?,
        customDomain: json['custom_domain'] as String?,
        isActive: json['is_active'] as bool?,
        enableDelivery: json['enable_delivery'] as bool?,
        enablePickup: json['enable_pickup'] as bool?,
        enableReservations: json['enable_reservations'] as bool?,
        businessTypeName: json['business_type_name'] as String?,
        businessTypeCode: json['business_type_code'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'code': code,
        if (businessTypeId != null) 'business_type_id': businessTypeId,
        if (timezone != null) 'timezone': timezone,
        if (address != null) 'address': address,
        if (description != null) 'description': description,
        if (logoUrl != null) 'logo_url': logoUrl,
        if (primaryColor != null) 'primary_color': primaryColor,
        if (secondaryColor != null) 'secondary_color': secondaryColor,
        if (tertiaryColor != null) 'tertiary_color': tertiaryColor,
        if (quaternaryColor != null) 'quaternary_color': quaternaryColor,
        if (navbarImageUrl != null) 'navbar_image_url': navbarImageUrl,
        if (customDomain != null) 'custom_domain': customDomain,
        if (isActive != null) 'is_active': isActive,
        if (enableDelivery != null) 'enable_delivery': enableDelivery,
        if (enablePickup != null) 'enable_pickup': enablePickup,
        if (enableReservations != null)
          'enable_reservations': enableReservations,
        if (businessTypeName != null) 'business_type_name': businessTypeName,
        if (businessTypeCode != null) 'business_type_code': businessTypeCode,
      };
}
