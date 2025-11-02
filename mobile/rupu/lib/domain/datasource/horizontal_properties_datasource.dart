import '../infrastructure/models/horizontal_properties_response_model.dart';
import '../infrastructure/models/horizontal_property_detail_response_model.dart';
import '../infrastructure/models/horizontal_property_residents_response_model.dart';
import '../infrastructure/models/horizontal_property_unit_detail_response_model.dart';
import '../infrastructure/models/horizontal_property_units_response_model.dart';
import '../infrastructure/models/horizontal_property_voting_groups_response_model.dart';
import '../infrastructure/models/simple_response_model.dart';

abstract class HorizontalPropertiesDatasource {
  Future<HorizontalPropertiesResponseModel> getHorizontalProperties({
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyDetailResponseModel> createHorizontalProperty({
    required Map<String, dynamic> data,
  });

  Future<SimpleResponseModel> deleteHorizontalProperty({
    required int id,
  });

  Future<HorizontalPropertyDetailResponseModel> getHorizontalPropertyDetail({
    required int id,
  });

  Future<HorizontalPropertyDetailResponseModel> updateHorizontalProperty({
    required int id,
    required Map<String, dynamic> data,
    String? logoFilePath,
    String? logoFileName,
    String? navbarImagePath,
    String? navbarImageFileName,
  });

  Future<HorizontalPropertyUnitsResponseModel> getHorizontalPropertyUnits({
    required int id,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyUnitDetailResponseModel> getHorizontalPropertyUnitDetail({
    required int unitId,
  });

  Future<HorizontalPropertyResidentsResponseModel> getHorizontalPropertyResidents({
    required int id,
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyVotingGroupsResponseModel>
      getHorizontalPropertyVotingGroups({
    required int id,
  });
}
