import 'package:rupu/domain/entities/horizontal_properties_page.dart';
import 'package:rupu/domain/entities/horizontal_property.dart';
import 'package:rupu/domain/entities/horizontal_property_action_result.dart';
import 'package:rupu/domain/entities/horizontal_property_create_result.dart';
import 'package:rupu/domain/entities/horizontal_property_detail.dart';
import 'package:rupu/domain/entities/horizontal_property_residents_page.dart';
import 'package:rupu/domain/entities/horizontal_property_units_page.dart';
import 'package:rupu/domain/entities/horizontal_property_update_result.dart';
import 'package:rupu/domain/entities/horizontal_property_voting_groups.dart';

import '../models/horizontal_properties_response_model.dart';
import '../models/horizontal_property_detail_response_model.dart';
import '../models/horizontal_property_residents_response_model.dart';
import '../models/horizontal_property_units_response_model.dart';
import '../models/horizontal_property_voting_groups_response_model.dart';
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
      businessId: model.businessId,
      address: model.address,
      totalUnits: model.totalUnits,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      logoUrl: model.logoUrl,
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

  static HorizontalPropertyUpdateResult detailResponseToUpdateResult(
    HorizontalPropertyDetailResponseModel model,
  ) {
    return HorizontalPropertyUpdateResult(
      success: model.success,
      message: model.message.isNotEmpty ? model.message : null,
      property:
          model.data != null ? detailModelToEntity(model.data!) : null,
    );
  }

  static HorizontalPropertyDetail? detailResponseToDetail(
    HorizontalPropertyDetailResponseModel model,
  ) {
    return model.data != null ? detailModelToEntity(model.data!) : null;
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

  static HorizontalPropertyUnitsPage unitsResponseToEntity(
    HorizontalPropertyUnitsResponseModel model,
  ) {
    return HorizontalPropertyUnitsPage(
      success: model.success,
      message: model.message.isNotEmpty ? model.message : null,
      units:
          model.data.units.map(unitItemModelToEntity).toList(growable: false),
      total: model.data.total,
      page: model.data.page,
      pageSize: model.data.pageSize,
      totalPages: model.data.totalPages,
    );
  }

  static HorizontalPropertyUnitItem unitItemModelToEntity(
    HorizontalPropertyUnitItemModel model,
  ) {
    return HorizontalPropertyUnitItem(
      id: model.id,
      number: model.number,
      block: model.block,
      unitType: model.unitType,
      participationCoefficient: model.participationCoefficient,
      isActive: model.isActive,
    );
  }

  static HorizontalPropertyResidentsPage residentsResponseToEntity(
    HorizontalPropertyResidentsResponseModel model,
  ) {
    return HorizontalPropertyResidentsPage(
      success: model.success,
      message: model.message.isNotEmpty ? model.message : null,
      residents: model.data.residents
          .map(residentItemModelToEntity)
          .toList(growable: false),
      total: model.data.total,
      page: model.data.page,
      pageSize: model.data.pageSize,
      totalPages: model.data.totalPages,
    );
  }

  static HorizontalPropertyResidentItem residentItemModelToEntity(
    HorizontalPropertyResidentItemModel model,
  ) {
    return HorizontalPropertyResidentItem(
      id: model.id,
      propertyUnitNumber: model.propertyUnitNumber,
      residentTypeName: model.residentTypeName,
      name: model.name,
      email: model.email,
      phone: model.phone,
      isMainResident: model.isMainResident,
      isActive: model.isActive,
    );
  }

  static HorizontalPropertyVotingGroupsResult votingGroupsResponseToEntity(
    HorizontalPropertyVotingGroupsResponseModel model,
  ) {
    return HorizontalPropertyVotingGroupsResult(
      success: model.success,
      message: model.message.isNotEmpty ? model.message : null,
      groups: model.data
          .map(votingGroupModelToEntity)
          .toList(growable: false),
    );
  }

  static HorizontalPropertyVotingGroup votingGroupModelToEntity(
    HorizontalPropertyVotingGroupModel model,
  ) {
    return HorizontalPropertyVotingGroup(
      id: model.id,
      businessId: model.businessId,
      name: model.name,
      description: model.description,
      votingStartDate: model.votingStartDate,
      votingEndDate: model.votingEndDate,
      isActive: model.isActive,
      requiresQuorum: model.requiresQuorum,
      quorumPercentage: model.quorumPercentage,
      createdByUserId: model.createdByUserId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    );
  }
}
