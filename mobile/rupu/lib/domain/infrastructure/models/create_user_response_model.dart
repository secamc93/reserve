class CreateUserResponseModel {
  final bool success;
  final String email;
  final String? password;
  final String? message;

  CreateUserResponseModel({
    required this.success,
    required this.email,
    this.password,
    this.message,
  });

  factory CreateUserResponseModel.fromJson(Map<String, dynamic> json) {
    return CreateUserResponseModel(
      success: json['success'] as bool? ?? false,
      email: json['email'] as String? ?? '',
      password: json['password'] as String?,
      message: json['message'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'success': success,
        'email': email,
        if (password != null) 'password': password,
        if (message != null) 'message': message,
      };
}
