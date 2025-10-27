import 'user_detail.dart';

class UserActionResult {
  final bool success;
  final String? message;
  final UserDetail? user;

  const UserActionResult({
    required this.success,
    this.message,
    this.user,
  });
}
