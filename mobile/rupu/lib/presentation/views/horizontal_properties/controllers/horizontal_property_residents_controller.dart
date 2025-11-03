import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/domain/entities/horizontal_property_residents_page.dart';
import 'package:rupu/domain/infrastructure/repositories/horizontal_properties_repository_impl.dart';
import 'package:rupu/domain/repositories/horizontal_properties_repository.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';

import '../horizontal_property_detail_controller.dart';

class HorizontalPropertyResidentsController extends GetxController {
  final int propertyId;
  final HorizontalPropertiesRepository repository;

  HorizontalPropertyResidentsController({
    required this.propertyId,
    HorizontalPropertiesRepository? repository,
  }) : repository = repository ?? HorizontalPropertiesRepositoryImpl();

  static String tagFor(int id) =>
      '${HorizontalPropertyDetailController.tagFor(id)}-residents';

  final residentsPage = Rxn<HorizontalPropertyResidentsPage>();
  final residentsItems = <HorizontalPropertyResidentItem>[].obs;
  final residentsLoading = false.obs;
  final residentsLoadingMore = false.obs;
  final residentsErrorMessage = RxnString();
  final filtersRevision = 0.obs;

  // Filters
  final residentsPageCtrl = TextEditingController(text: '1');
  final residentsPageSizeCtrl = TextEditingController(text: '12');
  final residentsNameCtrl = TextEditingController();
  final residentsEmailCtrl = TextEditingController();
  final residentsPhoneCtrl = TextEditingController();
  final residentsUnitNumberCtrl = TextEditingController();
  final residentsTypeCtrl = TextEditingController();
  final residentsSearchCtrl = TextEditingController();
  final residentsIsMain = RxnBool();
  final residentsIsActive = RxnBool();
  late final VoidCallback _filtersListener;
  Worker? _mainWorker;
  Worker? _statusWorker;

  bool get canLoadMoreResidents {
    final page = residentsPage.value?.page ?? 0;
    final totalPages = residentsPage.value?.totalPages ?? 0;
    return page < totalPages;
  }

  @override
  void onInit() {
    super.onInit();
    _filtersListener = () => filtersRevision.value++;
    for (final controller in [
      residentsPageCtrl,
      residentsPageSizeCtrl,
      residentsNameCtrl,
      residentsEmailCtrl,
      residentsPhoneCtrl,
      residentsUnitNumberCtrl,
      residentsTypeCtrl,
      residentsSearchCtrl,
    ]) {
      controller.addListener(_filtersListener);
    }
    _mainWorker = ever(residentsIsMain, (_) => filtersRevision.value++);
    _statusWorker = ever(residentsIsActive, (_) => filtersRevision.value++);
  }

  @override
  void onReady() {
    super.onReady();
    refresh();
  }

  Future<void> refresh() => _loadResidents();

  Future<void> loadMoreResidents() => _loadResidents(append: true);

  Future<void> applyResidentsFilters() async {
    await _loadResidents();
  }

  void clearResidentsFilters() {
    residentsPageCtrl.text = '1';
    residentsPageSizeCtrl.text = '12';
    residentsNameCtrl.clear();
    residentsEmailCtrl.clear();
    residentsPhoneCtrl.clear();
    residentsUnitNumberCtrl.clear();
    residentsTypeCtrl.clear();
    residentsSearchCtrl.clear();
    residentsIsMain.value = null;
    residentsIsActive.value = null;
  }

