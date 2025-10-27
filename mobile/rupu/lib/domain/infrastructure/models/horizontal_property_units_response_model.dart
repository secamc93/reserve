class HorizontalPropertyUnitsResponseModel {
  final bool success;
  final String message;
  final HorizontalPropertyUnitsDataModel data;

  HorizontalPropertyUnitsResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory HorizontalPropertyUnitsResponseModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return HorizontalPropertyUnitsResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: HorizontalPropertyUnitsDataModel.fromJson(
        json['data'] as Map<String, dynamic>? ?? const {},
      ),
    );
  }
}

class HorizontalPropertyUnitsDataModel {
  final List<HorizontalPropertyUnitItemModel> units;
  final int total;
  final int page;
  final int pageSize;
  final int totalPages;

  HorizontalPropertyUnitsDataModel({
    required this.units,
    required this.total,
    required this.page,
    required this.pageSize,
    required this.totalPages,
  });

  factory HorizontalPropertyUnitsDataModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final units = json['units'];
    return HorizontalPropertyUnitsDataModel(
      units: units is List
          ? units
              .whereType<Map<String, dynamic>>()
              .map(HorizontalPropertyUnitItemModel.fromJson)
              .toList()
          : const [],
      total: json['total'] as int? ?? 0,
      page: json['page'] as int? ?? 1,
      pageSize: json['page_size'] as int? ?? 0,
      totalPages: json['total_pages'] as int? ?? 0,
    );
  }
}

class HorizontalPropertyUnitItemModel {
  final int id;
  final String number;
  final String block;
  final String unitType;
  final double? participationCoefficient;
  final bool isActive;

  HorizontalPropertyUnitItemModel({
    required this.id,
    required this.number,
    required this.block,
    required this.unitType,
    required this.participationCoefficient,
    required this.isActive,
  });

  factory HorizontalPropertyUnitItemModel.fromJson(Map<String, dynamic> json) {
    final participation = json['participation_coefficient'];
    return HorizontalPropertyUnitItemModel(
      id: json['id'] as int? ?? 0,
      number: json['number'] as String? ?? '',
      block: json['block'] as String? ?? '',
      unitType: json['unit_type'] as String? ?? '',
      participationCoefficient: participation is num
          ? participation.toDouble()
          : double.tryParse(participation?.toString() ?? ''),
      isActive: json['is_active'] as bool? ?? false,
    );
  }
}
