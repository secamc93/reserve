import 'horizontal_property_detail.dart';

class HorizontalPropertyUpdateResult {
  final bool success;
  final String? message;
  final HorizontalPropertyDetail? property;

  const HorizontalPropertyUpdateResult({
    required this.success,
    this.message,
    this.property,
  });
}

