import '../infrastructure/models/horizontal_properties_response_model.dart';
import '../infrastructure/models/horizontal_property_detail_response_model.dart';
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
}
