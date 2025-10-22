import 'package:get/get.dart';
import 'package:rupu/domain/entities/horizontal_property_detail.dart';
import 'package:rupu/domain/entities/horizontal_property_residents_page.dart';
import 'package:rupu/domain/entities/horizontal_property_units_page.dart';
import 'package:rupu/domain/entities/horizontal_property_voting_groups.dart';
import 'package:rupu/domain/infrastructure/repositories/horizontal_properties_repository_impl.dart';
import 'package:rupu/domain/repositories/horizontal_properties_repository.dart';

class HorizontalPropertyDetailController extends GetxController {
  final int propertyId;
  final HorizontalPropertiesRepository repository;

  HorizontalPropertyDetailController({
    required this.propertyId,
    HorizontalPropertiesRepository? repository,
  }) : repository = repository ?? HorizontalPropertiesRepositoryImpl();

  static String tagFor(int id) => 'horizontal-property-detail-$id';

  final detail = Rxn<HorizontalPropertyDetail>();
  final unitsPage = Rxn<HorizontalPropertyUnitsPage>();
  final residentsPage = Rxn<HorizontalPropertyResidentsPage>();
  final votingGroups = <HorizontalPropertyVotingGroup>[].obs;

  final isLoading = false.obs;
  final errorMessage = RxnString();

  String get propertyName => detail.value?.name ?? 'Detalle propiedad';
  int? get unitsTotal => unitsPage.value?.total;
  int? get residentsTotal => residentsPage.value?.total;
  int? get firstVotingGroupId =>
      votingGroups.isNotEmpty ? votingGroups.first.id : null;

  @override
  void onReady() {
    super.onReady();
    loadAll();
  }

  Future<void> loadAll() async {
    isLoading.value = true;
    errorMessage.value = null;

    await _loadDetail();
    await Future.wait([
      _loadUnits(),
      _loadResidents(),
      _loadVotingGroups(),
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

  Future<void> _loadUnits() async {
    try {
      final result = await repository.getHorizontalPropertyUnits(
        id: propertyId,
      );
      unitsPage.value = result;
    } catch (_) {
      unitsPage.value = null;
      errorMessage.value ??=
          'No se pudo cargar la información de unidades de la propiedad.';
    }
  }

  Future<void> _loadResidents() async {
    try {
      final result = await repository.getHorizontalPropertyResidents(
        id: propertyId,
      );
      residentsPage.value = result;
    } catch (_) {
      residentsPage.value = null;
      errorMessage.value ??=
          'No se pudo cargar la información de residentes de la propiedad.';
    }
  }

  Future<void> _loadVotingGroups() async {
    try {
      final result = await repository.getHorizontalPropertyVotingGroups(
        id: propertyId,
      );
      votingGroups.assignAll(result.groups);
    } catch (_) {
      votingGroups.clear();
      errorMessage.value ??=
          'No se pudo cargar la información de votaciones de la propiedad.';
    }
  }
}
