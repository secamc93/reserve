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
      options: Options(
        contentType: 'multipart/form-data',
      ),
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
      options: Options(
        contentType: 'multipart/form-data',
      ),
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
    final formData = FormData();

    void addField(String key, dynamic value) {
      if (value == null) return;
      if (value is Iterable) {
        for (final item in value) {
          if (item != null) {
            formData.fields.add(MapEntry(key, item.toString()));
          }
        }
        return;
      }
      formData.fields.add(MapEntry(key, value.toString()));
    }

    map.forEach(addField);

    Future<void> attachFile({
      required List<String> fieldNames,
      String? path,
      String? preferredName,
    }) async {
      if (path == null || path.isEmpty) return;
      final ensured = await _ensureAllowedImage(path, preferredName);
      final fileBytes = await File(ensured.path).readAsBytes();
      final mimeType = lookupMimeType(ensured.path, headerBytes: fileBytes) ?? 'image/jpeg';
      final mediaType = MediaType.parse(mimeType);

      for (final field in fieldNames) {
        formData.files.add(
          MapEntry(
            field,
            MultipartFile.fromBytes(
              fileBytes,
              filename: ensured.fileName,
              contentType: mediaType,
            ),
          ),
        );
      }
    }

    await attachFile(
      fieldNames: const ['logoFile', 'logo_file'],
      path: logoFilePath,
      preferredName: logoFileName,
    );

    await attachFile(
      fieldNames: const ['navbarImageFile', 'navbar_image_file'],
      path: navbarImagePath,
      preferredName: navbarImageFileName,
    );

    return formData;
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
