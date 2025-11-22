import '../infrastructure/models/horizontal_properties_response_model.dart';
import '../infrastructure/models/horizontal_property_detail_response_model.dart';
import '../infrastructure/models/horizontal_property_resident_detail_response_model.dart';
import '../infrastructure/models/horizontal_property_residents_response_model.dart';
import '../infrastructure/models/horizontal_property_unit_detail_response_model.dart';
import '../infrastructure/models/horizontal_property_units_response_model.dart';
import '../infrastructure/models/horizontal_property_voting_details_response_model.dart';
import '../infrastructure/models/horizontal_property_voting_groups_response_model.dart';
import '../infrastructure/models/horizontal_property_voting_models.dart';
import '../infrastructure/models/simple_response_model.dart';

abstract class HorizontalPropertiesDatasource {
  Future<HorizontalPropertiesResponseModel> getHorizontalProperties({
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyDetailResponseModel> createHorizontalProperty({
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  });

  Future<SimpleResponseModel> deleteHorizontalProperty({
    required int id,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyDetailResponseModel> getHorizontalPropertyDetail({
    required int id,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyDetailResponseModel> updateHorizontalProperty({
    required int id,
    required Map<String, dynamic> data,
    String? logoFilePath,
    String? logoFileName,
    String? navbarImagePath,
    String? navbarImageFileName,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyUnitsResponseModel> getHorizontalPropertyUnits({
    required int id,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyUnitDetailResponseModel>
      getHorizontalPropertyUnitDetail({
    required int unitId,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyUnitDetailResponseModel>
      createHorizontalPropertyUnit({
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyUnitDetailResponseModel>
      updateHorizontalPropertyUnit({
    required int unitId,
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  });

  Future<SimpleResponseModel> deleteHorizontalPropertyUnit({
    required int unitId,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyResidentsResponseModel> getHorizontalPropertyResidents({
    required int id,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyResidentDetailResponseModel>
      getHorizontalPropertyResidentDetail({
    required int residentId,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyResidentDetailResponseModel>
      createHorizontalPropertyResident({
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyResidentDetailResponseModel>
      updateHorizontalPropertyResident({
    required int residentId,
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyVotingGroupsResponseModel>
      getHorizontalPropertyVotingGroups({
    required int id,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyVotingGroupActionResponseModel>
      createHorizontalPropertyVotingGroup({
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyVotingGroupActionResponseModel>
      updateHorizontalPropertyVotingGroup({
    required int groupId,
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  });

  Future<SimpleResponseModel> deleteHorizontalPropertyVotingGroup({
    required int groupId,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyVotingsResponseModel> getHorizontalPropertyVotings({
    required int groupId,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyVotingActionResponseModel> createHorizontalPropertyVoting({
    required int groupId,
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyVotingActionResponseModel> updateHorizontalPropertyVoting({
    required int groupId,
    required int votingId,
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  });

  Future<SimpleResponseModel> deleteHorizontalPropertyVoting({
    required int groupId,
    required int votingId,
    Map<String, dynamic>? query,
  });

  Future<SimpleResponseModel> activateHorizontalPropertyVoting({
    required int groupId,
    required int votingId,
    Map<String, dynamic>? query,
  });

  Future<SimpleResponseModel> deactivateHorizontalPropertyVoting({
    required int groupId,
    required int votingId,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyVotingOptionsResponseModel>
      getHorizontalPropertyVotingOptions({
    required int groupId,
    required int votingId,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyVotingOptionActionResponseModel>
      createHorizontalPropertyVotingOption({
    required int groupId,
    required int votingId,
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  });

  Future<SimpleResponseModel> deleteHorizontalPropertyVotingOption({
    required int groupId,
    required int votingId,
    required int optionId,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyVotingVotesResponseModel> getHorizontalPropertyVotingVotes({
    required int groupId,
    required int votingId,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyVotingDetailsResponseModel>
      getHorizontalPropertyVotingDetails({
    required int groupId,
    required int votingId,
    Map<String, dynamic>? query,
  });

  Future<SimpleResponseModel> createHorizontalPropertyVote({
    required int groupId,
    required int votingId,
    required Map<String, dynamic> data,
    Map<String, dynamic>? query,
  });

  Future<SimpleResponseModel> deleteHorizontalPropertyVote({
    required int groupId,
    required int votingId,
    required int voteId,
    Map<String, dynamic>? query,
  });

  Stream<Map<String, dynamic>> subscribeToVotingLiveData({
    required int groupId,
    required int votingId,
    Map<String, dynamic>? query,
  });
}
