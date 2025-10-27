import '../infrastructure/models/create_user_response_model.dart';
import '../infrastructure/models/simple_response_model.dart';
import '../infrastructure/models/user_detail_response_model.dart';
import '../infrastructure/models/users_response_model.dart';

abstract class UserManagementDatasource {
  Future<UsersResponseModel> getUsers({Map<String, dynamic>? query});
  Future<CreateUserResponseModel> createUser({
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

  Future<UserDetailResponseModel> getUserDetail({required int id});

  Future<UserDetailResponseModel> updateUser({
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

  Future<SimpleResponseModel> deleteUser({required int id});
}
