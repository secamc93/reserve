DateTime? _parseDate(String? value) {
  if (value == null || value.isEmpty) return null;
  return DateTime.tryParse(value);
}

class IamUsersResponseModel {
  final bool success;
  final List<IamUserModel> data;
  final IamPaginationModel pagination;

  IamUsersResponseModel({
    required this.success,
    required this.data,
    required this.pagination,
  });

  factory IamUsersResponseModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'];
    final pagination = json['pagination'] as Map<String, dynamic>? ?? const {};
    return IamUsersResponseModel(
      success: json['success'] as bool? ?? false,
      data: data is List
          ? data
                .whereType<Map<String, dynamic>>()
                .map(IamUserModel.fromJson)
                .toList()
          : const [],
      pagination: IamPaginationModel.fromJson(pagination),
    );
  }
}

class IamUserModel {
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
  final List<IamAssignmentModel> assignments;

  IamUserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.avatarUrl,
    required this.isActive,
    required this.isSuperUser,
    required this.lastLoginAt,
    required this.createdAt,
    required this.updatedAt,
    required this.assignments,
  });

  factory IamUserModel.fromJson(Map<String, dynamic> json) => IamUserModel(
    id: json['id'] as int,
    name: json['name'] as String? ?? '',
    email: json['email'] as String? ?? '',
    phone: json['phone'] as String? ?? '',
    avatarUrl: json['avatar_url'] as String? ?? '',
    isActive: json['is_active'] as bool? ?? false,
    isSuperUser: json['is_super_user'] as bool? ?? false,
    lastLoginAt: _parseDate(json['last_login_at'] as String?),
    createdAt: _parseDate(json['created_at'] as String?),
    updatedAt: _parseDate(json['updated_at'] as String?),
    assignments: (json['business_role_assignments'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .map(IamAssignmentModel.fromJson)
        .toList(),
  );
}

class IamAssignmentModel {
  final int businessId;
  final String? businessName;
  final int roleId;
  final String? roleName;
  final int? businessTypeId;

  IamAssignmentModel({
    required this.businessId,
    required this.businessName,
    required this.roleId,
    required this.roleName,
    this.businessTypeId,
  });

  factory IamAssignmentModel.fromJson(Map<String, dynamic> json) =>
      IamAssignmentModel(
        businessId: (json['business_id'] as num?)?.toInt() ?? 0,
        businessName: json['business_name'] as String?,
        roleId: (json['role_id'] as num?)?.toInt() ?? 0,
        roleName: json['role_name'] as String?,
        businessTypeId: (json['business_type_id'] as num?)?.toInt(),
      );
}

class IamPaginationModel {
  final int currentPage;
  final int perPage;
  final int total;
  final int lastPage;
  final bool hasNext;
  final bool hasPrev;

  IamPaginationModel({
    required this.currentPage,
    required this.perPage,
    required this.total,
    required this.lastPage,
    required this.hasNext,
    required this.hasPrev,
  });

  factory IamPaginationModel.fromJson(Map<String, dynamic> json) =>
      IamPaginationModel(
        currentPage: (json['current_page'] as num?)?.toInt() ?? 1,
        perPage: (json['per_page'] as num?)?.toInt() ?? 10,
        total: (json['total'] as num?)?.toInt() ?? 0,
        lastPage: (json['last_page'] as num?)?.toInt() ?? 1,
        hasNext: json['has_next'] as bool? ?? false,
        hasPrev: json['has_prev'] as bool? ?? false,
      );
}
