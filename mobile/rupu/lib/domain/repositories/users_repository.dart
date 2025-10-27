import '../entities/create_user_result.dart';
import '../entities/user_action_result.dart';
import '../entities/user_detail.dart';
import '../entities/users_page.dart';

abstract class UsersRepository {
  Future<UsersPage> getUsers({Map<String, dynamic>? query});
  Future<CreateUserResult> createUser({
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

  Future<UserDetail?> getUserDetail({required int id});

  Future<UserActionResult> updateUser({
    required int id,
    String? name,
    String? email,
    String? password,
    String? phone,
    bool? isActive,
    List<int>? roleIds,
    List<int>? businessIds,
    String? avatarUrl,
    String? avatarPath,
    String? avatarFileName,
  });

  Future<UserActionResult> deleteUser({required int id});
}
