import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/domain/entities/horizontal_property_units_page.dart';
import 'package:rupu/domain/infrastructure/repositories/horizontal_properties_repository_impl.dart';
import 'package:rupu/domain/repositories/horizontal_properties_repository.dart';

import '../horizontal_property_detail_controller.dart';

class HorizontalPropertyUnitsController extends GetxController {
  final int propertyId;
  final HorizontalPropertiesRepository repository;

  HorizontalPropertyUnitsController({
    required this.propertyId,
    HorizontalPropertiesRepository? repository,
  }) : repository = repository ?? HorizontalPropertiesRepositoryImpl();

  static String tagFor(int id) =>
      '${HorizontalPropertyDetailController.tagFor(id)}-units';

  final unitsPage = Rxn<HorizontalPropertyUnitsPage>();
  final unitsItems = <HorizontalPropertyUnitItem>[].obs;
  final unitsLoading = false.obs;
  final unitsLoadingMore = false.obs;
  final unitsErrorMessage = RxnString();

  // Filters
  final unitsPageCtrl = TextEditingController(text: '1');
  final unitsPageSizeCtrl = TextEditingController(text: '12');
  final unitsNumberCtrl = TextEditingController();
  final unitsBlockCtrl = TextEditingController();
  final unitsTypeCtrl = TextEditingController();
  final unitsSearchCtrl = TextEditingController();
  final unitsIsActive = RxnBool();

  bool get canLoadMoreUnits {
    final page = unitsPage.value?.page ?? 0;
    final totalPages = unitsPage.value?.totalPages ?? 0;
    return page < totalPages;
  }

  @override
  void onReady() {
    super.onReady();
    refresh();
  }

  Future<void> refresh() => _loadUnits();

  Future<void> loadMoreUnits() => _loadUnits(append: true);

  Future<void> applyUnitsFilters() async {
    await _loadUnits();
  }

  void clearUnitsFilters() {
    unitsPageCtrl.text = '1';
    unitsPageSizeCtrl.text = '12';
    unitsNumberCtrl.clear();
    unitsBlockCtrl.clear();
    unitsTypeCtrl.clear();
    unitsSearchCtrl.clear();
    unitsIsActive.value = null;
  }

  Map<String, dynamic> _buildUnitsQuery({int? pageOverride}) {
    final query = <String, dynamic>{};
    final page = pageOverride ?? int.tryParse(unitsPageCtrl.text.trim());
    final pageSize = int.tryParse(unitsPageSizeCtrl.text.trim());
    if (page != null && page > 0) query['page'] = page;
    if (pageSize != null && pageSize > 0) query['page_size'] = pageSize;
    if (unitsNumberCtrl.text.trim().isNotEmpty) {
      query['number'] = unitsNumberCtrl.text.trim();
    }
    if (unitsBlockCtrl.text.trim().isNotEmpty) {
      query['block'] = unitsBlockCtrl.text.trim();
    }
    if (unitsTypeCtrl.text.trim().isNotEmpty) {
      query['unit_type'] = unitsTypeCtrl.text.trim();
    }
    if (unitsSearchCtrl.text.trim().isNotEmpty) {
      query['search'] = unitsSearchCtrl.text.trim();
    }
    final status = unitsIsActive.value;
    if (status != null) {
      query['is_active'] = status;
    }
    return query;
  }

  Future<void> _loadUnits({bool append = false}) async {
    if (append) {
      if (unitsLoading.value || unitsLoadingMore.value) {
        return;
      }
      if (!canLoadMoreUnits && unitsItems.isNotEmpty) {
        return;
      }
      unitsLoadingMore.value = true;
    } else {
      unitsLoading.value = true;
      unitsErrorMessage.value = null;
      unitsItems.clear();
    }
    try {
      final basePage = append
          ? (unitsPage.value?.page ??
              int.tryParse(unitsPageCtrl.text.trim()) ??
              1)
          : int.tryParse(unitsPageCtrl.text.trim()) ?? 1;
      final pageToRequest = basePage < 1 ? 1 : basePage;
      final query = _buildUnitsQuery(
        pageOverride: append ? pageToRequest + 1 : pageToRequest,
      );
      final result = await repository.getHorizontalPropertyUnits(
        id: propertyId,
        query: query.isEmpty ? null : query,
      );
      if (append) {
        unitsItems.addAll(result.units);
      } else {
        unitsItems.assignAll(result.units);
      }
      unitsPage.value = result;
      unitsPageCtrl.text = result.page.toString();
      if (!result.success) {
        unitsErrorMessage.value =
            result.message ?? 'No se pudieron cargar las unidades.';
      }
    } catch (_) {
      unitsPage.value = null;
      unitsErrorMessage.value =
          'No se pudo cargar la información de unidades de la propiedad.';
    } finally {
      if (append) {
        unitsLoadingMore.value = false;
      } else {
        unitsLoading.value = false;
      }
    }
  }

  @override
  void onClose() {
    unitsPageCtrl.dispose();
    unitsPageSizeCtrl.dispose();
    unitsNumberCtrl.dispose();
    unitsBlockCtrl.dispose();
    unitsTypeCtrl.dispose();
    unitsSearchCtrl.dispose();
    super.onClose();
  }
}
