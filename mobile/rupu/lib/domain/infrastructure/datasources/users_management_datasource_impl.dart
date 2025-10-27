// domain/infrastructure/datasources/users_management_datasource_impl.dart
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';
import 'package:image/image.dart' as img;
import 'package:mime/mime.dart';
import 'package:path/path.dart' as p;
import 'package:rupu/config/dio/authenticated_dio.dart';
import 'package:rupu/domain/datasource/user_management_datasource.dart';
import 'package:rupu/domain/infrastructure/models/create_user_response_model.dart';
import 'package:rupu/domain/infrastructure/models/simple_response_model.dart';
import 'package:rupu/domain/infrastructure/models/user_detail_response_model.dart';
import 'package:rupu/domain/infrastructure/models/users_response_model.dart';

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
    final map = _buildBasePayload(
      name: name,
      email: email,
      phone: phone,
      isActive: isActive,
      roleIds: roleIds,
      businessIds: businessIds,
      avatarUrl: avatarUrl,
    );

    final formData = await _buildFormData(
      map: map,
      avatarPath: avatarPath,
      avatarFileName: avatarFileName,
    );

    final response = await _dio.post('/users', data: formData);
    return CreateUserResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<UserDetailResponseModel> getUserDetail({required int id}) async {
    final response = await _dio.get('/users/$id');
    return UserDetailResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<UserDetailResponseModel> updateUser({
    required int id,
    String? name,
    String? email,
    String? password,
    String? phone,
    bool? isActive,
    List<int>? roleIds,
    List<int>? businessIds,
    String? avatarUrl,
    String? avatarPath,
    String? avatarFileName,
  }) async {
    final map = _buildBasePayload(
      name: name,
      email: email,
      password: password,
      phone: phone,
      isActive: isActive,
      roleIds: roleIds,
      businessIds: businessIds,
      avatarUrl: avatarUrl,
      onlyDefined: true,
    );

    final formData = await _buildFormData(
      map: map,
      avatarPath: avatarPath,
      avatarFileName: avatarFileName,
    );

    final response = await _dio.put('/users/$id', data: formData);
    return UserDetailResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<SimpleResponseModel> deleteUser({required int id}) async {
    final response = await _dio.delete('/users/$id');
    return SimpleResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  Map<String, dynamic> _buildBasePayload({
    String? name,
    String? email,
    String? password,
    String? phone,
    bool? isActive,
    List<int>? roleIds,
    List<int>? businessIds,
    String? avatarUrl,
    bool onlyDefined = false,
  }) {
    final map = <String, dynamic>{};

    void assign(String key, dynamic value) {
      if (onlyDefined) {
        if (value != null) map[key] = value;
      } else {
        map[key] = value;
      }
    }

    if (!onlyDefined || name != null) assign('name', name);
    if (!onlyDefined || email != null) assign('email', email);
    if (password != null && password.isNotEmpty) assign('password', password);
    if (!onlyDefined || phone != null) assign('phone', phone);
    if (!onlyDefined || isActive != null) assign('is_active', isActive);

    final roleIdsValue = (roleIds == null || roleIds.isEmpty)
        ? null
        : roleIds.map((e) => e.toString()).join(',');
    final businessIdsValue = (businessIds == null || businessIds.isEmpty)
        ? null
        : businessIds.map((e) => e.toString()).join(',');

    if (!onlyDefined || roleIdsValue != null) {
      assign('role_ids', roleIdsValue);
    }
    if (!onlyDefined || businessIdsValue != null) {
      assign('business_ids', businessIdsValue);
    }
    final sanitizedAvatarUrl =
        (avatarUrl == null || avatarUrl.trim().isEmpty) ? null : avatarUrl;
    if (!onlyDefined || sanitizedAvatarUrl != null) {
      assign('avatar_url', sanitizedAvatarUrl);
    }

    return map;
  }

  Future<FormData> _buildFormData({
    required Map<String, dynamic> map,
    String? avatarPath,
    String? avatarFileName,
  }) async {
    if (avatarPath != null && avatarPath.isNotEmpty) {
      final ensured = await _ensureAllowedImage(avatarPath, avatarFileName);
      final bytes = await File(ensured.path).readAsBytes();
      final mime = lookupMimeType(ensured.path, headerBytes: bytes) ?? 'image/jpeg';
      final mediaType = MediaType.parse(mime);

      final file = await MultipartFile.fromFile(
        ensured.path,
        filename: ensured.fileName,
        contentType: mediaType,
      );

      map['avatarFile'] = file;
    }

    map.removeWhere((key, value) => value == null);
    return FormData.fromMap(map);
  }

  /// Asegura que el archivo sea .jpg/.jpeg/.png/.gif/.webp.
  /// Si la extensión no es permitida (p.ej. .heic/.bmp), lo re-encodea a JPEG.
  Future<_EnsuredImage> _ensureAllowedImage(String path, String? preferredName) async {
    final allowed = <String>{'.jpg', '.jpeg', '.png', '.gif', '.webp'};
    final ext = p.extension(path).toLowerCase();

    if (allowed.contains(ext)) {
      final fileName = (preferredName?.isNotEmpty ?? false)
          ? preferredName!
          : p.basename(path);
      return _EnsuredImage(path: path, fileName: fileName);
    }

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
