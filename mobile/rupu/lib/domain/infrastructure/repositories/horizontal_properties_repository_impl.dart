import 'package:rupu/domain/datasource/horizontal_properties_datasource.dart';
import 'package:rupu/domain/entities/horizontal_properties_page.dart';
import 'package:rupu/domain/entities/horizontal_property_action_result.dart';
import 'package:rupu/domain/entities/horizontal_property_create_result.dart';
import 'package:rupu/domain/entities/horizontal_property_detail.dart';
import 'package:rupu/domain/entities/horizontal_property_update_result.dart';
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
  Future<HorizontalPropertyCreateResult> createHorizontalProperty({
    required Map<String, dynamic> data,
  }) async {
    final response = await datasource.createHorizontalProperty(data: data);
    return HorizontalPropertiesMapper.detailResponseToCreateResult(response);
  }

  @override
  Future<HorizontalPropertyActionResult> deleteHorizontalProperty({
    required int id,
  }) async {
    final response = await datasource.deleteHorizontalProperty(id: id);
    return HorizontalPropertiesMapper.simpleResponseToActionResult(response);
  }

  @override
  Future<HorizontalPropertyDetail?> getHorizontalPropertyDetail({
    required int id,
  }) async {
    final response = await datasource.getHorizontalPropertyDetail(id: id);
    return HorizontalPropertiesMapper.detailResponseToDetail(response);
  }

  @override
  Future<HorizontalPropertyUpdateResult> updateHorizontalProperty({
    required int id,
    required Map<String, dynamic> data,
  }) async {
    final response =
        await datasource.updateHorizontalProperty(id: id, data: data);
    return HorizontalPropertiesMapper.detailResponseToUpdateResult(response);
  }
}
