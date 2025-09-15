import '../entities/create_user_result.dart';
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
}
