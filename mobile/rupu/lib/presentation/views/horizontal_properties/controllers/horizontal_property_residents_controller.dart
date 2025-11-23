import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/domain/entities/horizontal_property_resident_detail.dart';
import 'package:rupu/domain/entities/horizontal_property_residents_page.dart';
import 'package:rupu/domain/entities/horizontal_property_units_page.dart';
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
  final unitsOptions = <HorizontalPropertyUnitItem>[].obs;
  final unitsOptionsLoading = false.obs;
  final residentMutationBusy = false.obs;
  final _residentDetailsCache = <int, HorizontalPropertyResidentDetail>{};
  final _residentDetailRequests =
      <int, Future<HorizontalPropertyResidentDetailResult>>{};

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
  final residentsShowAdvancedFilters = false.obs;
  late final VoidCallback _filtersListener;
  Worker? _mainWorker;
  Worker? _statusWorker;
  bool _unitsLoaded = false;

  // Form State
  final residentFormUnitCtrl = TextEditingController();
  final residentFormNameCtrl = TextEditingController();
  final residentFormEmailCtrl = TextEditingController();
  final residentFormDniCtrl = TextEditingController();
  final residentFormPhoneCtrl = TextEditingController();
  final residentFormEmergencyCtrl = TextEditingController();
  final residentFormSelectedUnitId = RxnInt();
  final residentFormTypeId = RxnInt();
  final residentFormIsMain = true.obs;
  final residentFormIsActive = true.obs;
  final residentFormSaving = false.obs;
  final residentFormError = RxnString();

  void initResidentForm({
    HorizontalPropertyResidentDetail? detail,
    HorizontalPropertyResidentItem? fallback,
  }) {
    residentFormSelectedUnitId.value = detail?.propertyUnitId;
    residentFormUnitCtrl.text =
        detail?.propertyUnitNumber ?? fallback?.propertyUnitNumber ?? '';
    residentFormTypeId.value = detail?.residentTypeId;
    residentFormNameCtrl.text = detail?.name ?? fallback?.name ?? '';
    residentFormEmailCtrl.text = detail?.email ?? fallback?.email ?? '';
    residentFormDniCtrl.text = detail?.dni ?? '';
    residentFormPhoneCtrl.text = detail?.phone ?? fallback?.phone ?? '';
    residentFormEmergencyCtrl.text = detail?.emergencyContact ?? '';
    residentFormIsMain.value =
        detail?.isMainResident ?? fallback?.isMainResident ?? true;
    residentFormIsActive.value = detail?.isActive ?? fallback?.isActive ?? true;
    residentFormSaving.value = false;
    residentFormError.value = null;
  }

  void clearResidentForm() {
    residentFormUnitCtrl.clear();
    residentFormNameCtrl.clear();
    residentFormEmailCtrl.clear();
    residentFormDniCtrl.clear();
    residentFormPhoneCtrl.clear();
    residentFormEmergencyCtrl.clear();
    residentFormSelectedUnitId.value = null;
    residentFormTypeId.value = null;
    residentFormIsMain.value = true;
    residentFormIsActive.value = true;
    residentFormSaving.value = false;
    residentFormError.value = null;
  }

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
    final page = pageOverride ?? int.tryParse(residentsPageCtrl.text.trim());
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

  Future<void> loadUnitsOptions({bool forceRefresh = false}) async {
    if (_unitsLoaded && !forceRefresh) return;
    if (unitsOptionsLoading.value) return;
    unitsOptionsLoading.value = true;
    try {
      final result = await repository.getHorizontalPropertyUnits(
        id: propertyId,
        query: _withBusinessId({'page': 1, 'page_size': 200}),
      );
      unitsOptions.assignAll(result.units);
      _unitsLoaded = true;
    } catch (_) {
      unitsOptions.clear();
    } finally {
      unitsOptionsLoading.value = false;
    }
  }

  List<HorizontalPropertyUnitItem> filterUnits(String query) {
    final normalized = query.trim().toLowerCase();
    if (normalized.isEmpty) return List.of(unitsOptions);
    return unitsOptions
        .where((unit) => unit.number.toLowerCase().contains(normalized))
        .toList(growable: false);
  }

  Future<HorizontalPropertyResidentDetailResult> fetchResidentDetail(
    int residentId,
  ) {
    final cached = _residentDetailsCache[residentId];
    if (cached != null) {
      return Future.value(
        HorizontalPropertyResidentDetailResult(success: true, resident: cached),
      );
    }

    final pending = _residentDetailRequests[residentId];
    if (pending != null) {
      return pending;
    }

    final future = repository
        .getHorizontalPropertyResidentDetail(residentId: residentId)
        .then((result) {
          if (result.success && result.resident != null) {
            _residentDetailsCache[residentId] = result.resident!;
          }
          _residentDetailRequests.remove(residentId);
          return result;
        })
        .catchError((_) {
          _residentDetailRequests.remove(residentId);
          return const HorizontalPropertyResidentDetailResult(
            success: false,
            message: 'No se pudo cargar el residente.',
          );
        });

    _residentDetailRequests[residentId] = future;
    return future;
  }

  Future<HorizontalPropertyResidentDetailResult> createResident({
    required Map<String, dynamic> data,
  }) async {
    if (residentMutationBusy.value) {
      return const HorizontalPropertyResidentDetailResult(
        success: false,
        message: 'Ya hay una operación en curso.',
      );
    }
    residentMutationBusy.value = true;
    try {
      final result = await repository.createHorizontalPropertyResident(
        propertyId: propertyId,
        data: data,
      );
      if (result.success) {
        await refresh();
      }
      return result;
    } catch (_) {
      return const HorizontalPropertyResidentDetailResult(
        success: false,
        message: 'No se pudo crear el residente. Inténtalo nuevamente.',
      );
    } finally {
      residentMutationBusy.value = false;
    }
  }

  Future<HorizontalPropertyResidentDetailResult> updateResident({
    required int residentId,
    required Map<String, dynamic> data,
  }) async {
    if (residentMutationBusy.value) {
      return const HorizontalPropertyResidentDetailResult(
        success: false,
        message: 'Ya hay una operación en curso.',
      );
    }
    residentMutationBusy.value = true;
    try {
      final result = await repository.updateHorizontalPropertyResident(
        propertyId: propertyId,
        residentId: residentId,
        data: data,
      );
      if (result.success) {
        await refresh();
        _residentDetailsCache[residentId] =
            result.resident ??
            _residentDetailsCache[residentId] ??
            HorizontalPropertyResidentDetail(
              id: residentId,
              name: data['name']?.toString() ?? '',
            );
      }
      return result;
    } catch (_) {
      return const HorizontalPropertyResidentDetailResult(
        success: false,
        message: 'No se pudo actualizar el residente. Inténtalo nuevamente.',
      );
    } finally {
      residentMutationBusy.value = false;
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
    residentFormUnitCtrl.dispose();
    residentFormNameCtrl.dispose();
    residentFormEmailCtrl.dispose();
    residentFormDniCtrl.dispose();
    residentFormPhoneCtrl.dispose();
    residentFormEmergencyCtrl.dispose();
    _residentDetailRequests.clear();
    _residentDetailsCache.clear();
    unitsOptions.clear();
    super.onClose();
  }

  Map<String, dynamic>? _withBusinessId(Map<String, dynamic>? query) {
    final businessId = _resolveBusinessId();
    if (businessId == null) return query;
    final result = <String, dynamic>{'business_id': businessId};
    if (query != null) {
      result.addAll(query);
    }
    return result;
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
      final detailController = Get.find<HorizontalPropertyDetailController>(
        tag: detailTag,
      );
      final detailId = detailController.detail.value?.id;
      if (detailId != null && detailId > 0) {
        return detailId;
      }
      return detailController.detail.value?.parentBusinessId;
    }

    return null;
  }
}
