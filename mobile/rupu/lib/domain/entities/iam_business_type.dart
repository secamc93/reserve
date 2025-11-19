class IamBusinessType {
  final int id;
  final String name;
  final String code;
  final String description;
  final String icon;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const IamBusinessType({
    required this.id,
    required this.name,
    required this.code,
    required this.description,
    required this.icon,
    required this.isActive,
    this.createdAt,
    this.updatedAt,
  });
}

class IamBusinessTypesResult {
  final bool success;
  final List<IamBusinessType> types;

  const IamBusinessTypesResult({
    required this.success,
    required this.types,
  });
}

class IamBusinessTypeMutationResult {
  final bool success;
  final String message;
  final IamBusinessType? type;

  const IamBusinessTypeMutationResult({
    required this.success,
    required this.message,
    this.type,
  });
}
