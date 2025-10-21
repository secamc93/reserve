import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:rupu/domain/entities/horizontal_properties_page.dart';
import 'package:rupu/domain/entities/horizontal_property.dart';
import 'package:rupu/domain/entities/horizontal_property_action_result.dart';
import 'package:rupu/domain/entities/horizontal_property_create_result.dart';
import 'package:rupu/domain/infrastructure/repositories/horizontal_properties_repository_impl.dart';
import 'package:rupu/domain/repositories/horizontal_properties_repository.dart';
import 'package:rupu/presentation/views/home/home_controller.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';

class HorizontalPropertiesController extends GetxController {
  final HorizontalPropertiesRepository repository;

  HorizontalPropertiesController({HorizontalPropertiesRepository? repository})
      : repository = repository ?? HorizontalPropertiesRepositoryImpl();

  final LoginController _loginController = Get.find<LoginController>();
  final HomeController? _homeController =
      Get.isRegistered<HomeController>() ? Get.find<HomeController>() : null;
  Worker? _businessWorker;

  final properties = <HorizontalProperty>[].obs;
  final isLoading = false.obs;
  final errorMessage = RxnString();
  final total = 0.obs;
  final page = 1.obs;
  final totalPages = 1.obs;
  final deletingPropertyIds = <int>{}.obs;

  final pageCtrl = TextEditingController(text: '1');
  final pageSizeCtrl = TextEditingController(text: '10');
  final nameCtrl = TextEditingController();
  final codeCtrl = TextEditingController();
  final orderByCtrl = TextEditingController(text: 'name');
  final orderDirCtrl = TextEditingController(text: 'asc');
  final isActive = RxnBool();

  final createFormKey = GlobalKey<FormState>();
  final createNameCtrl = TextEditingController();
  final createAddressCtrl = TextEditingController();
  final createCodeCtrl = TextEditingController();
  final createTimezoneCtrl = TextEditingController(text: 'America/Bogota');
  final createDescriptionCtrl = TextEditingController();
  final createTotalUnitsCtrl = TextEditingController();
  final createTotalFloorsCtrl = TextEditingController();
  final createUnitPrefixCtrl = TextEditingController();
  final createUnitTypeCtrl = TextEditingController();
  final createUnitsPerFloorCtrl = TextEditingController();
  final createStartUnitNumberCtrl = TextEditingController();
  final createPrimaryColorCtrl = TextEditingController();
  final createSecondaryColorCtrl = TextEditingController();
  final createTertiaryColorCtrl = TextEditingController();
  final createQuaternaryColorCtrl = TextEditingController();
  final createCustomDomainCtrl = TextEditingController();

  final hasElevator = false.obs;
  final hasParking = false.obs;
  final hasPool = false.obs;
  final hasGym = false.obs;
  final hasSocialArea = false.obs;
  final createUnits = false.obs;
  final createRequiredCommittees = false.obs;

  final isCreating = false.obs;

  final _dateFormat = DateFormat('dd/MM/yyyy HH:mm');

  @override
  void onInit() {
    super.onInit();
    _businessWorker = ever(_loginController.selectedBusiness, (_) {
      fetchProperties();
    });
    fetchProperties();
  }

  @override
  void onClose() {
    pageCtrl.dispose();
    pageSizeCtrl.dispose();
    nameCtrl.dispose();
    codeCtrl.dispose();
    orderByCtrl.dispose();
    orderDirCtrl.dispose();
    createNameCtrl.dispose();
    createAddressCtrl.dispose();
    createCodeCtrl.dispose();
    createTimezoneCtrl.dispose();
    createDescriptionCtrl.dispose();
    createTotalUnitsCtrl.dispose();
    createTotalFloorsCtrl.dispose();
    createUnitPrefixCtrl.dispose();
    createUnitTypeCtrl.dispose();
    createUnitsPerFloorCtrl.dispose();
    createStartUnitNumberCtrl.dispose();
    createPrimaryColorCtrl.dispose();
    createSecondaryColorCtrl.dispose();
    createTertiaryColorCtrl.dispose();
    createQuaternaryColorCtrl.dispose();
    createCustomDomainCtrl.dispose();
    _businessWorker?.dispose();
    super.onClose();
  }

