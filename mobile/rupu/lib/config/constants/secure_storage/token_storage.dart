import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  // Crea la instancia (usa el llavero de iOS y Keystore de Android)
  final _storage = const FlutterSecureStorage();

  static const _key = 'ACCESS_TOKEN';

  Future<void> saveToken(String token) async {
    await _storage.write(key: _key, value: token);
  }

  Future<String?> readToken() async {
    return await _storage.read(key: _key);
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: _key);
  }
}