  Map<String, dynamic> _buildResidentsQuery({int? pageOverride}) {
    final query = <String, dynamic>{};
    final page =
        pageOverride ?? int.tryParse(residentsPageCtrl.text.trim());
    final pageSize = int.tryParse(residentsPageSizeCtrl.text.trim());
    if (page != null && page > 0) query['page'] = page;
    if (pageSize != null && pageSize > 0) query['page_size'] = pageSize;
    if (residentsNameCtrl.text.trim().isNotEmpty) {
      query['name'] = residentsNameCtrl.text.trim();
    }
    if (residentsEmailCtrl.text.trim().isNotEmpty) {
      query['email'] = residentsEmailCtrl.text.trim();
    }
    if (residentsPhoneCtrl.text.trim().isNotEmpty) {
      query['phone'] = residentsPhoneCtrl.text.trim();
    }
    if (residentsUnitNumberCtrl.text.trim().isNotEmpty) {
      query['property_unit_number'] = residentsUnitNumberCtrl.text.trim();
    }
    if (residentsTypeCtrl.text.trim().isNotEmpty) {
      query['resident_type'] = residentsTypeCtrl.text.trim();
    }
    if (residentsSearchCtrl.text.trim().isNotEmpty) {
      query['search'] = residentsSearchCtrl.text.trim();
    }
    final isMain = residentsIsMain.value;
    if (isMain != null) {
      query['is_main_resident'] = isMain;
    }
    final isActive = residentsIsActive.value;
    if (isActive != null) {
      query['is_active'] = isActive;
    }
    final businessId = _resolveBusinessId();
    if (businessId != null) {
      query['business_id'] = businessId;
    }
    return query;
  }

  Future<void> _loadResidents({bool append = false}) async {
    if (append) {
      if (residentsLoading.value || residentsLoadingMore.value) {
        return;
      }
      if (!canLoadMoreResidents && residentsItems.isNotEmpty) {
        return;
      }
      residentsLoadingMore.value = true;
    } else {
      residentsLoading.value = true;
      residentsErrorMessage.value = null;
      residentsItems.clear();
    }
    try {
      final basePage = append
          ? (residentsPage.value?.page ??
              int.tryParse(residentsPageCtrl.text.trim()) ??
              1)
          : int.tryParse(residentsPageCtrl.text.trim()) ?? 1;
      final pageToRequest = basePage < 1 ? 1 : basePage;
      final query = _buildResidentsQuery(
        pageOverride: append ? pageToRequest + 1 : pageToRequest,
      );
      final result = await repository.getHorizontalPropertyResidents(
        id: propertyId,
        query: query.isEmpty ? null : query,
      );
      if (append) {
        residentsItems.addAll(result.residents);
      } else {
        residentsItems.assignAll(result.residents);
      }
      residentsPage.value = result;
      residentsPageCtrl.text = result.page.toString();
      if (!result.success) {
        residentsErrorMessage.value =
            result.message ?? 'No se pudieron cargar los residentes.';
      }
    } catch (_) {
      residentsPage.value = null;
      residentsErrorMessage.value =
          'No se pudo cargar la información de residentes de la propiedad.';
    } finally {
      if (append) {
        residentsLoadingMore.value = false;
      } else {
        residentsLoading.value = false;
      }
    }
  }

  @override
  void onClose() {
    for (final controller in [
      residentsPageCtrl,
      residentsPageSizeCtrl,
      residentsNameCtrl,
      residentsEmailCtrl,
      residentsPhoneCtrl,
      residentsUnitNumberCtrl,
      residentsTypeCtrl,
      residentsSearchCtrl,
    ]) {
      controller.removeListener(_filtersListener);
    }
    _mainWorker?.dispose();
    _statusWorker?.dispose();
    residentsPageCtrl.dispose();
    residentsPageSizeCtrl.dispose();
    residentsNameCtrl.dispose();
    residentsEmailCtrl.dispose();
    residentsPhoneCtrl.dispose();
    residentsUnitNumberCtrl.dispose();
    residentsTypeCtrl.dispose();
    residentsSearchCtrl.dispose();
    super.onClose();
  }

  int? _resolveBusinessId() {
    if (propertyId > 0) {
      return propertyId;
    }

    if (Get.isRegistered<LoginController>()) {
      final loginController = Get.find<LoginController>();
      final id = loginController.selectedBusinessId;
      if (id != null) {
        return id;
      }
    }

    final detailTag = HorizontalPropertyDetailController.tagFor(propertyId);
    if (Get.isRegistered<HorizontalPropertyDetailController>(tag: detailTag)) {
      final detailController =
          Get.find<HorizontalPropertyDetailController>(tag: detailTag);
      final detailId = detailController.detail.value?.id;
      if (detailId != null && detailId > 0) {
        return detailId;
      }
      return detailController.detail.value?.parentBusinessId;
    }

    return null;
  }
}
