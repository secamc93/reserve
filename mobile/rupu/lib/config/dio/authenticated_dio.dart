import 'package:dio/dio.dart';
import 'package:rupu/config/constants/secure_storage/token_storage.dart';

class AuthenticatedDio {
  final Dio dio;
  final TokenStorage _tokenStorage = TokenStorage();

  AuthenticatedDio({String? baseUrl})
    : dio = Dio(BaseOptions(baseUrl: baseUrl ?? '')) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStorage.readToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    );
  }
}
