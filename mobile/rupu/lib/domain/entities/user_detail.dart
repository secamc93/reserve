import 'user_list_item.dart';

class UserDetail extends UserListItem {
  const UserDetail({
    required super.id,
    required super.name,
    required super.email,
    required super.phone,
    required super.avatarUrl,
    required super.isActive,
    super.lastLoginAt,
    super.createdAt,
    super.updatedAt,
    super.roles = const [],
    super.businesses = const [],
  });
}
