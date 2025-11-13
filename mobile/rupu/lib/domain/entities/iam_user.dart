import 'iam_pagination.dart';

class IamUser {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String avatarUrl;
  final bool isActive;
  final bool isSuperUser;
  final DateTime? lastLoginAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final List<IamBusinessRoleAssignment> assignments;

  const IamUser({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.avatarUrl,
    required this.isActive,
    required this.isSuperUser,
    this.lastLoginAt,
    this.createdAt,
    this.updatedAt,
    this.assignments = const [],
  });
}

class IamBusinessRoleAssignment {
  final int businessId;
  final String? businessName;
  final int roleId;
  final String? roleName;

  const IamBusinessRoleAssignment({
    required this.businessId,
    required this.roleId,
    this.businessName,
    this.roleName,
  });
}

class IamUsersPage {
  final bool success;
  final List<IamUser> users;
  final IamPagination pagination;

  const IamUsersPage({
    required this.success,
    required this.users,
    required this.pagination,
  });
}
