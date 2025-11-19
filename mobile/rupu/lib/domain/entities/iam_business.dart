import 'iam_pagination.dart';

class IamBusiness {
  final int id;
  final String name;
  final String code;
  final String description;
  final String address;
  final String phone;
  final String email;
  final String website;
  final String logoUrl;
  final String primaryColor;
  final String secondaryColor;
  final String tertiaryColor;
  final String quaternaryColor;
  final String navbarImageUrl;
  final bool isActive;
  final int businessTypeId;
  final String businessType;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const IamBusiness({
    required this.id,
    required this.name,
    required this.code,
    required this.description,
    required this.address,
    required this.phone,
    required this.email,
    required this.website,
    required this.logoUrl,
    required this.primaryColor,
    required this.secondaryColor,
    required this.tertiaryColor,
    required this.quaternaryColor,
    required this.navbarImageUrl,
    required this.isActive,
    required this.businessTypeId,
    required this.businessType,
    this.createdAt,
    this.updatedAt,
  });
}

class IamBusinessConfiguredResource {
  final int id;
  final int resourceId;
  final int businessId;
  final String name;
  final String? code;
  final String? description;
  final bool isActive;

  const IamBusinessConfiguredResource({
    required this.id,
    required this.resourceId,
    required this.businessId,
    required this.name,
    this.code,
    this.description,
    required this.isActive,
  });

  IamBusinessConfiguredResource copyWith({bool? isActive}) {
    return IamBusinessConfiguredResource(
      id: id,
      resourceId: resourceId,
      businessId: businessId,
      name: name,
      code: code,
      description: description,
      isActive: isActive ?? this.isActive,
    );
  }
}

class IamBusinessesPage {
  final bool success;
  final List<IamBusiness> businesses;
  final IamPagination pagination;

  const IamBusinessesPage({
    required this.success,
    required this.businesses,
    required this.pagination,
  });
}
