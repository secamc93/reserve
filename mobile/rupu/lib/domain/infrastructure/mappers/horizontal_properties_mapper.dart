import 'package:rupu/domain/entities/horizontal_properties_page.dart';
import 'package:rupu/domain/entities/horizontal_property.dart';

import '../models/horizontal_properties_response_model.dart';

class HorizontalPropertiesMapper {
  static HorizontalPropertiesPage responseToEntity(
    HorizontalPropertiesResponseModel model,
  ) {
    return HorizontalPropertiesPage(
      success: model.success,
      properties: model.data.data.map(propertyModelToEntity).toList(),
      total: model.data.total,
      page: model.data.page,
      pageSize: model.data.pageSize,
      totalPages: model.data.totalPages,
    );
  }

  static HorizontalProperty propertyModelToEntity(HorizontalPropertyModel model) {
    return HorizontalProperty(
      id: model.id,
      name: model.name,
      code: model.code,
      businessTypeName: model.businessTypeName,
      address: model.address,
      totalUnits: model.totalUnits,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    );
  }
}
