import '../../datasource/user_management_datasource.dart';
import '../../entities/user_list_item.dart';
import '../../repositories/users_repository.dart';
import '../mappers/users_mapper.dart';

class UsersRepositoryImpl extends UsersRepository {
  final UserManagementDatasource datasource;
  UsersRepositoryImpl(this.datasource);

  @override
  Future<List<UserListItem>> getUsers({Map<String, dynamic>? query}) async {
    final res = await datasource.getUsers(query: query);
    return res.data.map(UsersMapper.userModelToEntity).toList();
  }

  @override
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
  }) {
    return datasource.createUser(
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
  }
}
