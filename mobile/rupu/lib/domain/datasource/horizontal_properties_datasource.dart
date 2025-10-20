import '../infrastructure/models/horizontal_properties_response_model.dart';
import '../infrastructure/models/simple_response_model.dart';

abstract class HorizontalPropertiesDatasource {
  Future<HorizontalPropertiesResponseModel> getHorizontalProperties({
    Map<String, dynamic>? query,
  });

  Future<SimpleResponseModel> deleteHorizontalProperty({
    required int id,
  });
}
