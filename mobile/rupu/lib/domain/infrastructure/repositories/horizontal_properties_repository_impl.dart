import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/domain/datasource/horizontal_properties_datasource.dart';
import 'package:rupu/domain/entities/horizontal_properties_page.dart';
import 'package:rupu/domain/entities/horizontal_property_action_result.dart';
import 'package:rupu/domain/entities/horizontal_property_create_result.dart';
import 'package:rupu/domain/entities/horizontal_property_detail.dart';
import 'package:rupu/domain/entities/horizontal_property_resident_detail.dart';
import 'package:rupu/domain/entities/horizontal_property_residents_page.dart';
import 'package:rupu/domain/entities/horizontal_property_unit_detail.dart';
import 'package:rupu/domain/entities/horizontal_property_units_page.dart';
import 'package:rupu/domain/entities/horizontal_property_update_result.dart';
import 'package:rupu/domain/entities/horizontal_property_voting.dart';
import 'package:rupu/domain/entities/horizontal_property_voting_groups.dart';
import 'package:rupu/domain/infrastructure/datasources/horizontal_properties_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/mappers/horizontal_properties_mapper.dart';
import 'package:rupu/domain/repositories/horizontal_properties_repository.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';

class HorizontalPropertiesRepositoryImpl
    extends HorizontalPropertiesRepository {
  final HorizontalPropertiesDatasource datasource;

  HorizontalPropertiesRepositoryImpl({
    HorizontalPropertiesDatasource? datasource,
  }) : datasource = datasource ?? HorizontalPropertiesDatasourceImpl();

  @override
  Future<HorizontalPropertiesPage> getHorizontalProperties({
    Map<String, dynamic>? query,
  }) async {
    final response = await datasource.getHorizontalProperties(
      query: _withBusinessQuery(query),
    );
    return HorizontalPropertiesMapper.responseToEntity(response);
  }

  @override
  Future<HorizontalPropertyCreateResult> createHorizontalProperty({
    required Map<String, dynamic> data,
  }) async {
    final response = await datasource.createHorizontalProperty(
      data: data,
      query: _withBusinessQuery(),
    );
    return HorizontalPropertiesMapper.detailResponseToCreateResult(response);
  }

  @override
  Future<HorizontalPropertyActionResult> deleteHorizontalProperty({
    required int id,
  }) async {
    final response = await datasource.deleteHorizontalProperty(
      id: id,
      query: _withBusinessQuery(),
    );
    return HorizontalPropertiesMapper.simpleResponseToActionResult(response);
  }

  @override
  Future<HorizontalPropertyDetail?> getHorizontalPropertyDetail({
    required int id,
  }) async {
    final response = await datasource.getHorizontalPropertyDetail(
      id: id,
      query: _withBusinessQuery(),
    );
    return HorizontalPropertiesMapper.detailResponseToDetail(response);
  }

  @override
  Future<HorizontalPropertyUpdateResult> updateHorizontalProperty({
    required int id,
    required Map<String, dynamic> data,
    String? logoFilePath,
    String? logoFileName,
    String? navbarImagePath,
    String? navbarImageFileName,
  }) async {
    final response = await datasource.updateHorizontalProperty(
      id: id,
      data: data,
      logoFilePath: logoFilePath,
      logoFileName: logoFileName,
      navbarImagePath: navbarImagePath,
      navbarImageFileName: navbarImageFileName,
      query: _withBusinessQuery(),
    );
    return HorizontalPropertiesMapper.detailResponseToUpdateResult(response);
  }

  @override
  Future<HorizontalPropertyUnitsPage> getHorizontalPropertyUnits({
    required int id,
    Map<String, dynamic>? query,
  }) async {
    final response = await datasource.getHorizontalPropertyUnits(
      id: id,
      query: _withBusinessQuery(query),
    );
    return HorizontalPropertiesMapper.unitsResponseToEntity(response);
  }

  @override
  Future<HorizontalPropertyUnitDetailResult> getHorizontalPropertyUnitDetail({
    required int unitId,
  }) async {
    try {
      final response = await datasource.getHorizontalPropertyUnitDetail(
        unitId: unitId,
        query: _withBusinessQuery(),
      );
      return HorizontalPropertiesMapper.unitDetailResponseToEntity(response);
    } catch (_) {
      return const HorizontalPropertyUnitDetailResult(
        success: false,
        message: 'No se pudo obtener el detalle de la unidad.',
      );
    }
  }

  @override
  Future<HorizontalPropertyUnitDetailResult> createHorizontalPropertyUnit({
    required int propertyId,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await datasource.createHorizontalPropertyUnit(
        data: data,
        query: _withBusinessQuery(
          propertyId > 0 ? {'business_id': propertyId} : null,
        ),
      );
      return HorizontalPropertiesMapper.unitDetailResponseToEntity(response);
    } catch (_) {
      return const HorizontalPropertyUnitDetailResult(
        success: false,
        message: 'No se pudo crear la unidad.',
      );
    }
  }

  @override
  Future<HorizontalPropertyUnitDetailResult> updateHorizontalPropertyUnit({
    required int propertyId,
    required int unitId,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await datasource.updateHorizontalPropertyUnit(
        unitId: unitId,
        data: data,
        query: _withBusinessQuery(
          propertyId > 0 ? {'business_id': propertyId} : null,
        ),
      );
      return HorizontalPropertiesMapper.unitDetailResponseToEntity(response);
    } catch (_) {
      return const HorizontalPropertyUnitDetailResult(
        success: false,
        message: 'No se pudo actualizar la unidad.',
      );
    }
  }

  @override
  Future<HorizontalPropertyActionResult> deleteHorizontalPropertyUnit({
    required int propertyId,
    required int unitId,
  }) async {
    try {
      final response = await datasource.deleteHorizontalPropertyUnit(
        unitId: unitId,
        query: _withBusinessQuery(
          propertyId > 0 ? {'business_id': propertyId} : null,
        ),
      );
      return HorizontalPropertiesMapper.simpleResponseToActionResult(response);
    } catch (_) {
      return const HorizontalPropertyActionResult(
        success: false,
        message: 'No se pudo eliminar la unidad.',
      );
    }
  }

  @override
  Future<HorizontalPropertyResidentsPage> getHorizontalPropertyResidents({
    required int id,
    Map<String, dynamic>? query,
  }) async {
    final response = await datasource.getHorizontalPropertyResidents(
      id: id,
      query: _withBusinessQuery(query),
    );
    return HorizontalPropertiesMapper.residentsResponseToEntity(response);
  }

  @override
  Future<HorizontalPropertyResidentDetailResult>
      getHorizontalPropertyResidentDetail({
    required int residentId,
  }) async {
    try {
      final response = await datasource.getHorizontalPropertyResidentDetail(
        residentId: residentId,
        query: _withBusinessQuery(),
      );
      return HorizontalPropertiesMapper.residentDetailToEntity(response);
    } catch (_) {
      return const HorizontalPropertyResidentDetailResult(
        success: false,
        message: 'No se pudo obtener el detalle del residente.',
      );
    }
  }

  @override
  Future<HorizontalPropertyResidentDetailResult>
      createHorizontalPropertyResident({
    required int propertyId,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await datasource.createHorizontalPropertyResident(
        data: data,
        query: _withBusinessQuery(
          propertyId > 0 ? {'business_id': propertyId} : null,
        ),
      );
      return HorizontalPropertiesMapper.residentDetailToEntity(response);
    } catch (_) {
      return const HorizontalPropertyResidentDetailResult(
        success: false,
        message: 'No se pudo crear el residente.',
      );
    }
  }

  @override
  Future<HorizontalPropertyResidentDetailResult>
      updateHorizontalPropertyResident({
    required int propertyId,
    required int residentId,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await datasource.updateHorizontalPropertyResident(
        residentId: residentId,
        data: data,
        query: _withBusinessQuery(
          propertyId > 0 ? {'business_id': propertyId} : null,
        ),
      );
      return HorizontalPropertiesMapper.residentDetailToEntity(response);
    } catch (_) {
      return const HorizontalPropertyResidentDetailResult(
        success: false,
        message: 'No se pudo actualizar el residente.',
      );
    }
  }

  @override
  Future<HorizontalPropertyVotingGroupsResult>
  getHorizontalPropertyVotingGroups({required int id}) async {
    final response = await datasource.getHorizontalPropertyVotingGroups(
      id: id,
      query: _withBusinessQuery({'business_id': id}),
    );
    return HorizontalPropertiesMapper.votingGroupsResponseToEntity(response);
  }

  @override
  Future<HorizontalPropertyVotingGroupActionResult>
  createHorizontalPropertyVotingGroup({
    required int businessId,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await datasource.createHorizontalPropertyVotingGroup(
        data: data,
        query: _withBusinessQuery({'business_id': businessId}),
      );
      return HorizontalPropertiesMapper.votingGroupActionResponseToEntity(
        response,
      );
    } catch (_) {
      return const HorizontalPropertyVotingGroupActionResult(
        success: false,
        message: 'No se pudo crear el grupo de votación.',
      );
    }
  }

  @override
  Future<HorizontalPropertyVotingGroupActionResult>
  updateHorizontalPropertyVotingGroup({
    required int businessId,
    required int groupId,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await datasource.updateHorizontalPropertyVotingGroup(
        groupId: groupId,
        data: data,
        query: _withBusinessQuery({'business_id': businessId}),
      );
      return HorizontalPropertiesMapper.votingGroupActionResponseToEntity(
        response,
      );
    } catch (_) {
      return const HorizontalPropertyVotingGroupActionResult(
        success: false,
        message: 'No se pudo actualizar el grupo de votación.',
      );
    }
  }

  @override
  Future<HorizontalPropertyActionResult> deleteHorizontalPropertyVotingGroup({
    required int businessId,
    required int groupId,
  }) async {
    try {
      final response = await datasource.deleteHorizontalPropertyVotingGroup(
        groupId: groupId,
        query: _withBusinessQuery({'business_id': businessId}),
      );
      return HorizontalPropertiesMapper.simpleResponseToActionResult(response);
    } catch (_) {
      return const HorizontalPropertyActionResult(
        success: false,
        message: 'No se pudo eliminar el grupo de votación.',
      );
    }
  }

  @override
  Future<HorizontalPropertyVotingListResult> getHorizontalPropertyVotings({
    required int businessId,
    required int groupId,
  }) async {
    try {
      final response = await datasource.getHorizontalPropertyVotings(
        groupId: groupId,
        query: _withBusinessQuery({'business_id': businessId}),
      );
      return HorizontalPropertiesMapper.votingsResponseToEntity(response);
    } catch (_) {
      return const HorizontalPropertyVotingListResult(
        success: false,
        message: 'No se pudieron obtener las votaciones del grupo.',
        votings: [],
      );
    }
  }

  @override
  Future<HorizontalPropertyVotingActionResult> createHorizontalPropertyVoting({
    required int businessId,
    required int groupId,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await datasource.createHorizontalPropertyVoting(
        groupId: groupId,
        data: data,
        query: _withBusinessQuery({'business_id': businessId}),
      );
      return HorizontalPropertiesMapper.votingActionResponseToEntity(response);
    } catch (_) {
      return const HorizontalPropertyVotingActionResult(
        success: false,
        message: 'No se pudo crear la votación.',
      );
    }
  }

  @override
  Future<HorizontalPropertyVotingActionResult> updateHorizontalPropertyVoting({
    required int businessId,
    required int groupId,
    required int votingId,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await datasource.updateHorizontalPropertyVoting(
        groupId: groupId,
        votingId: votingId,
        data: data,
        query: _withBusinessQuery({'business_id': businessId}),
      );
      return HorizontalPropertiesMapper.votingActionResponseToEntity(response);
    } catch (_) {
      return const HorizontalPropertyVotingActionResult(
        success: false,
        message: 'No se pudo actualizar la votación.',
      );
    }
  }

  @override
  Future<HorizontalPropertyActionResult> deleteHorizontalPropertyVoting({
    required int businessId,
    required int groupId,
    required int votingId,
  }) async {
    try {
      final response = await datasource.deleteHorizontalPropertyVoting(
        groupId: groupId,
        votingId: votingId,
        query: _withBusinessQuery({'business_id': businessId}),
      );
      return HorizontalPropertiesMapper.simpleResponseToActionResult(response);
    } catch (_) {
      return const HorizontalPropertyActionResult(
        success: false,
        message: 'No se pudo eliminar la votación.',
      );
    }
  }

  @override
  Future<HorizontalPropertyActionResult> activateHorizontalPropertyVoting({
    required int businessId,
    required int groupId,
    required int votingId,
  }) async {
    try {
      final response = await datasource.activateHorizontalPropertyVoting(
        groupId: groupId,
        votingId: votingId,
        query: _withBusinessQuery({'business_id': businessId}),
      );
      return HorizontalPropertiesMapper.simpleResponseToActionResult(response);
    } catch (_) {
      return const HorizontalPropertyActionResult(
        success: false,
        message: 'No se pudo activar la votación.',
      );
    }
  }

  @override
  Future<HorizontalPropertyActionResult> deactivateHorizontalPropertyVoting({
    required int businessId,
    required int groupId,
    required int votingId,
  }) async {
    try {
      final response = await datasource.deactivateHorizontalPropertyVoting(
        groupId: groupId,
        votingId: votingId,
        query: _withBusinessQuery({'business_id': businessId}),
      );
      return HorizontalPropertiesMapper.simpleResponseToActionResult(response);
    } catch (_) {
      return const HorizontalPropertyActionResult(
        success: false,
        message: 'No se pudo desactivar la votación.',
      );
    }
  }

  @override
  Future<HorizontalPropertyVotingOptionListResult>
  getHorizontalPropertyVotingOptions({
    required int businessId,
    required int groupId,
    required int votingId,
  }) async {
    try {
      final response = await datasource.getHorizontalPropertyVotingOptions(
        groupId: groupId,
        votingId: votingId,
        query: _withBusinessQuery({'business_id': businessId}),
      );
      return HorizontalPropertiesMapper.votingOptionsResponseToEntity(response);
    } catch (_) {
      return const HorizontalPropertyVotingOptionListResult(
        success: false,
        message: 'No se pudieron obtener las opciones de votación.',
        options: [],
      );
    }
  }

  @override
  Future<HorizontalPropertyVotingOptionActionResult>
  createHorizontalPropertyVotingOption({
    required int businessId,
    required int groupId,
    required int votingId,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await datasource.createHorizontalPropertyVotingOption(
        groupId: groupId,
        votingId: votingId,
        data: data,
        query: _withBusinessQuery({'business_id': businessId}),
      );
      return HorizontalPropertiesMapper.votingOptionActionResponseToEntity(
        response,
      );
    } catch (_) {
      return const HorizontalPropertyVotingOptionActionResult(
        success: false,
        message: 'No se pudo crear la opción de votación.',
      );
    }
  }

  @override
  Future<HorizontalPropertyActionResult> deleteHorizontalPropertyVotingOption({
    required int businessId,
    required int groupId,
    required int votingId,
    required int optionId,
  }) async {
    try {
      final response = await datasource.deleteHorizontalPropertyVotingOption(
        groupId: groupId,
        votingId: votingId,
        optionId: optionId,
        query: _withBusinessQuery({'business_id': businessId}),
      );
      return HorizontalPropertiesMapper.simpleResponseToActionResult(response);
    } catch (_) {
      return const HorizontalPropertyActionResult(
        success: false,
        message: 'No se pudo eliminar la opción de votación.',
      );
    }
  }

  @override
  Future<HorizontalPropertyVotingVotesResult> getHorizontalPropertyVotingVotes({
    required int businessId,
    required int groupId,
    required int votingId,
  }) async {
    try {
      final response = await datasource.getHorizontalPropertyVotingVotes(
        groupId: groupId,
        votingId: votingId,
        query: _withBusinessQuery({'business_id': businessId}),
      );
      return HorizontalPropertiesMapper.votingVotesResponseToEntity(response);
    } catch (_) {
      return const HorizontalPropertyVotingVotesResult(
        success: false,
        message: 'No se pudieron obtener los votos de la votación.',
        votes: [],
      );
    }
  }

  @override
  Future<HorizontalPropertyVotingDetailsResult>
      getHorizontalPropertyVotingDetails({
    required int businessId,
    required int groupId,
    required int votingId,
  }) async {
    try {
      final response = await datasource.getHorizontalPropertyVotingDetails(
        groupId: groupId,
        votingId: votingId,
        query: _withBusinessQuery({'business_id': businessId}),
      );
      return HorizontalPropertiesMapper.votingDetailsResponseToEntity(response);
    } catch (_) {
      return const HorizontalPropertyVotingDetailsResult(
        success: false,
        message: 'No se pudo obtener el detalle de la votación.',
        totalUnits: 0,
        unitsPending: 0,
        unitsVoted: 0,
        units: [],
      );
    }
  }

  @override
  Future<HorizontalPropertyActionResult> createHorizontalPropertyVote({
    required int businessId,
    required int groupId,
    required int votingId,
    required Map<String, dynamic> data,
  }) async {
    try {
      final response = await datasource.createHorizontalPropertyVote(
        groupId: groupId,
        votingId: votingId,
        data: data,
        query: _withBusinessQuery({'business_id': businessId}),
      );
      return HorizontalPropertiesMapper.simpleResponseToActionResult(response);
    } catch (_) {
      return const HorizontalPropertyActionResult(
        success: false,
        message: 'No se pudo registrar el voto.',
      );
    }
  }

  @override
  Future<HorizontalPropertyActionResult> deleteHorizontalPropertyVote({
    required int businessId,
    required int groupId,
    required int votingId,
    required int voteId,
  }) async {
    try {
      final response = await datasource.deleteHorizontalPropertyVote(
        groupId: groupId,
        votingId: votingId,
        voteId: voteId,
        query: _withBusinessQuery({'business_id': businessId}),
      );
      return HorizontalPropertiesMapper.simpleResponseToActionResult(response);
    } catch (_) {
      return const HorizontalPropertyActionResult(
        success: false,
        message: 'No se pudo eliminar el voto.',
      );
    }
  }

  @override
  Stream<HorizontalPropertyVotingGroupLiveData> subscribeToVotingLiveData({
    required int businessId,
    required int groupId,
    required int votingId,
  }) {
    final query = _withBusinessQuery({'business_id': businessId});

    // 1) Obtenemos el stream crudo del datasource
    final raw = datasource.subscribeToVotingLiveData(
      groupId: groupId,
      votingId: votingId,
      query: query,
    );

    // 2) Mapeo + filtrado de nulos
    final mapped = raw
        .map(_liveDataFromPayload) // HorizontalPropertyVotingGroupLiveData?
        .where((e) => e != null)
        .cast<HorizontalPropertyVotingGroupLiveData>();

    // 3) Hacerlo broadcast para múltiples oyentes sin error
    return mapped.asBroadcastStream(
      onListen: (sub) {}, // no-ops
      onCancel: (sub) {},
    );
  }

  int? _toInt(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value);
    return null;
  }

  HorizontalPropertyVotingGroupLiveData? _liveDataFromPayload(
    Map<String, dynamic> payload,
  ) {
    try {
      final rawData = payload['data'];
      final payloadEventName = (payload['event'] ?? payload['event_name']) as String?;

      if (rawData is List) {
        final units = rawData
            .whereType<Map<String, dynamic>>()
            .map(_liveUnitFromMap)
            .whereType<HorizontalPropertyVotingLiveUnit>()
            .map((unit) => unit.copyWith(hasVoted: false))
            .toList(growable: false);

        return HorizontalPropertyVotingGroupLiveData(
          totalUnits: -1,
          unitsPending: units.length,
          unitsVoted: -1,
          units: units,
          hasUnitsSnapshot: false,
          timestamp: _parseDateTime(payload['timestamp']),
          eventName: payloadEventName,
        );
      }

      final data = _asMap(rawData) ?? payload;
      final eventName = (data['event'] ?? data['event_name']) as String? ??
          payloadEventName;

      final unitsData = data['units'];
      final hasUnitsSnapshot = unitsData is List;
      final units = hasUnitsSnapshot
          ? unitsData
              .whereType<Map<String, dynamic>>()
              .map(_liveUnitFromMap)
              .whereType<HorizontalPropertyVotingLiveUnit>()
              .toList(growable: false)
          : const <HorizontalPropertyVotingLiveUnit>[];

      final resultsData = data['results'];
      final hasResultsSnapshot = resultsData is List;
      final results = hasResultsSnapshot
          ? resultsData
              .whereType<Map<String, dynamic>>()
              .map(_liveResultFromMap)
              .whereType<HorizontalPropertyVotingLiveResult>()
              .toList(growable: false)
          : const <HorizontalPropertyVotingLiveResult>[];

      final votesData = data['votes'];
      final hasVotesSnapshot = votesData is List;
      final votePayloads = <Map<String, dynamic>>[];
      if (hasVotesSnapshot) {
        votePayloads.addAll(
          votesData
              .whereType<Map<String, dynamic>>()
              .map(_normalizeVotePayload)
              .whereType<Map<String, dynamic>>(),
        );
      } else {
        final directVote = _extractVoteMap(data);
        if (directVote != null) {
          votePayloads.add(directVote);
        }
      }

      final votes = votePayloads
          .map(_liveVoteFromMap)
          .whereType<HorizontalPropertyVotingVote>()
          .toList(growable: false);

      final totalUnits = data.containsKey('total_units')
          ? (_toInt(data['total_units']) ?? 0)
          : -1;
      final unitsPending = data.containsKey('units_pending')
          ? (_toInt(data['units_pending']) ?? 0)
          : -1;
      final unitsVoted = data.containsKey('units_voted')
          ? (_toInt(data['units_voted']) ?? 0)
          : -1;

      final removedVoteId = _toInt(data['vote_id']);
      final removedVoteVotingId = _toInt(data['voting_id']);

      return HorizontalPropertyVotingGroupLiveData(
        totalUnits: totalUnits >= 0 ? totalUnits : units.length,
        unitsPending: unitsPending,
        unitsVoted: unitsVoted,
        units: units,
        results: results,
        votes: votes,
        hasResultsSnapshot: hasResultsSnapshot,
        hasVotesSnapshot: hasVotesSnapshot,
        hasUnitsSnapshot: hasUnitsSnapshot,
        timestamp: _parseDateTime(data['timestamp']),
        removedVoteId: removedVoteId,
        removedVoteVotingId: removedVoteVotingId,
        eventName: eventName,
      );
    } catch (e, st) {
      debugPrint('Error parseando liveData: $e');
      debugPrint('Stack: $st');
      debugPrint('Payload problemático: $payload');
      return null;
    }
  }

  Map<String, dynamic>? _asMap(dynamic value) {
    if (value is Map<String, dynamic>) {
      return value;
    }
    return null;
  }

  HorizontalPropertyVotingLiveUnit? _liveUnitFromMap(
    Map<String, dynamic> json,
  ) {
    final unitId = _toInt(json['property_unit_id'] ?? json['unit_id']);
    final unitNumber =
        (json['property_unit_number'] ?? json['unit_number']) as String?;
    if (unitId == null || unitNumber == null) {
      return null;
    }

    return HorizontalPropertyVotingLiveUnit(
      propertyUnitId: unitId,
      unitNumber: unitNumber,
      participationCoefficient: _toDouble(
        json['participation_coefficient'] ?? json['coefficient'],
      ),
      residentId: _toInt(json['resident_id']),
      residentName: json['resident_name'] as String?,
      hasVoted: json['has_voted'] as bool? ??
          (json['voting_option_id'] != null ||
              json['votingOptionId'] != null),
      votingOptionId:
          _toInt(json['voting_option_id'] ?? json['votingOptionId']),
      optionText: (json['option_text'] ?? json['optionText']) as String?,
      optionCode: (json['option_code'] ?? json['optionCode']) as String?,
      optionColor: (json['option_color'] ?? json['optionColor']) as String?,
      votedAt: _parseDate(json['voted_at'] as String?) ??
          _parseDate(json['votedAt'] as String?),
    );
  }

  HorizontalPropertyVotingLiveResult? _liveResultFromMap(
    Map<String, dynamic> json,
  ) {
    final optionId = _toInt(json['voting_option_id']);
    if (optionId == null) {
      return null;
    }

    return HorizontalPropertyVotingLiveResult(
      votingOptionId: optionId,
      optionText: (json['option_text'] as String?)?.trim() ?? '',
      optionCode: (json['option_code'] as String?)?.trim() ?? '',
      color: json['color'] as String?,
      voteCount: _toInt(json['vote_count']) ?? 0,
      percentage: _toDouble(json['percentage']) ?? 0.0,
    );
  }

  HorizontalPropertyVotingVote? _liveVoteFromMap(
    Map<String, dynamic> json,
  ) {
    final id = _toInt(json['id']);
    final votingId = _toInt(json['voting_id'] ?? json['votingId']);
    final propertyUnitId =
        _toInt(json['property_unit_id'] ?? json['propertyUnitId']);
    final votingOptionId =
        _toInt(json['voting_option_id'] ?? json['votingOptionId']);
    if (id == null ||
        votingId == null ||
        propertyUnitId == null ||
        votingOptionId == null) {
      return null;
    }

    return HorizontalPropertyVotingVote(
      id: id,
      votingId: votingId,
      propertyUnitId: propertyUnitId,
      votingOptionId: votingOptionId,
      votedAt:
          _parseDateTime(json['voted_at']) ?? _parseDateTime(json['votedAt']),
      ipAddress: (json['ip_address'] ?? json['ipAddress']) as String?,
      userAgent: (json['user_agent'] ?? json['userAgent']) as String?,
    );
  }

  Map<String, dynamic>? _normalizeVotePayload(
    Map<String, dynamic> json,
  ) {
    if (json.containsKey('voting_option_id') ||
        json.containsKey('votingOptionId') ||
        json.containsKey('property_unit_id') ||
        json.containsKey('propertyUnitId')) {
      return json;
    }
    return null;
  }

  Map<String, dynamic>? _extractVoteMap(Map<String, dynamic> json) {
    final vote = json['vote'];
    if (vote is Map<String, dynamic>) {
      return _normalizeVotePayload(vote);
    }
    if (_normalizeVotePayload(json) != null) {
      return json;
    }
    final data = json['data'];
    if (data is Map<String, dynamic>) {
      return _normalizeVotePayload(data);
    }
    return null;
  }

  DateTime? _parseDateTime(dynamic value) {
    if (value == null) return null;
    if (value is DateTime) return value;
    if (value is String && value.isNotEmpty) {
      return DateTime.tryParse(value);
    }
    return null;
  }

  double? _toDouble(dynamic value) {
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }

  DateTime? _parseDate(String? value) {
    if (value == null || value.isEmpty) return null;
    return DateTime.tryParse(value);
  }

  Map<String, dynamic>? _withBusinessQuery([Map<String, dynamic>? query]) {
    final loginController = Get.isRegistered<LoginController>()
        ? Get.find<LoginController>()
        : null;

    final baseQuery = query == null
        ? <String, dynamic>{}
        : Map<String, dynamic>.from(query);

    final existingBusinessId = baseQuery['business_id'];
    if (existingBusinessId != null) {
      if (existingBusinessId is num && existingBusinessId > 0) {
        return baseQuery;
      }
      if (existingBusinessId is String) {
        final trimmed = existingBusinessId.trim();
        if (trimmed.isNotEmpty && trimmed != '0') {
          return baseQuery;
        }
      }
      baseQuery.remove('business_id');
    }

    final businessId = loginController?.selectedBusinessId;

    if (businessId == null) {
      return baseQuery.isEmpty ? null : baseQuery;
    }

    baseQuery['business_id'] = businessId;
    return baseQuery;
  }
}
