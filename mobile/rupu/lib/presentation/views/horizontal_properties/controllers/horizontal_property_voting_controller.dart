import 'package:get/get.dart';
import 'package:rupu/domain/entities/horizontal_property_voting_groups.dart';
import 'package:rupu/domain/infrastructure/repositories/horizontal_properties_repository_impl.dart';
import 'package:rupu/domain/repositories/horizontal_properties_repository.dart';

import '../horizontal_property_detail_controller.dart';

class HorizontalPropertyVotingController extends GetxController {
  final int propertyId;
  final HorizontalPropertiesRepository repository;

  HorizontalPropertyVotingController({
    required this.propertyId,
    HorizontalPropertiesRepository? repository,
  }) : repository = repository ?? HorizontalPropertiesRepositoryImpl();

  static String tagFor(int id) =>
      '${HorizontalPropertyDetailController.tagFor(id)}-voting';

  final groups = <HorizontalPropertyVotingGroup>[].obs;
  final isLoading = false.obs;
  final errorMessage = RxnString();

  int? get firstVotingGroupId =>
      groups.isNotEmpty ? groups.first.id : null;

  @override
  void onReady() {
    super.onReady();
    refresh();
  }

  Future<void> refresh() async {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      final result = await repository.getHorizontalPropertyVotingGroups(
        id: propertyId,
      );
      groups.assignAll(result.groups);
      if (!result.success) {
        errorMessage.value = result.message ??
            'No se pudieron cargar los grupos de votación.';
      }
    } catch (_) {
      groups.clear();
      errorMessage.value =
          'No se pudo cargar la información de votaciones de la propiedad.';
    } finally {
      isLoading.value = false;
    }
  }
}
