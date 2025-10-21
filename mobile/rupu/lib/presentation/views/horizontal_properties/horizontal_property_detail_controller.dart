import 'package:get/get.dart';

class HorizontalPropertyDetailController extends GetxController {
  final int propertyId;

  HorizontalPropertyDetailController({required this.propertyId});

  static String tagFor(int id) => 'horizontal-property-detail-$id';
}
