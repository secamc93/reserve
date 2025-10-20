import 'package:rupu/domain/datasource/horizontal_properties_datasource.dart';
import 'package:rupu/domain/entities/horizontal_properties_page.dart';
import 'package:rupu/domain/infrastructure/mappers/horizontal_properties_mapper.dart';
import 'package:rupu/domain/repositories/horizontal_properties_repository.dart';

class HorizontalPropertiesRepositoryImpl extends HorizontalPropertiesRepository {
  final HorizontalPropertiesDatasource datasource;

  HorizontalPropertiesRepositoryImpl(this.datasource);

  @override
  Future<HorizontalPropertiesPage> getHorizontalProperties({
    Map<String, dynamic>? query,
  }) async {
    final response = await datasource.getHorizontalProperties(query: query);
    return HorizontalPropertiesMapper.responseToEntity(response);
  }
}
