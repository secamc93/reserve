import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math' as math;

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:http_parser/http_parser.dart';
import 'package:image/image.dart' as img;
import 'package:launchdarkly_event_source_client/launchdarkly_event_source_client.dart';
import 'package:mime/mime.dart';
import 'package:path/path.dart' as p;
import 'package:rupu/config/dio/authenticated_dio.dart';
import 'package:rupu/domain/datasource/horizontal_properties_datasource.dart';
import 'package:rupu/domain/infrastructure/models/horizontal_properties_response_model.dart';
import 'package:rupu/domain/infrastructure/models/horizontal_property_detail_response_model.dart';
import 'package:rupu/domain/infrastructure/models/horizontal_property_residents_response_model.dart';
import 'package:rupu/domain/infrastructure/models/horizontal_property_unit_detail_response_model.dart';
import 'package:rupu/domain/infrastructure/models/horizontal_property_units_response_model.dart';
import 'package:rupu/domain/infrastructure/models/horizontal_property_voting_groups_response_model.dart';
import 'package:rupu/domain/infrastructure/models/horizontal_property_voting_models.dart';
import 'package:rupu/domain/infrastructure/models/simple_response_model.dart';

class HorizontalPropertiesDatasourceImpl
    extends HorizontalPropertiesDatasource {
  final Dio _dio;

  static const _maxUploadBytes = 2 * 1024 * 1024; // 2 MB
  static const _maxImageDimension = 1600;
  static const _minResizeDimension = 640;

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
    Map<String, dynamic>? query,
  }) async {
    final formData = FormData.fromMap(data);
    final response = await _dio.post(
      '/horizontal-properties',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
      queryParameters: query,
    );
    return HorizontalPropertyDetailResponseModel.fromResponse(response.data);
  }

  @override
  Future<SimpleResponseModel> deleteHorizontalProperty({
    required int id,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.delete(
      '/horizontal-properties/$id',
      queryParameters: query,
    );
    return SimpleResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<HorizontalPropertyDetailResponseModel> getHorizontalPropertyDetail({
    required int id,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.get(
      '/horizontal-properties/$id',
      queryParameters: query,
    );
    return HorizontalPropertyDetailResponseModel.fromResponse(response.data);
  }

  @override
  Future<HorizontalPropertyDetailResponseModel> updateHorizontalProperty({
    required int id,
    required Map<String, dynamic> data,
    String? logoFilePath,
    String? logoFileName,
    String? navbarImagePath,
    String? navbarImageFileName,
    Map<String, dynamic>? query,
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
      options: Options(contentType: 'multipart/form-data'),
      queryParameters: query,
    );
    return HorizontalPropertyDetailResponseModel.fromResponse(response.data);
  }

  Future<FormData> _buildFormData({
    required Map<String, dynamic> map,
    String? logoFilePath,
    String? logoFileName,
    String? navbarImagePath,
    String? navbarImageFileName,
  }) async {
    final payload = <String, dynamic>{};

    map.forEach((key, value) {
      if (value == null) return;
      if (value is Iterable) {
        final normalized = value
            .where((element) => element != null)
            .map((element) => element.toString())
            .toList();
        if (normalized.isEmpty) return;
        payload[key] = normalized;
        return;
      }
      payload[key] = value;
    });

    final logoMultipart = await _createMultipartFile(
      path: logoFilePath,
      preferredName: logoFileName,
    );
    if (logoMultipart != null) {
      payload['logo_file'] = logoMultipart;
    }

    final navbarMultipart = await _createMultipartFile(
      path: navbarImagePath,
      preferredName: navbarImageFileName,
    );
    if (navbarMultipart != null) {
      payload['navbar_image_file'] = navbarMultipart;
    }

    return FormData.fromMap(payload);
  }

  Future<MultipartFile?> _createMultipartFile({
    String? path,
    String? preferredName,
  }) async {
    if (path == null || path.isEmpty) return null;
    final ensured = await _ensureAllowedImage(path, preferredName);
    final mimeType = lookupMimeType(ensured.path) ?? 'image/jpeg';
    final mediaType = MediaType.parse(mimeType);

    return MultipartFile.fromFile(
      ensured.path,
      filename: ensured.fileName,
      contentType: mediaType,
    );
  }

  /// Ensures the provided image fits within the backend limits. Allowed formats
  /// are kept intact when possible; unsupported or oversized files are
  /// downscaled and recompressed to keep the payload under control.
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
    final sourceFile = File(path);
    if (!await sourceFile.exists()) {
      throw Exception('El archivo seleccionado no existe.');
    }

    final originalName = (preferredName?.isNotEmpty ?? false)
        ? preferredName!
        : p.basename(path);
    final sanitizedName = originalName.isNotEmpty
        ? originalName
        : 'property_image$ext';

    final fileSize = await sourceFile.length();
    final keepOriginal = allowed.contains(ext) && fileSize <= _maxUploadBytes;

    if (keepOriginal) {
      return _EnsuredImage(path: path, fileName: sanitizedName);
    }

    final bytes = await sourceFile.readAsBytes();
    final decoded = img.decodeImage(bytes);
    if (decoded == null) {
      throw Exception('No se pudo procesar la imagen seleccionada.');
    }

    final oriented = img.bakeOrientation(decoded);
    final resized = _resizeToFit(oriented, _maxImageDimension);

    final preferredExt =
        allowed.contains(ext) && !{'.bmp', '.heic', '.heif'}.contains(ext)
        ? ext
        : '.jpg';
    final encoded = await _encodeWithinLimit(resized, preferredExt);

    final finalName = p.setExtension(
      p.basenameWithoutExtension(sanitizedName),
      encoded.extension,
    );
    final tempPath = p.join(Directory.systemTemp.path, finalName);
    final tempFile = File(tempPath);
    await tempFile.writeAsBytes(encoded.bytes, flush: true);

    return _EnsuredImage(path: tempFile.path, fileName: p.basename(tempPath));
  }

  Future<_EncodedImage> _encodeWithinLimit(
    img.Image image,
    String preferredExt,
  ) async {
    final ext = preferredExt.toLowerCase();

    if (ext == '.png') {
      final encoded = img.encodePng(image, level: 6);
      if (encoded.length <= _maxUploadBytes) {
        return _EncodedImage(bytes: encoded, extension: '.png');
      }
      return _encodeWithinLimit(image, '.jpg');
    }

    if (ext == '.webp') {
      return _encodeWithinLimit(image, '.jpg');
    }

    if (ext == '.gif') {
      final encoded = img.encodeGif(image);
      if (encoded.length <= _maxUploadBytes) {
        return _EncodedImage(bytes: encoded, extension: '.gif');
      }
      return _encodeWithinLimit(image, '.jpg');
    }

    img.Image current = image;
    const qualities = [85, 75, 65, 55, 45, 40];

    for (var attempt = 0; attempt < 4; attempt++) {
      for (final quality in qualities) {
        final encoded = img.encodeJpg(current, quality: quality);
        if (encoded.length <= _maxUploadBytes) {
          return _EncodedImage(bytes: encoded, extension: '.jpg');
        }
      }

      final maxSide = math.max(current.width, current.height);
      if (maxSide <= _minResizeDimension) {
        break;
      }

      final nextMaxSide = (maxSide * 0.8).round();
      current = _resizeToFit(current, nextMaxSide);
    }

    final fallback = img.encodeJpg(current, quality: 35);
    return _EncodedImage(bytes: fallback, extension: '.jpg');
  }

  img.Image _resizeToFit(img.Image image, int maxSide) {
    final currentMax = math.max(image.width, image.height);
    if (currentMax <= maxSide) return image;

    final ratio = maxSide / currentMax;
    final width = (image.width * ratio).round();
    final height = (image.height * ratio).round();

    return img.copyResize(
      image,
      width: width > 0 ? width : 1,
      height: height > 0 ? height : 1,
      interpolation: img.Interpolation.average,
    );
  }

  @override
  Future<HorizontalPropertyUnitsResponseModel> getHorizontalPropertyUnits({
    required int id,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.get(
      '/horizontal-properties/property-units',
      queryParameters: query,
    );
    return HorizontalPropertyUnitsResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<HorizontalPropertyUnitDetailResponseModel>
  getHorizontalPropertyUnitDetail({
    required int unitId,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.get(
      '/horizontal-properties/property-units/$unitId',
      queryParameters: query,
    );
    return HorizontalPropertyUnitDetailResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<HorizontalPropertyUnitDetailResponseModel>
  createHorizontalPropertyUnit({
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.post(
      '/horizontal-properties/property-units',
      data: data,
      queryParameters: query,
    );
    return HorizontalPropertyUnitDetailResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<HorizontalPropertyUnitDetailResponseModel>
  updateHorizontalPropertyUnit({
    required int unitId,
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.put(
      '/horizontal-properties/property-units/$unitId',
      data: data,
      queryParameters: query,
    );
    return HorizontalPropertyUnitDetailResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<SimpleResponseModel> deleteHorizontalPropertyUnit({
    required int unitId,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.delete(
      '/horizontal-properties/property-units/$unitId',
      queryParameters: query,
    );
    return SimpleResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<HorizontalPropertyResidentsResponseModel>
  getHorizontalPropertyResidents({
    required int id,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.get(
      '/horizontal-properties/residents',
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
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.get(
      '/horizontal-properties/voting-groups',
      queryParameters: query,
    );
    return HorizontalPropertyVotingGroupsResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<HorizontalPropertyVotingGroupActionResponseModel>
  createHorizontalPropertyVotingGroup({
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.post(
      '/horizontal-properties/voting-groups',
      data: data,
      queryParameters: query,
    );
    return HorizontalPropertyVotingGroupActionResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<HorizontalPropertyVotingGroupActionResponseModel>
  updateHorizontalPropertyVotingGroup({
    required int groupId,
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.put(
      '/horizontal-properties/voting-groups/$groupId',
      data: data,
      queryParameters: query,
    );
    return HorizontalPropertyVotingGroupActionResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<SimpleResponseModel> deleteHorizontalPropertyVotingGroup({
    required int groupId,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.delete(
      '/horizontal-properties/voting-groups/$groupId',
      queryParameters: query,
    );
    return SimpleResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<HorizontalPropertyVotingsResponseModel> getHorizontalPropertyVotings({
    required int groupId,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.get(
      '/horizontal-properties/voting-groups/$groupId/votings',
      queryParameters: query,
    );
    return HorizontalPropertyVotingsResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<HorizontalPropertyVotingActionResponseModel>
  createHorizontalPropertyVoting({
    required int groupId,
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.post(
      '/horizontal-properties/voting-groups/$groupId/votings',
      data: data,
      queryParameters: query,
    );
    return HorizontalPropertyVotingActionResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<HorizontalPropertyVotingActionResponseModel>
  updateHorizontalPropertyVoting({
    required int groupId,
    required int votingId,
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.put(
      '/horizontal-properties/voting-groups/$groupId/votings/$votingId',
      data: data,
      queryParameters: query,
    );
    return HorizontalPropertyVotingActionResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<SimpleResponseModel> deleteHorizontalPropertyVoting({
    required int groupId,
    required int votingId,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.delete(
      '/horizontal-properties/voting-groups/$groupId/votings/$votingId',
      queryParameters: query,
    );
    return SimpleResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<SimpleResponseModel> activateHorizontalPropertyVoting({
    required int groupId,
    required int votingId,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.patch(
      '/horizontal-properties/voting-groups/$groupId/votings/$votingId/activate',
      queryParameters: query,
    );
    return SimpleResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<SimpleResponseModel> deactivateHorizontalPropertyVoting({
    required int groupId,
    required int votingId,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.patch(
      '/horizontal-properties/voting-groups/$groupId/votings/$votingId/deactivate',
      queryParameters: query,
    );
    return SimpleResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<HorizontalPropertyVotingOptionsResponseModel>
  getHorizontalPropertyVotingOptions({
    required int groupId,
    required int votingId,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.get(
      '/horizontal-properties/voting-groups/$groupId/votings/$votingId/options',
      queryParameters: query,
    );
    return HorizontalPropertyVotingOptionsResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<HorizontalPropertyVotingOptionActionResponseModel>
  createHorizontalPropertyVotingOption({
    required int groupId,
    required int votingId,
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.post(
      '/horizontal-properties/voting-groups/$groupId/votings/$votingId/options',
      data: data,
      queryParameters: query,
    );
    return HorizontalPropertyVotingOptionActionResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<SimpleResponseModel> deleteHorizontalPropertyVotingOption({
    required int groupId,
    required int votingId,
    required int optionId,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.delete(
      '/horizontal-properties/voting-groups/$groupId/votings/$votingId/options/$optionId',
      queryParameters: query,
    );
    return SimpleResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<HorizontalPropertyVotingVotesResponseModel>
  getHorizontalPropertyVotingVotes({
    required int groupId,
    required int votingId,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.get(
      '/horizontal-properties/voting-groups/$groupId/votings/$votingId/votes',
      queryParameters: query,
    );
    return HorizontalPropertyVotingVotesResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<SimpleResponseModel> createHorizontalPropertyVote({
    required int groupId,
    required int votingId,
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.post(
      '/horizontal-properties/voting-groups/$groupId/votings/$votingId/votes',
      data: data,
      queryParameters: query,
    );
    return SimpleResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<SimpleResponseModel> deleteHorizontalPropertyVote({
    required int groupId,
    required int votingId,
    required int voteId,
    Map<String, dynamic>? query,
  }) async {
    final response = await _dio.delete(
      '/horizontal-properties/voting-groups/$groupId/votings/$votingId/votes/$voteId',
      queryParameters: query,
    );
    return SimpleResponseModel.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Stream<Map<String, dynamic>> subscribeToVotingLiveData({
    required int groupId,
    required int votingId,
    Map<String, dynamic>? query,
  }) {
    // ---- construir query ----
    Map<String, String>? queryParameters;
    if (query != null && query.isNotEmpty) {
      queryParameters = {};
      query.forEach((k, v) {
        if (v != null) queryParameters![k] = v.toString();
      });

      // 👇 Si no quieres que vaya business_id en la URL del SSE:
      queryParameters?.remove('business_id');

      if (queryParameters.isEmpty) {
        queryParameters = null;
      }
    }

    // ---- URL ----
    final baseUri = Uri.parse(_dio.options.baseUrl);
    final uri = baseUri.resolve(
      '/horizontal-properties/voting-groups/$groupId/votings/$votingId/stream',
    );

    final resolved = queryParameters == null
        ? uri
        : uri.replace(queryParameters: queryParameters);

    debugPrint('[SSE] URL final: $resolved');

    // ---- headers ----
    final headers = <String, String>{};
    _dio.options.headers.forEach((k, v) {
      if (v != null) headers[k] = v.toString();
    });
    headers.putIfAbsent('Accept', () => 'text/event-stream');

    debugPrint('[SSE] Headers: $headers');

    final client = SSEClient(resolved, {'message'}, headers: headers);

    final controller = StreamController<Map<String, dynamic>>();

    final sub = client.stream.listen(
      (event) {
        if (event is MessageEvent) {
          final data = event.data;
          debugPrint('[SSE] MessageEvent data: $data');
          if (data != null) {
            final parsed = _parseEventPayload(data);
            if (parsed != null) {
              controller.add(parsed);
            } else {
              debugPrint('[SSE] payload no parseable, se ignora');
            }
          }
        } else {
          debugPrint('[SSE] Otro evento: $event');
        }
      },
      onError: (e, st) {
        debugPrint('[SSE] onError: $e');
        controller.addError(e, st);
      },
      onDone: () {
        debugPrint('[SSE] onDone');
        controller.close();
      },
      cancelOnError: false,
    );

    controller.onCancel = () async {
      debugPrint('[SSE] onCancel: cerrando sub y cliente');
      await sub.cancel();
      await client.close();
    };

    return controller.stream;
  }

  Map<String, dynamic>? _parseEventPayload(String data) {
    String normalized = data.trim();
    if (normalized.isEmpty) return null;
    if (normalized.startsWith('data:')) {
      normalized = normalized.substring(5).trim();
    }

    Map<String, dynamic>? decode(String value) {
      try {
        final decoded = jsonDecode(value);
        if (decoded is Map<String, dynamic>) {
          return decoded;
        }
      } catch (_) {
        // ignore malformed payloads
      }
      return null;
    }

    final direct = decode(normalized);
    if (direct != null) return direct;

    final braceIndex = normalized.indexOf('{');
    if (braceIndex >= 0) {
      final candidate = decode(normalized.substring(braceIndex));
      if (candidate != null) return candidate;
    }
    return null;
  }
}

class _EnsuredImage {
  final String path;
  final String fileName;

  _EnsuredImage({required this.path, required this.fileName});
}

class _EncodedImage {
  final List<int> bytes;
  final String extension;

  const _EncodedImage({required this.bytes, required this.extension});
}
