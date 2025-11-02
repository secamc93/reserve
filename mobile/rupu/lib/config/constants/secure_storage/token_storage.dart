import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  // Crea la instancia (usa el llavero de iOS y Keystore de Android)
  final _storage = const FlutterSecureStorage();

  static const _loginKey = 'ACCESS_TOKEN';
  static const _businessKey = 'BUSINESS_ACCESS_TOKEN';

  Future<void> saveLoginToken(String token) async {
    await _storage.write(key: _loginKey, value: token);
  }

  Future<void> saveBusinessToken(String token) async {
    await _storage.write(key: _businessKey, value: token);
  }

  Future<String?> readLoginToken() async {
    return _storage.read(key: _loginKey);
  }

  Future<String?> readBusinessToken() async {
    return _storage.read(key: _businessKey);
  }

  Future<void> deleteLoginToken() async {
    await _storage.delete(key: _loginKey);
  }

  Future<void> deleteBusinessToken() async {
    await _storage.delete(key: _businessKey);
  }

  Future<void> clearAllTokens() async {
    await Future.wait([
      _storage.delete(key: _loginKey),
      _storage.delete(key: _businessKey),
    ]);
  }
}
