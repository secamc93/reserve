/// Entidad de dominio que representa al usuario autenticado.
class User {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String avatarUrl;
  final bool isActive;
  final String lastLoginAt;
  final String token;
  final bool requirePasswordChange;
  final List<Business> businesses;
  final String scope;
  final bool isSuperAdmin;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.avatarUrl,
    required this.isActive,
    required this.lastLoginAt,
    required this.token,
    required this.requirePasswordChange,
    required this.businesses,
    required this.scope,
    required this.isSuperAdmin,
  });
}

class Business {
  final int id;
  final String name;
  final String code;
  final int businessTypeId;
  final BusinessType businessType;
  final String timezone;
  final String address;
  final String description;
  final String logoUrl;
  final String primaryColor;
  final String secondaryColor;
  final String tertiaryColor;
  final String quaternaryColor;
  final String navbarImageUrl;
  final String customDomain;
  final bool isActive;
  final bool enableDelivery;
  final bool enablePickup;
  final bool enableReservations;

  Business({
    required this.id,
    required this.name,
    required this.code,
    required this.businessTypeId,
    required this.businessType,
    required this.timezone,
    required this.address,
    required this.description,
    required this.logoUrl,
    required this.primaryColor,
    required this.secondaryColor,
    required this.tertiaryColor,
    required this.quaternaryColor,
    required this.navbarImageUrl,
    required this.customDomain,
    required this.isActive,
    required this.enableDelivery,
    required this.enablePickup,
    required this.enableReservations,
  });
}

class BusinessType {
  final int id;
  final String name;
  final String code;
  final String description;
  final String icon;

  BusinessType({
    required this.id,
    required this.name,
    required this.code,
    required this.description,
    required this.icon,
  });
}
