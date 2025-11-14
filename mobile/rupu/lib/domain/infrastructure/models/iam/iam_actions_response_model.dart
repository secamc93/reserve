DateTime? _parseDate(String? value) {
  if (value == null || value.isEmpty) return null;
  return DateTime.tryParse(value);
}

class IamActionsResponseModel {
  final bool success;
  final List<IamActionModel> actions;
  final int total;
  final int page;
  final int pageSize;
  final int totalPages;

  IamActionsResponseModel({
    required this.success,
    required this.actions,
    required this.total,
    required this.page,
    required this.pageSize,
    required this.totalPages,
  });

  factory IamActionsResponseModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'];
    final actionsList = <IamActionModel>[];
    if (data is Map<String, dynamic>) {
      final resources = data['actions'];
      if (resources is List) {
        actionsList.addAll(
          resources
              .whereType<Map>()
              .map((item) =>
                  IamActionModel.fromJson(item.cast<String, dynamic>()))
              .toList(),
        );
      }
      return IamActionsResponseModel(
        success: json['success'] as bool? ?? false,
        actions: actionsList,
        total: (data['total'] as num?)?.toInt() ?? actionsList.length,
        page: (data['page'] as num?)?.toInt() ?? 1,
        pageSize: (data['page_size'] as num?)?.toInt() ?? actionsList.length,
        totalPages: (data['total_pages'] as num?)?.toInt() ?? 1,
      );
    }

    final resources = data is List ? data : json['actions'];
    if (resources is List) {
      actionsList.addAll(
        resources
            .whereType<Map>()
            .map((item) => IamActionModel.fromJson(item.cast<String, dynamic>()))
            .toList(),
      );
    }

    return IamActionsResponseModel(
      success: json['success'] as bool? ?? false,
      actions: actionsList,
      total: (json['total'] as num?)?.toInt() ?? actionsList.length,
      page: (json['page'] as num?)?.toInt() ?? 1,
      pageSize: (json['page_size'] as num?)?.toInt() ?? actionsList.length,
      totalPages: (json['total_pages'] as num?)?.toInt() ?? 1,
    );
  }
}

class IamActionModel {
  final int id;
  final String name;
  final String description;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  IamActionModel({
    required this.id,
    required this.name,
    required this.description,
    required this.createdAt,
    required this.updatedAt,
  });

  factory IamActionModel.fromJson(Map<String, dynamic> json) => IamActionModel(
        id: (json['id'] as num?)?.toInt() ?? 0,
        name: json['name'] as String? ?? '',
        description: json['description'] as String? ?? '',
        createdAt: _parseDate(json['created_at'] as String?),
        updatedAt: _parseDate(json['updated_at'] as String?),
      );
}
