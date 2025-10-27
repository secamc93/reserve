import 'package:get/get.dart';
import 'package:rupu/domain/entities/horizontal_property_detail.dart';
import 'package:rupu/domain/infrastructure/repositories/horizontal_properties_repository_impl.dart';
import 'package:rupu/domain/repositories/horizontal_properties_repository.dart';

import 'controllers/horizontal_property_residents_controller.dart';
import 'controllers/horizontal_property_units_controller.dart';
import 'controllers/horizontal_property_voting_controller.dart';

class HorizontalPropertyDetailController extends GetxController {
  final int propertyId;
  final HorizontalPropertiesRepository repository;

  HorizontalPropertyDetailController({
    required this.propertyId,
    HorizontalPropertiesRepository? repository,
  }) : repository = repository ?? HorizontalPropertiesRepositoryImpl();

  static String tagFor(int id) => 'horizontal-property-detail-$id';

  final detail = Rxn<HorizontalPropertyDetail>();
  final isLoading = false.obs;
  final errorMessage = RxnString();

  String get propertyName => detail.value?.name ?? 'Detalle propiedad';

  @override
  void onReady() {
    super.onReady();
    loadDetailOnly();
  }

  Future<void> loadDetailOnly() async {
    isLoading.value = true;
    errorMessage.value = null;

    await _loadDetail();

    isLoading.value = false;
  }

  Future<void> loadAll() async {
    isLoading.value = true;
    errorMessage.value = null;

    await _loadDetail();

    await Future.wait([
      _refreshUnitsController(),
      _refreshResidentsController(),
      _refreshVotingController(),
    ]);

    isLoading.value = false;
  }

  Future<void> _loadDetail() async {
    try {
      final result =
          await repository.getHorizontalPropertyDetail(id: propertyId);
      detail.value = result;
      if (result == null) {
        errorMessage.value ??=
            'No se encontró la información de la propiedad seleccionada.';
      }
    } catch (_) {
      detail.value = null;
      errorMessage.value ??=
          'No se pudo cargar la información de la propiedad. Intenta nuevamente.';
    }
  }

  Future<void> _refreshUnitsController() async {
    final tag = HorizontalPropertyUnitsController.tagFor(propertyId);
    if (Get.isRegistered<HorizontalPropertyUnitsController>(tag: tag)) {
      await Get.find<HorizontalPropertyUnitsController>(tag: tag).refresh();
    }
  }

  Future<void> _refreshResidentsController() async {
    final tag = HorizontalPropertyResidentsController.tagFor(propertyId);
    if (Get.isRegistered<HorizontalPropertyResidentsController>(tag: tag)) {
      await Get.find<HorizontalPropertyResidentsController>(tag: tag)
          .refresh();
    }
  }

  Future<void> _refreshVotingController() async {
    final tag = HorizontalPropertyVotingController.tagFor(propertyId);
    if (Get.isRegistered<HorizontalPropertyVotingController>(tag: tag)) {
      await Get.find<HorizontalPropertyVotingController>(tag: tag).refresh();
    }
  }
}
