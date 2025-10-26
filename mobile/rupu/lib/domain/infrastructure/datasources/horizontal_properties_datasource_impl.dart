import 'dart:io';

import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';
import 'package:image/image.dart' as img;
import 'package:mime/mime.dart';
import 'package:path/path.dart' as p;
import 'package:rupu/config/dio/authenticated_dio.dart';
import 'package:rupu/domain/datasource/horizontal_properties_datasource.dart';
import 'package:rupu/domain/infrastructure/models/horizontal_properties_response_model.dart';
import 'package:rupu/domain/infrastructure/models/horizontal_property_detail_response_model.dart';
import 'package:rupu/domain/infrastructure/models/horizontal_property_residents_response_model.dart';
import 'package:rupu/domain/infrastructure/models/horizontal_property_units_response_model.dart';
import 'package:rupu/domain/infrastructure/models/horizontal_property_voting_groups_response_model.dart';
import 'package:rupu/domain/infrastructure/models/simple_response_model.dart';

class HorizontalPropertiesDatasourceImpl extends HorizontalPropertiesDatasource {
  final Dio _dio;

  HorizontalPropertiesDatasourceImpl({String? baseUrl})
      : _dio = AuthenticatedDio(
          baseUrl: baseUrl ?? 'https://www.xn--rup-joa.com/api/v1',
        ).dio;

  @override
  Future<HorizontalPropertiesResponseModel> getHorizontalProperties({
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.get(
      '/horizontal-properties',
      queryParameters: query,
    );
    return HorizontalPropertiesResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<HorizontalPropertyDetailResponseModel> createHorizontalProperty({
    required Map<String, dynamic> data,
  }) async {
    final formData = FormData.fromMap(data);
    final response = await _dio.post(
      '/horizontal-properties',
      data: formData,
    );
    return HorizontalPropertyDetailResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<SimpleResponseModel> deleteHorizontalProperty({required int id}) async {
    final response = await _dio.delete('/horizontal-properties/$id');
    return SimpleResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<HorizontalPropertyDetailResponseModel> getHorizontalPropertyDetail({
    required int id,
  }) async {
    final response = await _dio.get('/horizontal-properties/$id');
    return HorizontalPropertyDetailResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<HorizontalPropertyDetailResponseModel> updateHorizontalProperty({
    required int id,
    required Map<String, dynamic> data,
    String? logoFilePath,
    String? logoFileName,
    String? navbarImagePath,
    String? navbarImageFileName,
  }) async {
    final formData = await _buildFormData(
      map: data,
      logoFilePath: logoFilePath,
      logoFileName: logoFileName,
      navbarImagePath: navbarImagePath,
      navbarImageFileName: navbarImageFileName,
    );
    final response = await _dio.put(
      '/horizontal-properties/$id',
      data: formData,
    );
    return HorizontalPropertyDetailResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  Future<FormData> _buildFormData({
    required Map<String, dynamic> map,
    String? logoFilePath,
    String? logoFileName,
    String? navbarImagePath,
    String? navbarImageFileName,
  }) async {
    final payload = Map<String, dynamic>.from(map);

    Future<void> attachFile({
      required String field,
      String? path,
      String? preferredName,
    }) async {
      if (path == null || path.isEmpty) return;
      final ensured = await _ensureAllowedImage(path, preferredName);
      final bytes = await File(ensured.path).readAsBytes();
      final mimeType = lookupMimeType(ensured.path, headerBytes: bytes) ?? 'image/jpeg';
      final mediaType = MediaType.parse(mimeType);

      payload[field] = await MultipartFile.fromFile(
        ensured.path,
        filename: ensured.fileName,
        contentType: mediaType,
      );
    }

    await attachFile(
      field: 'logoFile',
      path: logoFilePath,
      preferredName: logoFileName,
    );

    await attachFile(
      field: 'navbarImageFile',
      path: navbarImagePath,
      preferredName: navbarImageFileName,
    );

    payload.removeWhere((key, value) => value == null);
    return FormData.fromMap(payload);
  }

  /// Ensures the provided [path] points to an allowed image extension.
  /// If the extension is unsupported it re-encodes the image as JPEG,
  /// mirroring the behaviour used for user avatar uploads.
  Future<_EnsuredImage> _ensureAllowedImage(
    String path,
    String? preferredName,
  ) async {
    final allowed = <String>{
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.bmp',
      '.heic',
      '.heif',
    };
    final ext = p.extension(path).toLowerCase();

    if (allowed.contains(ext)) {
      final fileName = (preferredName?.isNotEmpty ?? false)
          ? preferredName!
          : p.basename(path);
      return _EnsuredImage(path: path, fileName: fileName);
    }

    final sourceFile = File(path);
    if (!await sourceFile.exists()) {
      throw Exception('El archivo seleccionado no existe.');
    }

    final bytes = await sourceFile.readAsBytes();
    final decoded = img.decodeImage(bytes);
    if (decoded == null) {
      throw Exception('No se pudo procesar la imagen seleccionada.');
    }

    final encoded = img.encodeJpg(decoded, quality: 90);
    final tempDir = Directory.systemTemp.path;
    final preferredBaseName =
        (preferredName?.isNotEmpty ?? false) ? preferredName! : p.basename(path);
    final newName = p.setExtension(preferredBaseName, '.jpg');
    final newPath = p.join(tempDir, newName);

    final file = File(newPath);
    await file.writeAsBytes(encoded, flush: true);

    return _EnsuredImage(path: file.path, fileName: p.basename(newPath));
  }

  @override
  Future<HorizontalPropertyUnitsResponseModel> getHorizontalPropertyUnits({
    required int id,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.get(
      '/horizontal-properties/$id/property-units',
      queryParameters: query,
    );
    return HorizontalPropertyUnitsResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<HorizontalPropertyResidentsResponseModel>
      getHorizontalPropertyResidents({
    required int id,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.get(
      '/horizontal-properties/$id/residents',
      queryParameters: query,
    );
    return HorizontalPropertyResidentsResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<HorizontalPropertyVotingGroupsResponseModel>
      getHorizontalPropertyVotingGroups({
    required int id,
  }) async {
    final response = await _dio.get(
      '/horizontal-properties/$id/voting-groups',
    );
    return HorizontalPropertyVotingGroupsResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }
}

class _EnsuredImage {
  final String path;
  final String fileName;

  _EnsuredImage({required this.path, required this.fileName});
}
