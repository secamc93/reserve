class LoginResponseModel {
  final bool success;
  final LoginDataModel data;

  LoginResponseModel({required this.success, required this.data});

  factory LoginResponseModel.fromJson(Map<String, dynamic> json) {
    return LoginResponseModel(
      success: json['success'] as bool,
      data: LoginDataModel.fromJson(json['data'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {'success': success, 'data': data.toJson()};
  }
}

/// Modelo de datos para el campo "data" de la respuesta de login.
class LoginDataModel {
  final UserModel user;
  final String token;
  final bool requirePasswordChange;
  final List<BusinessModel> businesses; // ← nuevo campo

  LoginDataModel({
    required this.user,
    required this.token,
    required this.requirePasswordChange,
    required this.businesses,
  });

  factory LoginDataModel.fromJson(Map<String, dynamic> json) {
    return LoginDataModel(
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
      token: json['token'] as String,
      requirePasswordChange: json['require_password_change'] as bool,
      businesses: (json['businesses'] as List<dynamic>)
          .map((b) => BusinessModel.fromJson(b as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': user.toJson(),
      'token': token,
      'require_password_change': requirePasswordChange,
      'businesses': businesses.map((b) => b.toJson()).toList(),
    };
  }
}

/// Modelo de datos para mapear JSON del usuario.
class UserModel {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String avatarUrl;
  final bool isActive;
  final String lastLoginAt;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.avatarUrl,
    required this.isActive,
    required this.lastLoginAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as int,
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String,
      avatarUrl: json['avatar_url'] as String,
      isActive: json['is_active'] as bool,
      lastLoginAt: json['last_login_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'avatar_url': avatarUrl,
      'is_active': isActive,
      'last_login_at': lastLoginAt,
    };
  }
}

/// Modelo de datos para el tipo de negocio.
class BusinessTypeModel {
  final int id;
  final String name;
  final String code;
  final String description;
  final String icon;

  BusinessTypeModel({
    required this.id,
    required this.name,
    required this.code,
    required this.description,
    required this.icon,
  });

  factory BusinessTypeModel.fromJson(Map<String, dynamic> json) {
    return BusinessTypeModel(
      id: json['id'] as int,
      name: json['name'] as String,
      code: json['code'] as String,
      description: json['description'] as String,
      icon: json['icon'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code,
      'description': description,
      'icon': icon,
    };
  }
}

/// Modelo de datos para mapear JSON de cada negocio.
class BusinessModel {
  final int id;
  final String name;
  final String code;
  final int businessTypeId;
  final BusinessTypeModel businessType;
  final String timezone;
  final String address;
  final String description;
  final String logoUrl;
  final String primaryColor;
  final String secondaryColor;
  final String customDomain;
  final bool isActive;
  final bool enableDelivery;
  final bool enablePickup;
  final bool enableReservations;

  BusinessModel({
    required this.id,
    required this.name,
    required this.code,
    required this.businessTypeId,
    required this.businessType,
    required this.timezone,
    required this.address,
    required this.description,
    required this.logoUrl,
    required this.primaryColor,
    required this.secondaryColor,
    required this.customDomain,
    required this.isActive,
    required this.enableDelivery,
    required this.enablePickup,
    required this.enableReservations,
  });

  factory BusinessModel.fromJson(Map<String, dynamic> json) {
    return BusinessModel(
      id: json['id'] as int,
      name: json['name'] as String,
      code: json['code'] as String,
      businessTypeId: json['business_type_id'] as int,
      businessType: BusinessTypeModel.fromJson(
        json['business_type'] as Map<String, dynamic>,
      ),
      timezone: json['timezone'] as String,
      address: json['address'] as String,
      description: json['description'] as String,
      logoUrl: json['logo_url'] as String,
      primaryColor: json['primary_color'] as String,
      secondaryColor: json['secondary_color'] as String,
      customDomain: json['custom_domain'] as String,
      isActive: json['is_active'] as bool,
      enableDelivery: json['enable_delivery'] as bool,
      enablePickup: json['enable_pickup'] as bool,
      enableReservations: json['enable_reservations'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code,
      'business_type_id': businessTypeId,
      'business_type': businessType.toJson(),
      'timezone': timezone,
      'address': address,
      'description': description,
      'logo_url': logoUrl,
      'primary_color': primaryColor,
      'secondary_color': secondaryColor,
      'custom_domain': customDomain,
      'is_active': isActive,
      'enable_delivery': enableDelivery,
      'enable_pickup': enablePickup,
      'enable_reservations': enableReservations,
    };
  }
}
