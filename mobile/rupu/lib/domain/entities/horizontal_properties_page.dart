import 'horizontal_property.dart';

class HorizontalPropertiesPage {
  final bool success;
  final List<HorizontalProperty> properties;
  final int total;
  final int page;
  final int pageSize;
  final int totalPages;

  const HorizontalPropertiesPage({
    required this.success,
    required this.properties,
    required this.total,
    required this.page,
    required this.pageSize,
    required this.totalPages,
  });
}
