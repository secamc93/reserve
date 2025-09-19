import '../../datasource/user_management_datasource.dart';
import '../../entities/create_user_result.dart';
import '../../entities/user_action_result.dart';
import '../../entities/user_detail.dart';
import '../../entities/users_page.dart';
import '../../repositories/users_repository.dart';
import '../mappers/users_mapper.dart';

class UsersRepositoryImpl extends UsersRepository {
  final UserManagementDatasource datasource;
  UsersRepositoryImpl(this.datasource);

  @override
  Future<UsersPage> getUsers({Map<String, dynamic>? query}) async {
    final res = await datasource.getUsers(query: query);
    return UsersMapper.responseToEntity(res);
  }

  @override
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
  }) async {
    final response = await datasource.createUser(
      name: name,
      email: email,
      phone: phone,
      isActive: isActive,
      roleIds: roleIds,
      businessIds: businessIds,
      avatarUrl: avatarUrl,
      avatarPath: avatarPath,
      avatarFileName: avatarFileName,
    );
    return UsersMapper.createUserToEntity(response);
  }

  @override
  Future<UserDetail?> getUserDetail({required int id}) async {
    final response = await datasource.getUserDetail(id: id);
    if (!response.success || response.data == null) return null;
    return UsersMapper.userModelToDetail(response.data!);
  }

  @override
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
  }) async {
    final response = await datasource.updateUser(
      id: id,
      name: name,
      email: email,
      password: password,
      phone: phone,
      isActive: isActive,
      roleIds: roleIds,
      businessIds: businessIds,
      avatarUrl: avatarUrl,
      avatarPath: avatarPath,
      avatarFileName: avatarFileName,
    );

    final detail =
        response.data != null ? UsersMapper.userModelToDetail(response.data!) : null;

    return UserActionResult(
      success: response.success,
      message: response.message,
      user: detail,
    );
  }

  @override
  Future<UserActionResult> deleteUser({required int id}) async {
    final response = await datasource.deleteUser(id: id);
    return UserActionResult(
      success: response.success,
      message: response.message,
    );
  }
}
