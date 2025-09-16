import 'package:dio/dio.dart';
import '../../datasource/user_management_datasource.dart';
import '../models/create_user_response_model.dart';
import '../models/users_response_model.dart';

class UsersManagementDatasourceImpl extends UserManagementDatasource {
  final dio = Dio(BaseOptions(baseUrl: 'https://www.xn--rup-joa.com/api/v1'));

  @override
  Future<UsersResponseModel> getUsers({Map<String, dynamic>? query}) async {
    final response = await dio.get('/users', queryParameters: query);
    return UsersResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
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
  }) async {
    final formData = FormData.fromMap({
      'name': name,
      'email': email,
      if (phone != null) 'phone': phone,
      'is_active': isActive,
      if (roleIds != null) 'role_ids': roleIds,
      if (businessIds != null) 'business_ids': businessIds,
      if (avatarUrl != null) 'avatar_url': avatarUrl,
      if (avatarPath != null)
        'avatarFile': await MultipartFile.fromFile(
          avatarPath,
          filename: avatarFileName ?? avatarPath.split('/').last,
        ),
    });
    final response = await dio.post(
      '/users',
      data: formData,
      options: Options(
        headers: const <String, dynamic>{
          'Content-Type': 'multipart/form-data',
        },
      ),
    );
    return CreateUserResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }
}
