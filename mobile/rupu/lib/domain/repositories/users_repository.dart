import '../entities/user_list_item.dart';

abstract class UsersRepository {
  Future<List<UserListItem>> getUsers({Map<String, dynamic>? query});
  Future<void> createUser({
    required String name,
    required String email,
    String? phone,
    bool isActive = true,
    List<int>? roleIds,
    List<int>? businessIds,
    String? avatarUrl,
    String? avatarPath,
    String? avatarFileName,
  });
}
