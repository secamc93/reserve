import 'package:dio/dio.dart';
import 'package:rupu/config/constants/secure_storage/token_storage.dart';

enum AuthTokenType { login, business }

class AuthenticatedDio {
  final Dio dio;
  final TokenStorage _tokenStorage = TokenStorage();
  final AuthTokenType tokenType;

  AuthenticatedDio({String? baseUrl, this.tokenType = AuthTokenType.business})
      : dio = Dio(BaseOptions(baseUrl: baseUrl ?? '')) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _readTokenForType();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    );
  }

  Future<String?> _readTokenForType() {
    switch (tokenType) {
      case AuthTokenType.login:
        return _tokenStorage.readLoginToken();
      case AuthTokenType.business:
        return _tokenStorage.readBusinessToken();
    }
  }
}
