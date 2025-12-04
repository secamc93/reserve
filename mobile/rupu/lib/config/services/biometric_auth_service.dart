import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';
import 'package:rupu/config/constants/secure_storage/token_storage.dart';

/// Tipos de error biométrico
enum BiometricErrorType {
  notAvailable,
  notEnrolled,
  lockedOut,
  passcodeNotSet,
  unknown,
}

/// Excepción personalizada para errores de autenticación biométrica
class BiometricException implements Exception {
  final String message;
  final BiometricErrorType type;

  BiometricException(this.message, this.type);

  @override
  String toString() => message;
}

/// Servicio para manejar autenticación biométrica (Face ID, Touch ID, Fingerprint)
class BiometricAuthService {
  final LocalAuthentication _localAuth = LocalAuthentication();
  final TokenStorage _storage = TokenStorage();

  static const String _emailKey = 'biometric_email';
  static const String _passwordKey = 'biometric_password';

  /// Verifica si el dispositivo tiene capacidades biométricas disponibles
  Future<bool> isBiometricAvailable() async {
    try {
      final bool canAuthenticateWithBiometrics =
          await _localAuth.canCheckBiometrics;
      final bool canAuthenticate =
          canAuthenticateWithBiometrics || await _localAuth.isDeviceSupported();
      return canAuthenticate;
    } catch (e) {
      print('Error verificando disponibilidad biométrica: $e');
      return false;
    }
  }

  /// Verifica si hay biometría enrollada (configurada) en el dispositivo
  Future<bool> isBiometricEnrolled() async {
    try {
      final List<BiometricType> availableBiometrics = await _localAuth
          .getAvailableBiometrics();
      final isEnrolled = availableBiometrics.isNotEmpty;
      print('Biometría enrollada: $isEnrolled - Tipos: $availableBiometrics');
      return isEnrolled;
    } catch (e) {
      print('Error verificando biometría enrollada: $e');
      return false;
    }
  }

  /// Obtiene el tipo de biometría disponible en el dispositivo
  Future<BiometricType?> getBiometricType() async {
    try {
      final List<BiometricType> availableBiometrics = await _localAuth
          .getAvailableBiometrics();

      if (availableBiometrics.isEmpty) return null;

      // Priorizar Face ID/Face Recognition
      if (availableBiometrics.contains(BiometricType.face)) {
        return BiometricType.face;
      }
      // Luego Touch ID/Fingerprint
      if (availableBiometrics.contains(BiometricType.fingerprint)) {
        return BiometricType.fingerprint;
      }
      // Iris scan como última opción
      if (availableBiometrics.contains(BiometricType.iris)) {
        return BiometricType.iris;
      }

      return availableBiometrics.first;
    } catch (e) {
      return null;
    }
  }

