import 'package:dio/dio.dart';
import 'package:rupu/config/dio/authenticated_dio.dart';
import '../../datasource/user_management_datasource.dart';
import '../models/users_response_model.dart';

class UsersManagementDatasourceImpl extends UserManagementDatasource {
  final Dio _dio;

  UsersManagementDatasourceImpl({String? baseUrl})
    : _dio = AuthenticatedDio(
        baseUrl: baseUrl ?? 'https://www.xn--rup-joa.com/api/v1',
      ).dio;

  @override
  Future<UsersResponseModel> getUsers({Map<String, dynamic>? query}) async {
    final response = await _dio.get('/users', queryParameters: query);
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
  }) async {
    final formData = FormData.fromMap({
      'name': name,
      'email': email,
      // if (phone != null)
      'phone': phone ?? "",
      'is_active': isActive,
      // if (roleIds != null)
      'role_ids': roleIds ?? "",
      // if (businessIds != null)
      'business_ids': businessIds ?? "",
      // if (avatarUrl != null)
      'avatar_url': avatarUrl ?? "",
      if (avatarPath != null)
        'avatarFile': await MultipartFile.fromFile(
          avatarPath,
          filename: avatarPath.split('/').last,
        ),
    });
    print("name $name");
    print("email $email");
    print("phone $phone");
    print("isActive $isActive");
    print("role $roleIds");
    print("businessId $businessIds");
    print("AvatarUrl $avatarUrl");
    print("AvatarPath $avatarPath");

    await _dio.post('/users', data: formData);
  }
}
