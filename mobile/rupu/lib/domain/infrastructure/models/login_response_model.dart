/// Modelo de datos para la respuesta de login.
class LoginResponseModel {
  final bool success;
  final LoginDataModel data;

  LoginResponseModel({
    required this.success,
    required this.data,
  });

  factory LoginResponseModel.fromJson(Map<String, dynamic> json) {
    return LoginResponseModel(
      success: json['success'] as bool,
      data: LoginDataModel.fromJson(json['data'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'data': data.toJson(),
    };
  }
}

/// Modelo de datos para el campo "data" de la respuesta de login.
class LoginDataModel {
  final UserModel user;
  final String token;
  final bool requirePasswordChange;

  LoginDataModel({
    required this.user,
    required this.token,
    required this.requirePasswordChange,
  });

  factory LoginDataModel.fromJson(Map<String, dynamic> json) {
    return LoginDataModel(
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
      token: json['token'] as String,
      requirePasswordChange: json['require_password_change'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': user.toJson(),
      'token': token,
      'require_password_change': requirePasswordChange,
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
  final DateTime lastLoginAt;

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
      lastLoginAt: DateTime.parse(json['last_login_at'] as String),
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
      'last_login_at': lastLoginAt.toIso8601String(),
    };
  }
}