  /// Solicita autenticación biométrica al usuario
  /// Retorna true si la autenticación fue exitosa
  /// Lanza excepciones específicas según el tipo de error
  Future<bool> authenticate() async {
    try {
      print('🔐 Iniciando autenticación biométrica...');

      // 1. Verificar si la biometría está disponible
      final isAvailable = await isBiometricAvailable();
      print('   Disponibilidad: $isAvailable');

      if (!isAvailable) {
        throw BiometricException(
          'La autenticación biométrica no está disponible en este dispositivo.',
          BiometricErrorType.notAvailable,
        );
      }

      // 2. Verificar si hay biometría enrollada
      final isEnrolled = await isBiometricEnrolled();
      print('   Enrollada: $isEnrolled');

      if (!isEnrolled) {
        throw BiometricException(
          'No hay datos biométricos registrados en este dispositivo. Por favor, configura tu huella digital o Face ID en los ajustes del sistema.',
          BiometricErrorType.notEnrolled,
        );
      }

      // 3. Obtener tipo y preparar mensaje
      final biometricType = await getBiometricType();
      print('   Tipo detectado: $biometricType');

      String localizedReason = 'Autentícate para iniciar sesión';

      if (biometricType == BiometricType.face) {
        localizedReason = 'Escanea tu rostro para iniciar sesión';
      } else if (biometricType == BiometricType.fingerprint) {
        localizedReason = 'Escanea tu huella digital para iniciar sesión';
      }

      // 4. Solicitar autenticación
      print('   Solicitando autenticación al usuario...');
      final bool didAuthenticate = await _localAuth.authenticate(
        localizedReason: localizedReason,
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: true,
        ),
      );

      print(
        '   Resultado: ${didAuthenticate ? "✅ Éxito" : "❌ Fallida/Cancelada"}',
      );
      return didAuthenticate;
    } on PlatformException catch (e) {
      // Manejo específico de errores de permisos y disponibilidad
      print('❌ Error en autenticación biométrica [${e.code}]: ${e.message}');
      print('   Detalles: ${e.details}');

      switch (e.code) {
        case 'NotAvailable':
        case 'NotEnrolled':
          throw BiometricException(
            'No hay datos biométricos registrados en este dispositivo. Por favor, configura tu huella digital o Face ID en los ajustes del sistema.',
            BiometricErrorType.notEnrolled,
          );
        case 'LockedOut':
        case 'PermanentlyLockedOut':
          throw BiometricException(
            'La autenticación biométrica está bloqueada debido a múltiples intentos fallidos. Por favor, intenta más tarde o usa tu contraseña.',
            BiometricErrorType.lockedOut,
          );
        case 'PasscodeNotSet':
          throw BiometricException(
            'No hay código de acceso configurado en el dispositivo. Por favor, configura un código de acceso en los ajustes del sistema.',
            BiometricErrorType.passcodeNotSet,
          );
        default:
          // Usuario canceló o error genérico
          print('   Usuario canceló o error genérico');
          return false;
      }
    } catch (e) {
      if (e is BiometricException) {
        rethrow;
      }
      print('❌ Error inesperado: $e');
      throw BiometricException(
        'Error inesperado durante la autenticación biométrica.',
        BiometricErrorType.unknown,
      );
    }
  }

  /// Guarda las credenciales del usuario de forma segura
  Future<void> saveCredentials({
    required String email,
    required String password,
  }) async {
    await _storage.storage.write(key: _emailKey, value: email);
    await _storage.storage.write(key: _passwordKey, value: password);
  }

  /// Verifica si hay credenciales guardadas
  Future<bool> hasStoredCredentials() async {
    final email = await _storage.storage.read(key: _emailKey);
    final password = await _storage.storage.read(key: _passwordKey);
    return email != null &&
        password != null &&
        email.isNotEmpty &&
        password.isNotEmpty;
  }

  /// Obtiene las credenciales guardadas después de autenticación exitosa
  /// Retorna un mapa con 'email' y 'password', o null si no hay credenciales
  Future<Map<String, String>?> getStoredCredentials() async {
    final email = await _storage.storage.read(key: _emailKey);
    final password = await _storage.storage.read(key: _passwordKey);

    if (email == null ||
        password == null ||
        email.isEmpty ||
        password.isEmpty) {
      return null;
    }

    return {'email': email, 'password': password};
  }

  /// Elimina las credenciales almacenadas
  Future<void> clearStoredCredentials() async {
    await _storage.storage.delete(key: _emailKey);
    await _storage.storage.delete(key: _passwordKey);
  }

  /// Obtiene una descripción amigable del tipo de biometría disponible
  Future<String> getBiometricDescription() async {
    final biometricType = await getBiometricType();

    switch (biometricType) {
      case BiometricType.face:
        return 'Face ID';
      case BiometricType.fingerprint:
        return 'Huella Digital';
      case BiometricType.iris:
        return 'Reconocimiento de Iris';
      default:
        return 'Biometría';
    }
  }
}
