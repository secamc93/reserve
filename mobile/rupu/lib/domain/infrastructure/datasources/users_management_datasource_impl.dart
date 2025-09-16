// domain/infrastructure/datasources/users_management_datasource_impl.dart
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';
import 'package:mime/mime.dart'; // <- agrega este paquete
import 'package:path/path.dart' as p; // <- agrega este paquete
import 'package:rupu/config/dio/authenticated_dio.dart';
// si usas el helper opcional de más abajo:
import 'package:image/image.dart' as img;
import 'package:rupu/domain/datasource/user_management_datasource.dart';
import 'package:rupu/domain/infrastructure/models/create_user_response_model.dart';
import 'package:rupu/domain/infrastructure/models/users_response_model.dart'; // <- agrega este paquete si usas la conversión a jpg

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
  Future<CreateUserResponseModel> createUser({
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
    // Construye el mapa base
    final map = <String, dynamic>{
      'name': name,
      'email': email,
      if (phone != null) 'phone': phone,
      'is_active': isActive,
      if (roleIds != null) 'role_ids': roleIds,
      if (businessIds != null) 'business_ids': businessIds,
      if (avatarUrl != null) 'avatar_url': avatarUrl,
    };

    // Adjunta archivo si viene
    if (avatarPath != null && avatarPath.isNotEmpty) {
      // 1) Garantiza que el archivo sea de un tipo permitido
      final ensured = await _ensureAllowedImage(avatarPath, avatarFileName);

      // 2) Detecta MIME real por bytes (más confiable que solo la extensión)
      final bytes = await File(ensured.path).readAsBytes();
      final mime = lookupMimeType(ensured.path, headerBytes: bytes) ?? 'image/jpeg';
      final mediaType = MediaType.parse(mime);

      final file = await MultipartFile.fromFile(
        ensured.path,
        filename: ensured.fileName,
        contentType: mediaType,
      );

      map['avatarFile'] = file; // ⚠️ Asegúrate que la clave sea exactamente la que espera tu API
    }

    final formData = FormData.fromMap(map);

    // Consejo: deja que Dio ponga el boundary. No fuerces el header Content-Type.
    final response = await _dio.post(
      '/users',
      data: formData,
      // options: Options(contentType: 'multipart/form-data'), // <- Puedes omitirlo
    );

    return CreateUserResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  /// Asegura que el archivo sea .jpg/.jpeg/.png/.gif/.webp.
  /// Si la extensión no es permitida (p.ej. .heic/.bmp), lo re-encodea a JPEG.
  Future<_EnsuredImage> _ensureAllowedImage(String path, String? preferredName) async {
    final allowed = <String>{'.jpg', '.jpeg', '.png', '.gif', '.webp'};
    final ext = p.extension(path).toLowerCase();

    if (allowed.contains(ext)) {
      // Normaliza el nombre final (si viene vacío, usa el basename del path)
      final fileName = (preferredName?.isNotEmpty ?? false)
          ? preferredName!
          : p.basename(path);
      return _EnsuredImage(path: path, fileName: fileName);
    }

    // Si no es permitido (ej. .heic, .bmp, .jfif), convertimos a JPEG
    final bytes = await File(path).readAsBytes();
    final decoded = img.decodeImage(bytes);
    if (decoded == null) {
      throw Exception('No se pudo decodificar la imagen seleccionada.');
    }
    final jpgBytes = img.encodeJpg(decoded, quality: 90);

    final tmpDir = Directory.systemTemp.path;
    final newName = (preferredName?.isNotEmpty ?? false)
        ? p.setExtension(preferredName!, '.jpg')
        : 'avatar_${DateTime.now().millisecondsSinceEpoch}.jpg';
    final newPath = p.join(tmpDir, newName);

    final out = File(newPath);
    await out.writeAsBytes(jpgBytes, flush: true);

    return _EnsuredImage(path: newPath, fileName: p.basename(newPath));
  }
}

class _EnsuredImage {
  final String path;
  final String fileName;
  _EnsuredImage({required this.path, required this.fileName});
}
