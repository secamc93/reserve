import 'package:get/get.dart';
import 'package:rupu/domain/datasource/horizontal_properties_datasource.dart';
import 'package:rupu/domain/entities/horizontal_properties_page.dart';
import 'package:rupu/domain/entities/horizontal_property_action_result.dart';
import 'package:rupu/domain/entities/horizontal_property_create_result.dart';
import 'package:rupu/domain/entities/horizontal_property_detail.dart';
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

  HorizontalPropertiesRepositoryImpl({HorizontalPropertiesDatasource? datasource})
      : datasource =
            datasource ?? HorizontalPropertiesDatasourceImpl();

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
  Future<HorizontalPropertyVotingGroupsResult> getHorizontalPropertyVotingGroups({
    required int id,
  }) async {
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
    final stream = datasource.subscribeToVotingLiveData(
      groupId: groupId,
      votingId: votingId,
      query: query,
    );
    return stream
        .map(_liveDataFromPayload)
        .whereType<HorizontalPropertyVotingGroupLiveData>();
  }

  HorizontalPropertyVotingGroupLiveData? _liveDataFromPayload(
    Map<String, dynamic> payload,
  ) {
    final data = payload['data'];
    if (data is! Map<String, dynamic>) {
      return null;
    }

    final unitsData = data['units'];
    final units = unitsData is List
        ? unitsData
            .whereType<Map<String, dynamic>>()
            .map(_liveUnitFromMap)
            .whereType<HorizontalPropertyVotingLiveUnit>()
            .toList(growable: false)
        : const <HorizontalPropertyVotingLiveUnit>[];

    return HorizontalPropertyVotingGroupLiveData(
      totalUnits: data['total_units'] as int? ?? units.length,
      unitsPending: data['units_pending'] as int? ?? 0,
      unitsVoted: data['units_voted'] as int? ?? 0,
      units: units,
    );
  }

  HorizontalPropertyVotingLiveUnit? _liveUnitFromMap(
    Map<String, dynamic> json,
  ) {
    final unitId = json['property_unit_id'] as int?;
    final unitNumber = json['property_unit_number'] as String?;
    if (unitId == null || unitNumber == null) {
      return null;
    }

    return HorizontalPropertyVotingLiveUnit(
      propertyUnitId: unitId,
      unitNumber: unitNumber,
      participationCoefficient:
          _toDouble(json['participation_coefficient']),
      residentId: json['resident_id'] as int?,
      residentName: json['resident_name'] as String?,
      hasVoted: json['has_voted'] as bool? ?? false,
      votingOptionId: json['voting_option_id'] as int?,
      optionText: json['option_text'] as String?,
      optionCode: json['option_code'] as String?,
      optionColor: json['option_color'] as String?,
      votedAt: _parseDate(json['voted_at'] as String?),
    );
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
    final loginController =
        Get.isRegistered<LoginController>() ? Get.find<LoginController>() : null;

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
