import 'package:rupu/domain/entities/create_user_result.dart';
import 'package:rupu/domain/entities/user_detail.dart';
import 'package:rupu/domain/entities/user_list_item.dart';
import 'package:rupu/domain/entities/users_page.dart';
import '../models/create_user_response_model.dart';
import '../models/users_response_model.dart';

class UsersMapper {
  static UsersPage responseToEntity(UsersResponseModel model) => UsersPage(
        success: model.success,
        count: model.count,
        users: model.data.map(userModelToEntity).toList(),
      );

  static UserDetail userModelToDetail(UserModel model) {
    final base = userModelToEntity(model);
    return UserDetail(
      id: base.id,
      name: base.name,
      email: base.email,
      phone: base.phone,
      avatarUrl: base.avatarUrl,
      isActive: base.isActive,
      lastLoginAt: base.lastLoginAt,
      createdAt: base.createdAt,
      updatedAt: base.updatedAt,
      roles: base.roles,
      businesses: base.businesses,
    );
  }

  static UserListItem userModelToEntity(UserModel model) => UserListItem(
        id: model.id,
        name: model.name,
        email: model.email,
        phone: model.phone,
        avatarUrl: model.avatarUrl,
        isActive: model.isActive,
        lastLoginAt: model.lastLoginAt,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
        roles: model.roles.map(_roleModelToEntity).toList(),
        businesses: model.businesses.map(_businessModelToEntity).toList(),
      );

  static UserRoleSummary _roleModelToEntity(RoleModel model) => UserRoleSummary(
        id: model.id,
        name: model.name,
        code: model.code,
        description: model.description,
        level: model.level,
        isSystem: model.isSystem,
        scopeId: model.scopeId,
        scopeName: model.scopeName,
        scopeCode: model.scopeCode,
      );

  static UserBusinessSummary _businessModelToEntity(BusinessModel model) =>
      UserBusinessSummary(
        id: model.id,
        name: model.name,
        code: model.code,
        businessTypeId: model.businessTypeId,
        timezone: model.timezone,
        address: model.address,
        description: model.description,
        logoUrl: model.logoUrl,
        primaryColor: model.primaryColor,
        secondaryColor: model.secondaryColor,
        tertiaryColor: model.tertiaryColor,
        quaternaryColor: model.quaternaryColor,
        navbarImageUrl: model.navbarImageUrl,
        customDomain: model.customDomain,
        isActive: model.isActive,
        enableDelivery: model.enableDelivery,
        enablePickup: model.enablePickup,
        enableReservations: model.enableReservations,
        businessTypeName: model.businessTypeName,
        businessTypeCode: model.businessTypeCode,
      );

  static CreateUserResult createUserToEntity(CreateUserResponseModel model) =>
      CreateUserResult(
        success: model.success,
        email: model.email,
        password: model.password,
        message: model.message,
      );
}
