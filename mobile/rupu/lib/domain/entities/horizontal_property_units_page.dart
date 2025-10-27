class HorizontalPropertyUnitsPage {
  final bool success;
  final String? message;
  final List<HorizontalPropertyUnitItem> units;
  final int total;
  final int page;
  final int pageSize;
  final int totalPages;

  const HorizontalPropertyUnitsPage({
    required this.success,
    this.message,
    required this.units,
    required this.total,
    required this.page,
    required this.pageSize,
    required this.totalPages,
  });

  int get totalUnits => total;
}

class HorizontalPropertyUnitItem {
  final int id;
  final String number;
  final String block;
  final String unitType;
  final double? participationCoefficient;
  final bool isActive;

  const HorizontalPropertyUnitItem({
    required this.id,
    required this.number,
    required this.block,
    required this.unitType,
    required this.participationCoefficient,
    required this.isActive,
  });
}
