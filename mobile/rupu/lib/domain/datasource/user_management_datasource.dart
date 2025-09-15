import '../infrastructure/models/create_user_response_model.dart';
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
}
