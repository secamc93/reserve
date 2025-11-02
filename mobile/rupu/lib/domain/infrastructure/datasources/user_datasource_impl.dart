import 'package:dio/dio.dart';
import 'package:rupu/domain/datasource/users_datasource.dart';
import 'package:rupu/domain/infrastructure/models/login_response_model.dart';

class UserDatasource extends UsersDatasource {
  final dio = Dio(
    BaseOptions(baseUrl: 'https://www.xn--rup-joa.com/api/v1/auth'),
  );

  @override
  Future<LoginResponseModel> getUser({
    required String email,
    required String password,
  }) async {
    final response = await dio.post(
      '/login',
      data: {'email': email, 'password': password},
    );

    return LoginResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<String> getBusinessToken({
    required String token,
    required int businessId,
  }) async {
    final response = await dio.post(
      '/business-token',
      data: {'business_id': businessId},
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );

    final data = response.data;
    if (data is Map<String, dynamic>) {
      final directToken = data['token'];
      if (directToken is String && directToken.isNotEmpty) {
        return directToken;
      }

      final nested = data['data'];
      if (nested is Map<String, dynamic>) {
        final nestedToken = nested['token'];
        if (nestedToken is String && nestedToken.isNotEmpty) {
          return nestedToken;
        }
      }
    }

    throw Exception('Token de negocio no encontrado en la respuesta.');
  }
}
