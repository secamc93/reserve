import 'horizontal_property_detail.dart';

class HorizontalPropertyCreateResult {
  final bool success;
  final String? message;
  final HorizontalPropertyDetail? property;

  const HorizontalPropertyCreateResult({
    required this.success,
    this.message,
    this.property,
  });
}
