class IamGeneratePasswordResult {
  final bool success;
  final String email;
  final String password;
  final String message;

  const IamGeneratePasswordResult({
    required this.success,
    required this.email,
    required this.password,
    required this.message,
  });

  factory IamGeneratePasswordResult.fromJson(Map<String, dynamic> json) {
    return IamGeneratePasswordResult(
      success: json['success'] as bool? ?? false,
      email: json['email'] as String? ?? '',
      password: json['password'] as String? ?? '',
      message: json['message'] as String? ?? '',
    );
  }
}
