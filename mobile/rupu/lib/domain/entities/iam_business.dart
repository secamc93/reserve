import 'iam_pagination.dart';

class IamBusiness {
  final int id;
  final String name;
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
