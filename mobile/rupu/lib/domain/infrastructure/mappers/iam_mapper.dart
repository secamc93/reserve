import 'package:rupu/domain/entities/iam_action.dart';
import 'package:rupu/domain/entities/iam_business.dart';
import 'package:rupu/domain/entities/iam_business_type.dart';
import 'package:rupu/domain/entities/iam_pagination.dart';
import 'package:rupu/domain/entities/iam_resource.dart';
import 'package:rupu/domain/entities/iam_user.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_business_types_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_businesses_response_model.dart'
    as biz;
import 'package:rupu/domain/infrastructure/models/iam/iam_resources_response_model.dart'
    as res;
import 'package:rupu/domain/infrastructure/models/iam/iam_users_response_model.dart'
    as iam;
import 'package:rupu/domain/infrastructure/models/iam/iam_actions_response_model.dart'
    as act;

class IamMapper {
  static IamUsersPage usersResponseToEntity(iam.IamUsersResponseModel model) =>
      IamUsersPage(
        success: model.success,
        users: model.data.map(_userFromModel).toList(),
        pagination: _paginationFromModel(model.pagination.currentPage,
            model.pagination.perPage, model.pagination.total,
            lastPage: model.pagination.lastPage,
            hasNext: model.pagination.hasNext,
            hasPrev: model.pagination.hasPrev),
      );

  static IamResourcesPage resourcesResponseToEntity(
    res.IamResourcesResponseModel model,
  ) =>
      IamResourcesPage(
        success: model.success,
        resources: model.resources.map(_resourceFromModel).toList(),
        total: model.total,
        page: model.page,
        pageSize: model.pageSize,
        totalPages: model.totalPages,
      );

  static IamBusinessTypesResult businessTypesToEntity(
    IamBusinessTypesResponseModel model,
  ) =>
      IamBusinessTypesResult(
        success: model.success,
        types: model.data.map(_businessTypeFromModel).toList(),
      );

  static IamBusinessesPage businessesResponseToEntity(
    biz.IamBusinessesResponseModel model,
  ) =>
      IamBusinessesPage(
        success: model.success,
        businesses: model.data.map(_businessFromModel).toList(),
        pagination: _paginationFromModel(
          model.pagination.currentPage,
          model.pagination.perPage,
          model.pagination.total,
          lastPage: model.pagination.lastPage,
          hasNext: model.pagination.hasNext,
          hasPrev: model.pagination.hasPrev,
        ),
      );

  static IamActionsPage actionsResponseToEntity(act.IamActionsResponseModel model) =>
      IamActionsPage(
        success: model.success,
        actions: model.actions.map(_actionFromModel).toList(),
        total: model.total,
        page: model.page,
        pageSize: model.pageSize,
        totalPages: model.totalPages,
      );

  static IamUser _userFromModel(iam.IamUserModel model) => IamUser(
        id: model.id,
        name: model.name,
        email: model.email,
        phone: model.phone,
        avatarUrl: model.avatarUrl,
        isActive: model.isActive,
        isSuperUser: model.isSuperUser,
        lastLoginAt: model.lastLoginAt,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
        assignments: model.assignments.map(_assignmentFromModel).toList(),
      );

  static IamBusinessRoleAssignment _assignmentFromModel(
          iam.IamAssignmentModel model) =>
      IamBusinessRoleAssignment(
        businessId: model.businessId,
        businessName: model.businessName,
        roleId: model.roleId,
        roleName: model.roleName,
      );

  static IamResource _resourceFromModel(res.IamResourceModel model) =>
      IamResource(
        id: model.id,
        name: model.name,
        description: model.description,
        businessTypeId: model.businessTypeId,
        businessTypeName: model.businessTypeName,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
      );

  static IamResource resourceFromJson(Map<String, dynamic> json) =>
      _resourceFromModel(res.IamResourceModel.fromJson(json));

  static IamBusinessType _businessTypeFromModel(
          IamBusinessTypeModel model) =>
      IamBusinessType(
        id: model.id,
        name: model.name,
        code: model.code,
        description: model.description,
        icon: model.icon,
        isActive: model.isActive,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
      );

  static IamBusiness _businessFromModel(biz.IamBusinessModel model) =>
      IamBusiness(
        id: model.id,
        name: model.name,
        description: model.description,
        address: model.address,
        phone: model.phone,
        email: model.email,
        website: model.website,
        logoUrl: model.logoUrl,
        primaryColor: model.primaryColor,
        secondaryColor: model.secondaryColor,
        tertiaryColor: model.tertiaryColor,
        quaternaryColor: model.quaternaryColor,
        navbarImageUrl: model.navbarImageUrl,
        isActive: model.isActive,
        businessTypeId: model.businessTypeId,
        businessType: model.businessType,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
      );

  static IamAction _actionFromModel(act.IamActionModel model) => IamAction(
        id: model.id,
        name: model.name,
        description: model.description,
      );

  static IamPagination _paginationFromModel(
    int current,
    int perPage,
    int total, {
    required int lastPage,
    bool? hasNext,
    bool? hasPrev,
  }) =>
      IamPagination(
        currentPage: current,
        perPage: perPage,
        total: total,
        lastPage: lastPage,
        hasNext: hasNext ?? (current < lastPage),
        hasPrev: hasPrev ?? (current > 1),
      );
}
