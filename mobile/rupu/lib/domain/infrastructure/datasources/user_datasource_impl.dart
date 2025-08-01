import 'package:dio/dio.dart';
import 'package:rupu/domain/datasource/users_datasource.dart';
import 'package:rupu/domain/infrastructure/models/login_response_model.dart';

class UserDatasource extends UsersDatasource {
  final dio = Dio(
    BaseOptions(baseUrl: 'https://www.xn--rup-joa.com/api/v1/auth'),
  );

  @override
  Future getUser({String? email, String? password}) async {
    final response = await dio.post(
      '/login',
      data: {'email': email, 'password': password},
    );

    return LoginResponseModel.fromJson(response.data as Map<String, dynamic>);
  }
}
