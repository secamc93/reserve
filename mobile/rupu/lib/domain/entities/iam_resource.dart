class IamResource {
  final int id;
  final String name;
  final String description;
  final int businessTypeId;
  final String businessTypeName;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const IamResource({
    required this.id,
    required this.name,
    required this.description,
    required this.businessTypeId,
    required this.businessTypeName,
    this.createdAt,
    this.updatedAt,
  });
}

class IamResourcesPage {
  final bool success;
  final List<IamResource> resources;
  final int total;
  final int page;
  final int pageSize;
  final int totalPages;

  const IamResourcesPage({
    required this.success,
    required this.resources,
    required this.total,
    required this.page,
    required this.pageSize,
    required this.totalPages,
  });
}
