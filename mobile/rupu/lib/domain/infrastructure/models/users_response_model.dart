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
    return UsersResponseModel(
      success: json['success'] as bool,
      data: (json['data'] as List<dynamic>)
          .map((e) => UserModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      count: json['count'] as int,
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

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.avatarUrl,
    required this.isActive,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: json['id'] as int,
        name: json['name'] as String,
        email: json['email'] as String,
        phone: json['phone'] as String? ?? '',
        avatarUrl: json['avatar_url'] as String? ?? '',
        isActive: json['is_active'] as bool? ?? false,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'phone': phone,
        'avatar_url': avatarUrl,
        'is_active': isActive,
      };
}
