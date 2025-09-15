import 'package:dio/dio.dart';
import '../../datasource/user_management_datasource.dart';
import '../models/users_response_model.dart';

class UsersManagementDatasourceImpl extends UserManagementDatasource {
  final dio = Dio(BaseOptions(baseUrl: 'https://www.xn--rup-joa.com/api/v1'));

  @override
  Future<UsersResponseModel> getUsers({Map<String, dynamic>? query}) async {
    final response = await dio.get('/users', queryParameters: query);
    return UsersResponseModel.fromJson(response.data as Map<String, dynamic>);
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
    await dio.post('/users', data: formData);
  }
}
