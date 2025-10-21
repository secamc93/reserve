import 'package:rupu/domain/entities/horizontal_properties_page.dart';
import 'package:rupu/domain/entities/horizontal_property.dart';
import 'package:rupu/domain/entities/horizontal_property_action_result.dart';
import 'package:rupu/domain/entities/horizontal_property_create_result.dart';
import 'package:rupu/domain/entities/horizontal_property_detail.dart';

import '../models/horizontal_properties_response_model.dart';
import '../models/horizontal_property_detail_response_model.dart';
import '../models/simple_response_model.dart';

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

  static HorizontalPropertyActionResult simpleResponseToActionResult(
    SimpleResponseModel model,
  ) {
    return HorizontalPropertyActionResult(
      success: model.success,
      message: model.message,
    );
  }

  static HorizontalPropertyCreateResult detailResponseToCreateResult(
    HorizontalPropertyDetailResponseModel model,
  ) {
    return HorizontalPropertyCreateResult(
      success: model.success,
      message: model.message.isNotEmpty ? model.message : null,
      property:
          model.data != null ? detailModelToEntity(model.data!) : null,
    );
  }

  static HorizontalPropertyDetail detailModelToEntity(
    HorizontalPropertyDetailModel model,
  ) {
    return HorizontalPropertyDetail(
      id: model.id,
      name: model.name,
      code: model.code,
      description: model.description,
      address: model.address,
      timezone: model.timezone,
      businessTypeId: model.businessTypeId,
      businessTypeName: model.businessTypeName,
      parentBusinessId: model.parentBusinessId,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      totalUnits: model.totalUnits,
      totalFloors: model.totalFloors,
      hasElevator: model.hasElevator,
      hasParking: model.hasParking,
      hasPool: model.hasPool,
      hasGym: model.hasGym,
      hasSocialArea: model.hasSocialArea,
      logoUrl: model.logoUrl,
      navbarImageUrl: model.navbarImageUrl,
      customDomain: model.customDomain,
      primaryColor: model.primaryColor,
      secondaryColor: model.secondaryColor,
      tertiaryColor: model.tertiaryColor,
      quaternaryColor: model.quaternaryColor,
      committees:
          model.committees.map(committeeModelToEntity).toList(growable: false),
      propertyUnits:
          model.propertyUnits.map(unitModelToEntity).toList(growable: false),
    );
  }

  static HorizontalPropertyCommittee committeeModelToEntity(
    HorizontalPropertyCommitteeModel model,
  ) {
    return HorizontalPropertyCommittee(
      id: model.id,
      name: model.name,
      typeName: model.typeName,
      typeCode: model.typeCode,
      committeeTypeId: model.committeeTypeId,
      isActive: model.isActive,
      startDate: model.startDate,
      endDate: model.endDate,
      notes: model.notes,
    );
  }

  static HorizontalPropertyUnit unitModelToEntity(
    HorizontalPropertyUnitModel model,
  ) {
    return HorizontalPropertyUnit(
      id: model.id,
      number: model.number,
      block: model.block,
      floor: model.floor,
      area: model.area,
      bedrooms: model.bedrooms,
      bathrooms: model.bathrooms,
      description: model.description,
      unitType: model.unitType,
      isActive: model.isActive,
    );
  }
}
