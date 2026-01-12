import 'package:dio/dio.dart';

/// Utilidad centralizada para transformar errores técnicos en mensajes
/// amigables y legibles para los usuarios.
class ErrorMessageHelper {
  /// Convierte cualquier error en un mensaje amigable para el usuario.
  ///
  /// [error] puede ser un DioException, Exception, o cualquier objeto.
  /// [fallbackMessage] es el mensaje a mostrar si no se puede determinar uno mejor.
  static String getUserFriendlyMessage(
    dynamic error, {
    String? fallbackMessage,
  }) {
    final defaultFallback =
        fallbackMessage ?? 'Ocurrió un error inesperado. Intenta nuevamente.';

    if (error is DioException) {
      return _handleDioException(error, defaultFallback);
    }

    if (error is FormatException) {
      return 'Se recibió una respuesta inesperada del servidor.';
    }

    if (error is TypeError) {
      return 'Error al procesar la información recibida.';
    }

    // Para otros errores, intentamos extraer un mensaje legible
    final errorString = error.toString();
    if (_containsTechnicalDetails(errorString)) {
      return defaultFallback;
    }

    // Si el mensaje parece legible (es corto y sin caracteres técnicos)
    if (errorString.length < 100 && !_containsTechnicalDetails(errorString)) {
      return errorString;
    }

    return defaultFallback;
  }

