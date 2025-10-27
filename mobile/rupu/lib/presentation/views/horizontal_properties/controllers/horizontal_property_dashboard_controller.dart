import 'package:get/get.dart';

import '../horizontal_property_detail_controller.dart';
import 'horizontal_property_residents_controller.dart';
import 'horizontal_property_units_controller.dart';
import 'horizontal_property_voting_controller.dart';

class HorizontalPropertyDashboardController extends GetxController {
  final int propertyId;
  final String detailTag;
  final String unitsTag;
  final String residentsTag;
  final String votingTag;

  HorizontalPropertyDashboardController({
    required this.propertyId,
    required this.detailTag,
    required this.unitsTag,
    required this.residentsTag,
    required this.votingTag,
  });

  static String tagFor(int id) =>
      '${HorizontalPropertyDetailController.tagFor(id)}-dashboard';

  HorizontalPropertyDetailController get detailController =>
      Get.find<HorizontalPropertyDetailController>(tag: detailTag);

  HorizontalPropertyUnitsController get unitsController =>
      Get.find<HorizontalPropertyUnitsController>(tag: unitsTag);

  HorizontalPropertyResidentsController get residentsController =>
      Get.find<HorizontalPropertyResidentsController>(tag: residentsTag);

  HorizontalPropertyVotingController get votingController =>
      Get.find<HorizontalPropertyVotingController>(tag: votingTag);

  Future<void> refreshAll() => detailController.loadAll();
}
