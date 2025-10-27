class CreateUserResult {
  final bool success;
  final String email;
  final String? password;
  final String? message;

  const CreateUserResult({
    required this.success,
    required this.email,
    this.password,
    this.message,
  });
}
