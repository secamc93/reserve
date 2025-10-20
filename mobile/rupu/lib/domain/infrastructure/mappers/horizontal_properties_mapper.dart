import 'package:rupu/domain/entities/horizontal_properties_page.dart';
import 'package:rupu/domain/entities/horizontal_property.dart';
import 'package:rupu/domain/infrastructure/models/horizontal_properties_response_model.dart';

class HorizontalPropertiesMapper {
  static HorizontalPropertiesPage responseToEntity(
    HorizontalPropertiesResponseModel model,
  ) {
    final page = model.data;
    return HorizontalPropertiesPage(
      success: model.success,
      message: model.message,
      properties: page?.data.map(_modelToEntity).toList() ?? const [],
      total: page?.total ?? 0,
      page: page?.page ?? 1,
      pageSize: page?.pageSize ?? 0,
      totalPages: page?.totalPages ?? 0,
    );
  }

  static HorizontalProperty _modelToEntity(HorizontalPropertyModel model) =>
      HorizontalProperty(
        id: model.id,
        name: model.name,
        code: model.code,
        businessTypeName: model.businessTypeName,
        address: model.address,
        totalUnits: model.totalUnits,
        isActive: model.isActive,
        createdAt: model.createdAt,
      );
}