  /// Maneja errores específicos de Dio.
  static String _handleDioException(DioException error, String fallback) {
    // Primero intentamos extraer un mensaje del servidor
    final serverMessage = extractServerMessage(error.response?.data);
    if (serverMessage != null && serverMessage.isNotEmpty) {
      return serverMessage;
    }

    // Si hay código de estado HTTP, usamos un mensaje apropiado
    final statusCode = error.response?.statusCode;
    if (statusCode != null) {
      return getHttpErrorMessage(statusCode);
    }

    // Manejamos tipos específicos de error de Dio
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        return 'La conexión tardó demasiado. Verifica tu internet e intenta nuevamente.';
      case DioExceptionType.sendTimeout:
        return 'No se pudo enviar la solicitud. Verifica tu conexión a internet.';
      case DioExceptionType.receiveTimeout:
        return 'El servidor tardó demasiado en responder. Intenta nuevamente.';
      case DioExceptionType.connectionError:
        return 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      case DioExceptionType.badCertificate:
        return 'Error de seguridad en la conexión. Contacta a soporte.';
      case DioExceptionType.badResponse:
        // Ya manejamos el statusCode arriba, esto es un fallback
        return fallback;
      case DioExceptionType.cancel:
        return 'La operación fue cancelada.';
      case DioExceptionType.unknown:
        // Verificamos si es un error de conexión
        final message = error.message?.toLowerCase() ?? '';
        if (message.contains('socket') ||
            message.contains('network') ||
            message.contains('connection')) {
          return 'No hay conexión a internet. Verifica tu conexión e intenta nuevamente.';
        }
        return fallback;
    }
  }

  /// Devuelve un mensaje legible para un código de estado HTTP.
  static String getHttpErrorMessage(int statusCode) {
    switch (statusCode) {
      // Errores del cliente (4xx)
      case 400:
        return 'La solicitud contiene datos incorrectos. Verifica la información e intenta nuevamente.';
      case 401:
        return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      case 403:
        return 'No tienes permiso para realizar esta acción.';
      case 404:
        return 'No se encontró el recurso solicitado.';
      case 409:
        return 'La información ya existe o hay un conflicto. Verifica los datos.';
      case 422:
        return 'Los datos proporcionados no son válidos. Verifica la información.';
      case 429:
        return 'Has realizado demasiadas solicitudes. Espera un momento e intenta nuevamente.';

      // Errores del servidor (5xx)
      case 500:
        return 'Error en el servidor. Por favor, intenta más tarde.';
      case 502:
        return 'El servidor no está disponible temporalmente. Intenta más tarde.';
      case 503:
        return 'El servicio no está disponible en este momento. Intenta más tarde.';
      case 504:
        return 'El servidor tardó demasiado en responder. Intenta nuevamente.';

      default:
        if (statusCode >= 400 && statusCode < 500) {
          return 'Error en la solicitud. Por favor, verifica la información e intenta nuevamente.';
        }
        if (statusCode >= 500) {
          return 'Error en el servidor. Por favor, intenta más tarde.';
        }
        return 'Error de comunicación con el servidor.';
    }
  }

  /// Intenta extraer un mensaje de error de la respuesta del servidor.
  ///
  /// Busca campos comunes como 'message', 'error', 'msg', 'detail' en la respuesta.
  /// Devuelve null si no encuentra un mensaje legible.
  static String? extractServerMessage(dynamic responseData) {
    if (responseData == null) return null;

    if (responseData is String) {
      // Detectar respuestas HTML de servidores web (nginx, Apache, etc.)
      // Estas no son legibles para el usuario
      if (_isHtmlErrorPage(responseData)) {
        return null;
      }

      // Si es un string simple y parece legible
      if (responseData.isNotEmpty &&
          responseData.length < 200 &&
          !_containsTechnicalDetails(responseData)) {
        return responseData;
      }
      return null;
    }

    if (responseData is Map<String, dynamic>) {
      // Campos comunes donde los servidores ponen mensajes de error
      final messageFields = [
        'message',
        'error',
        'msg',
        'detail',
        'details',
        'errorMessage',
        'error_message',
        'description',
        'reason',
        'mensaje',
      ];

      for (final field in messageFields) {
        final value = responseData[field];
        if (value is String && value.isNotEmpty) {
          // Filtramos mensajes que parecen técnicos
          if (!_containsTechnicalDetails(value)) {
            return value;
          }
        }
        // A veces el error viene como un objeto con su propio 'message'
        if (value is Map<String, dynamic>) {
          final nestedMessage = value['message'] ?? value['msg'];
          if (nestedMessage is String && nestedMessage.isNotEmpty) {
            if (!_containsTechnicalDetails(nestedMessage)) {
              return nestedMessage;
            }
          }
        }
      }

      // Buscar en 'errors' si es un array de validaciones
      final errors = responseData['errors'];
      if (errors is List && errors.isNotEmpty) {
        final firstError = errors.first;
        if (firstError is String && !_containsTechnicalDetails(firstError)) {
          return firstError;
        }
        if (firstError is Map<String, dynamic>) {
          final msg = firstError['message'] ?? firstError['msg'];
          if (msg is String && !_containsTechnicalDetails(msg)) {
            return msg;
          }
        }
      }
    }

    return null;
  }

  /// Verifica si un string contiene detalles técnicos que no deberían
  /// mostrarse al usuario.
  static bool _containsTechnicalDetails(String text) {
    final technicalPatterns = [
      'stacktrace',
      'stack trace',
      'exception',
      'error at line',
      'at function',
      'null pointer',
      'undefined',
      'typeerror',
      'syntaxerror',
      'cannot read property',
      'is not defined',
      'file://',
      'http://',
      'https://',
      '::',
      'errno',
      'syscall',
      'econnrefused',
      'etimedout',
      'connection refused',
      'socket exception',
      'dioexception',
      'Expected',
      'Unexpected',
      RegExp(r'\d+\.\d+\.\d+\.\d+').hasMatch(text) ? 'ip_address' : '',
    ];

    final lowerText = text.toLowerCase();
    for (final pattern in technicalPatterns) {
      if (pattern.isNotEmpty && lowerText.contains(pattern.toLowerCase())) {
        return true;
      }
    }

    // También verificamos si tiene formato de stack trace (líneas con números)
    if (RegExp(r'#\d+.*at.*\(').hasMatch(text)) {
      return true;
    }

    return false;
  }

  /// Detecta si la respuesta es una página de error HTML de un servidor web
  /// (nginx, Apache, IIS, CloudFlare, etc.)
  ///
  /// Estas páginas contienen HTML que no es legible para el usuario.
  static bool _isHtmlErrorPage(String response) {
    final lowerResponse = response.toLowerCase();

    // Detectar etiquetas HTML comunes
    if (lowerResponse.contains('<!doctype html') ||
        lowerResponse.contains('<html') ||
        lowerResponse.contains('<head') ||
        lowerResponse.contains('<body')) {
      return true;
    }

    // Detectar servidores web comunes en mensajes de error
    final webServerPatterns = [
      'nginx',
      'apache',
      'microsoft-iis',
      'cloudflare',
      'cloudfront',
      'varnish',
      'squid',
      'litespeed',
      'openresty',
      '<title>502',
      '<title>503',
      '<title>504',
      '<title>500',
      '<title>404',
      '<title>403',
      '<title>error',
      'bad gateway',
      'service unavailable',
      'gateway timeout',
      'internal server error',
      'server error',
      'upstream',
      'proxy error',
    ];

    for (final pattern in webServerPatterns) {
      if (lowerResponse.contains(pattern)) {
        return true;
      }
    }

    // Si la respuesta es muy larga y contiene tags HTML, probablemente es HTML
    if (response.length > 200 &&
        (lowerResponse.contains('<div') ||
            lowerResponse.contains('<p>') ||
            lowerResponse.contains('<center>') ||
            lowerResponse.contains('<hr'))) {
      return true;
    }

    return false;
  }
}
