class HorizontalPropertyResidentsPage {
  final bool success;
  final String? message;
  final List<HorizontalPropertyResidentItem> residents;
  final int total;
  final int page;
  final int pageSize;
  final int totalPages;

  const HorizontalPropertyResidentsPage({
    required this.success,
    this.message,
    required this.residents,
    required this.total,
    required this.page,
    required this.pageSize,
    required this.totalPages,
  });
}

class HorizontalPropertyResidentItem {
  final int id;
  final String propertyUnitNumber;
  final String residentTypeName;
  final String name;
  final String email;
  final String phone;
  final bool isMainResident;
  final bool isActive;

  const HorizontalPropertyResidentItem({
    required this.id,
    required this.propertyUnitNumber,
    required this.residentTypeName,
    required this.name,
    required this.email,
    required this.phone,
    required this.isMainResident,
    required this.isActive,
  });
}
