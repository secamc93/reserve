import 'package:flutter/material.dart';
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
  final unitsErrorMessage = RxnString();
  final residentsErrorMessage = RxnString();
  final unitsLoading = false.obs;
  final residentsLoading = false.obs;

  // Units filters
  final unitsPageCtrl = TextEditingController(text: '1');
  final unitsPageSizeCtrl = TextEditingController(text: '12');
  final unitsNumberCtrl = TextEditingController();
  final unitsBlockCtrl = TextEditingController();
  final unitsTypeCtrl = TextEditingController();
  final unitsSearchCtrl = TextEditingController();
  final unitsIsActive = RxnBool();

  // Residents filters
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

  Future<void> loadUnits() => _loadUnits();

  Future<void> loadResidents() => _loadResidents();

  Map<String, dynamic> _buildUnitsQuery() {
    final query = <String, dynamic>{};
    final page = int.tryParse(unitsPageCtrl.text.trim());
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

  Map<String, dynamic> _buildResidentsQuery() {
    final query = <String, dynamic>{};
    final page = int.tryParse(residentsPageCtrl.text.trim());
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
    return query;
  }

  Future<void> applyUnitsFilters() async {
    await _loadUnits();
  }

  Future<void> applyResidentsFilters() async {
    await _loadResidents();
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
    unitsLoading.value = true;
    unitsErrorMessage.value = null;
    try {
      final query = _buildUnitsQuery();
      final result = await repository.getHorizontalPropertyUnits(
        id: propertyId,
        query: query.isEmpty ? null : query,
      );
      unitsPage.value = result;
      if (!result.success) {
        unitsErrorMessage.value =
            result.message ?? 'No se pudieron cargar las unidades.';
      }
    } catch (_) {
      unitsPage.value = null;
      errorMessage.value ??=
          'No se pudo cargar la información de unidades de la propiedad.';
      unitsErrorMessage.value =
          'No se pudo cargar la información de unidades de la propiedad.';
    } finally {
      unitsLoading.value = false;
    }
  }

  Future<void> _loadResidents() async {
    residentsLoading.value = true;
    residentsErrorMessage.value = null;
    try {
      final query = _buildResidentsQuery();
      final result = await repository.getHorizontalPropertyResidents(
        id: propertyId,
        query: query.isEmpty ? null : query,
      );
      residentsPage.value = result;
      if (!result.success) {
        residentsErrorMessage.value =
            result.message ?? 'No se pudieron cargar los residentes.';
      }
    } catch (_) {
      residentsPage.value = null;
      errorMessage.value ??=
          'No se pudo cargar la información de residentes de la propiedad.';
      residentsErrorMessage.value =
          'No se pudo cargar la información de residentes de la propiedad.';
    } finally {
      residentsLoading.value = false;
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

  @override
  void onClose() {
    unitsPageCtrl.dispose();
    unitsPageSizeCtrl.dispose();
    unitsNumberCtrl.dispose();
    unitsBlockCtrl.dispose();
    unitsTypeCtrl.dispose();
    unitsSearchCtrl.dispose();
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
}
