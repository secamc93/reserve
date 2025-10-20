import 'package:rupu/domain/datasource/horizontal_properties_datasource.dart';
import 'package:rupu/domain/entities/horizontal_properties_page.dart';
import 'package:rupu/domain/entities/horizontal_property_action_result.dart';
import 'package:rupu/domain/infrastructure/datasources/horizontal_properties_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/mappers/horizontal_properties_mapper.dart';
import 'package:rupu/domain/repositories/horizontal_properties_repository.dart';

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
    final response = await datasource.getHorizontalProperties(query: query);
    return HorizontalPropertiesMapper.responseToEntity(response);
  }

  @override
  Future<HorizontalPropertyActionResult> deleteHorizontalProperty({
    required int id,
  }) async {
    final response = await datasource.deleteHorizontalProperty(id: id);
    return HorizontalPropertiesMapper.simpleResponseToActionResult(response);
  }
}