  Future<void> fetchProperties() async {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      final isSuperAdmin = _homeController?.isSuper ?? false;
      final businessId = _loginController.selectedBusinessId;
      if (businessId == null && !isSuperAdmin) {
        properties.clear();
        total.value = 0;
        page.value = 1;
        totalPages.value = 1;
        errorMessage.value = 'Debes seleccionar un negocio para continuar.';
        return;
      }

      final query = <String, dynamic>{};
      if (!isSuperAdmin && businessId != null) {
        query['business_id'] = businessId;
      }
      final parsedPage = int.tryParse(pageCtrl.text.trim());
      final parsedSize = int.tryParse(pageSizeCtrl.text.trim());
      if (parsedPage != null && parsedPage > 0) {
        query['page'] = parsedPage;
      }
      if (parsedSize != null && parsedSize > 0) {
        query['page_size'] = parsedSize;
      }
      if (nameCtrl.text.trim().isNotEmpty) {
        query['name'] = nameCtrl.text.trim();
      }
      if (codeCtrl.text.trim().isNotEmpty) {
        query['code'] = codeCtrl.text.trim();
      }
      if (isActive.value != null) {
        query['is_active'] = isActive.value;
      }
      if (orderByCtrl.text.trim().isNotEmpty) {
        query['order_by'] = orderByCtrl.text.trim();
      }
      if (orderDirCtrl.text.trim().isNotEmpty) {
        query['order_dir'] = orderDirCtrl.text.trim();
      }

      final HorizontalPropertiesPage result =
          await repository.getHorizontalProperties(
        query: query.isEmpty ? null : query,
      );

      if (!result.success) {
        properties.clear();
        total.value = 0;
        page.value = 1;
        totalPages.value = 1;
        errorMessage.value =
            'No se pudieron obtener las propiedades horizontales.';
        return;
      }

      final filtered = isSuperAdmin || businessId == null
          ? result.properties
          : result.properties.where((property) {
              final propertyBusinessId = property.businessId;
              if (propertyBusinessId != null) {
                return propertyBusinessId == businessId;
              }

              return property.id == businessId;
            }).toList(growable: false);

      properties.assignAll(filtered);
      total.value = isSuperAdmin ? result.total : filtered.length;
      page.value = result.page;
      totalPages.value = result.totalPages;
    } catch (error) {
      properties.clear();
      total.value = 0;
      page.value = 1;
      totalPages.value = 1;
      errorMessage.value =
          'Ocurrió un error al consultar las propiedades horizontales.';
    } finally {
      isLoading.value = false;
    }
  }

  bool isDeleting(int id) => deletingPropertyIds.contains(id);

  Future<HorizontalPropertyCreateResult> createProperty() async {
    final formState = createFormKey.currentState;
    if (formState == null || !formState.validate()) {
      return const HorizontalPropertyCreateResult(
        success: false,
        message: 'Por favor completa los campos obligatorios.',
      );
    }

    isCreating.value = true;
    try {
      final payload = _buildCreatePayload();
      final result = await repository.createHorizontalProperty(data: payload);
      if (result.success) {
        await fetchProperties();
        resetCreateForm();
      }
      return result;
    } catch (_) {
      return const HorizontalPropertyCreateResult(
        success: false,
        message:
            'No se pudo crear la propiedad horizontal. Inténtalo nuevamente.',
      );
    } finally {
      isCreating.value = false;
    }
  }

  Future<HorizontalPropertyActionResult> deleteProperty({
    required int id,
  }) async {
    deletingPropertyIds.add(id);
    deletingPropertyIds.refresh();
    try {
      final result = await repository.deleteHorizontalProperty(id: id);
      if (result.success) {
        await fetchProperties();
      }
      return result;
    } catch (_) {
      return const HorizontalPropertyActionResult(
        success: false,
        message:
            'No se pudo eliminar la propiedad horizontal. Inténtalo nuevamente.',
      );
    } finally {
      deletingPropertyIds.remove(id);
      deletingPropertyIds.refresh();
    }
  }

  void clearFilters() {
    pageCtrl.text = '1';
    pageSizeCtrl.text = '10';
    nameCtrl.clear();
    codeCtrl.clear();
    orderByCtrl.text = 'name';
    orderDirCtrl.text = 'asc';
    isActive.value = null;
    errorMessage.value = null;
  }

  void setIsActive(bool? value) {
    isActive.value = value;
  }

  void resetCreateForm() {
    createFormKey.currentState?.reset();
    createNameCtrl.clear();
    createAddressCtrl.clear();
    createCodeCtrl.clear();
    createTimezoneCtrl.text = 'America/Bogota';
    createDescriptionCtrl.clear();
    createTotalUnitsCtrl.clear();
    createTotalFloorsCtrl.clear();
    createUnitPrefixCtrl.clear();
    createUnitTypeCtrl.clear();
    createUnitsPerFloorCtrl.clear();
    createStartUnitNumberCtrl.clear();
    createPrimaryColorCtrl.clear();
    createSecondaryColorCtrl.clear();
    createTertiaryColorCtrl.clear();
    createQuaternaryColorCtrl.clear();
    createCustomDomainCtrl.clear();
    hasElevator.value = false;
    hasParking.value = false;
    hasPool.value = false;
    hasGym.value = false;
    hasSocialArea.value = false;
    createUnits.value = false;
    createRequiredCommittees.value = false;
  }

  String formatDate(DateTime? value) {
    if (value == null) return 'Sin registro';
    return _dateFormat.format(value.toLocal());
  }

  Map<String, dynamic> _buildCreatePayload() {
    final payload = <String, dynamic>{
      'name': createNameCtrl.text.trim(),
      'address': createAddressCtrl.text.trim(),
    };

    final code = createCodeCtrl.text.trim();
    if (code.isNotEmpty) {
      payload['code'] = code;
    }

    final timezone = createTimezoneCtrl.text.trim();
    if (timezone.isNotEmpty) {
      payload['timezone'] = timezone;
    }

    final description = createDescriptionCtrl.text.trim();
    if (description.isNotEmpty) {
      payload['description'] = description;
    }

    final totalUnits = int.tryParse(createTotalUnitsCtrl.text.trim());
    if (totalUnits != null) {
      payload['total_units'] = totalUnits;
    }

    final totalFloors = int.tryParse(createTotalFloorsCtrl.text.trim());
    if (totalFloors != null) {
      payload['total_floors'] = totalFloors;
    }

    if (hasElevator.value) payload['has_elevator'] = true;
    if (hasParking.value) payload['has_parking'] = true;
    if (hasPool.value) payload['has_pool'] = true;
    if (hasGym.value) payload['has_gym'] = true;
    if (hasSocialArea.value) payload['has_social_area'] = true;

    final primaryColor = createPrimaryColorCtrl.text.trim();
    if (primaryColor.isNotEmpty) {
      payload['primary_color'] = primaryColor;
    }

    final secondaryColor = createSecondaryColorCtrl.text.trim();
    if (secondaryColor.isNotEmpty) {
      payload['secondary_color'] = secondaryColor;
    }

    final tertiaryColor = createTertiaryColorCtrl.text.trim();
    if (tertiaryColor.isNotEmpty) {
      payload['tertiary_color'] = tertiaryColor;
    }

    final quaternaryColor = createQuaternaryColorCtrl.text.trim();
    if (quaternaryColor.isNotEmpty) {
      payload['quaternary_color'] = quaternaryColor;
    }

    final customDomain = createCustomDomainCtrl.text.trim();
    if (customDomain.isNotEmpty) {
      payload['custom_domain'] = customDomain;
    }

    if (createUnits.value) {
      payload['create_units'] = true;
      final unitPrefix = createUnitPrefixCtrl.text.trim();
      if (unitPrefix.isNotEmpty) {
        payload['unit_prefix'] = unitPrefix;
      }
      final unitType = createUnitTypeCtrl.text.trim();
      if (unitType.isNotEmpty) {
        payload['unit_type'] = unitType;
      }
      final unitsPerFloor = int.tryParse(createUnitsPerFloorCtrl.text.trim());
      if (unitsPerFloor != null) {
        payload['units_per_floor'] = unitsPerFloor;
      }
      final startUnitNumber =
          int.tryParse(createStartUnitNumberCtrl.text.trim());
      if (startUnitNumber != null) {
        payload['start_unit_number'] = startUnitNumber;
      }
    }

    if (createRequiredCommittees.value) {
      payload['create_required_committees'] = true;
    }

    return payload;
  }
}
