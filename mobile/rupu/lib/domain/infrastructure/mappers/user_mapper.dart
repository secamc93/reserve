import 'package:rupu/domain/entities/user.dart';
import 'package:rupu/domain/infrastructure/models/login_response_model.dart';

class UserMapper {
  /// Mapea el JSON de la respuesta de login a [AuthSession].
  static User loginUserToEntity(LoginResponseModel user) => User(
    id: user.data.user.id,
    name: user.data.user.name,
    email: user.data.user.email,
    phone: user.data.user.phone,
    avatarUrl: user.data.user.avatarUrl,
    isActive: user.data.user.isActive,
    lastLoginAt: user.data.user.lastLoginAt,
    token: user.data.token,
    requirePasswordChange: user.data.requirePasswordChange,
    scope: user.data.scope,
    isSuperAdmin: user.data.isSuperAdmin,
    businesses: user.data.businesses
        .map(
          (b) => Business(
            id: b.id,
            name: b.name,
            code: b.code,
            businessTypeId: b.businessTypeId,
            businessType: BusinessType(
              id: b.businessType.id,
              name: b.businessType.name,
              code: b.businessType.code,
              description: b.businessType.description,
              icon: b.businessType.icon,
            ),
            timezone: b.timezone,
            address: b.address,
            description: b.description,
            logoUrl: b.logoUrl,
            primaryColor: b.primaryColor,
            secondaryColor: b.secondaryColor,
            tertiaryColor: b.tertiaryColor,
            quaternaryColor: b.quaternaryColor,
            navbarImageUrl: b.navbarImageUrl,
            customDomain: b.customDomain,
            isActive: b.isActive,
            enableDelivery: b.enableDelivery,
            enablePickup: b.enablePickup,
            enableReservations: b.enableReservations,
          ),
        )
        .toList(),
  );
}
