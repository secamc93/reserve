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

abstract class HorizontalPropertiesRepository {
  Future<HorizontalPropertiesPage> getHorizontalProperties({
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyCreateResult> createHorizontalProperty({
    required Map<String, dynamic> data,
  });

  Future<HorizontalPropertyActionResult> deleteHorizontalProperty({
    required int id,
  });

  Future<HorizontalPropertyDetail?> getHorizontalPropertyDetail({
    required int id,
  });

  Future<HorizontalPropertyUpdateResult> updateHorizontalProperty({
    required int id,
    required Map<String, dynamic> data,
    String? logoFilePath,
    String? logoFileName,
    String? navbarImagePath,
    String? navbarImageFileName,
  });

  Future<HorizontalPropertyUnitsPage> getHorizontalPropertyUnits({
    required int id,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyUnitDetailResult> getHorizontalPropertyUnitDetail({
    required int unitId,
  });

  Future<HorizontalPropertyUnitDetailResult> createHorizontalPropertyUnit({
    required int propertyId,
    required Map<String, dynamic> data,
  });

  Future<HorizontalPropertyUnitDetailResult> updateHorizontalPropertyUnit({
    required int propertyId,
    required int unitId,
    required Map<String, dynamic> data,
  });

  Future<HorizontalPropertyActionResult> deleteHorizontalPropertyUnit({
    required int propertyId,
    required int unitId,
  });

  Future<HorizontalPropertyResidentsPage> getHorizontalPropertyResidents({
    required int id,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyVotingGroupsResult> getHorizontalPropertyVotingGroups({
    required int id,
  });

  Future<HorizontalPropertyVotingGroupActionResult> createHorizontalPropertyVotingGroup({
    required int businessId,
    required Map<String, dynamic> data,
  });

  Future<HorizontalPropertyVotingGroupActionResult> updateHorizontalPropertyVotingGroup({
    required int businessId,
    required int groupId,
    required Map<String, dynamic> data,
  });

  Future<HorizontalPropertyActionResult> deleteHorizontalPropertyVotingGroup({
    required int businessId,
    required int groupId,
  });

  Future<HorizontalPropertyVotingListResult> getHorizontalPropertyVotings({
    required int businessId,
    required int groupId,
  });

  Future<HorizontalPropertyVotingActionResult> createHorizontalPropertyVoting({
    required int businessId,
    required int groupId,
    required Map<String, dynamic> data,
  });

  Future<HorizontalPropertyVotingActionResult> updateHorizontalPropertyVoting({
    required int businessId,
    required int groupId,
    required int votingId,
    required Map<String, dynamic> data,
  });

  Future<HorizontalPropertyActionResult> deleteHorizontalPropertyVoting({
    required int businessId,
    required int groupId,
    required int votingId,
  });

  Future<HorizontalPropertyActionResult> activateHorizontalPropertyVoting({
    required int businessId,
    required int groupId,
    required int votingId,
  });

  Future<HorizontalPropertyActionResult> deactivateHorizontalPropertyVoting({
    required int businessId,
    required int groupId,
    required int votingId,
  });

  Future<HorizontalPropertyVotingOptionListResult> getHorizontalPropertyVotingOptions({
    required int businessId,
    required int groupId,
    required int votingId,
  });

  Future<HorizontalPropertyVotingOptionActionResult> createHorizontalPropertyVotingOption({
    required int businessId,
    required int groupId,
    required int votingId,
    required Map<String, dynamic> data,
  });

  Future<HorizontalPropertyActionResult> deleteHorizontalPropertyVotingOption({
    required int businessId,
    required int groupId,
    required int votingId,
    required int optionId,
  });

  Future<HorizontalPropertyVotingVotesResult> getHorizontalPropertyVotingVotes({
    required int businessId,
    required int groupId,
    required int votingId,
  });

  Future<HorizontalPropertyVotingDetailsResult> getHorizontalPropertyVotingDetails({
    required int businessId,
    required int groupId,
    required int votingId,
  });

  Future<HorizontalPropertyActionResult> createHorizontalPropertyVote({
    required int businessId,
    required int groupId,
    required int votingId,
    required Map<String, dynamic> data,
  });

  Future<HorizontalPropertyActionResult> deleteHorizontalPropertyVote({
    required int businessId,
    required int groupId,
    required int votingId,
    required int voteId,
  });

  Stream<HorizontalPropertyVotingGroupLiveData> subscribeToVotingLiveData({
    required int businessId,
    required int groupId,
    required int votingId,
  });
}
