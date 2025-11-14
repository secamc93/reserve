import 'package:rupu/domain/entities/role.dart';
import 'package:rupu/domain/entities/permission.dart';

class RoleActionResult {
  final bool success;
  final String message;
  final Role? role;

  const RoleActionResult({
    required this.success,
    required this.message,
    this.role,
  });
}

class PermissionActionResult {
  final bool success;
  final String message;
  final Permission? permission;

  const PermissionActionResult({
    required this.success,
    required this.message,
    this.permission,
  });
}
