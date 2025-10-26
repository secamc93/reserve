import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:rupu/domain/entities/horizontal_property_detail.dart';
import 'package:rupu/domain/entities/horizontal_property_update_result.dart';
import 'package:rupu/domain/infrastructure/repositories/horizontal_properties_repository_impl.dart';
import 'package:rupu/domain/repositories/horizontal_properties_repository.dart';

import 'package:rupu/presentation/views/login/login_controller.dart';

import 'horizontal_properties_controller.dart';
import 'models/property_file_data.dart';
import 'utils/property_file_helper.dart';

class HorizontalPropertyUpdateController extends GetxController {
  final int propertyId;
  final HorizontalPropertiesRepository repository;

  HorizontalPropertyUpdateController({
    required this.propertyId,
    HorizontalPropertiesRepository? repository,
  }) : repository = repository ?? HorizontalPropertiesRepositoryImpl();

  static String tagFor(int id) => 'horizontal-property-update-$id';

  final formKey = GlobalKey<FormState>();

  final nameCtrl = TextEditingController();
  final codeCtrl = TextEditingController();
  final addressCtrl = TextEditingController();
  final descriptionCtrl = TextEditingController();
  final timezoneCtrl = TextEditingController();
  final totalUnitsCtrl = TextEditingController();
  final totalFloorsCtrl = TextEditingController();
  final primaryColorCtrl = TextEditingController();
  final secondaryColorCtrl = TextEditingController();
  final tertiaryColorCtrl = TextEditingController();
  final quaternaryColorCtrl = TextEditingController();
  final customDomainCtrl = TextEditingController();

  final isLoading = false.obs;
  final isSaving = false.obs;
  final errorMessage = RxnString();

  final hasElevator = false.obs;
  final hasParking = false.obs;
  final hasPool = false.obs;
  final hasGym = false.obs;
  final hasSocialArea = false.obs;
  final isActive = true.obs;

  final logoFile = Rxn<PropertyFileData>();
  final navbarImageFile = Rxn<PropertyFileData>();
  final logoProcessing = false.obs;
  final navbarProcessing = false.obs;
  final logoUrl = RxnString();
  final navbarUrl = RxnString();
  final clearLogo = false.obs;
  final clearNavbarImage = false.obs;

  final property = Rxn<HorizontalPropertyDetail>();

  LoginController get _loginController => Get.find<LoginController>();

  @override
  void onInit() {
    super.onInit();
    loadProperty();
  }

  @override
  void onClose() {
    nameCtrl.dispose();
    codeCtrl.dispose();
    addressCtrl.dispose();
    descriptionCtrl.dispose();
    timezoneCtrl.dispose();
    totalUnitsCtrl.dispose();
    totalFloorsCtrl.dispose();
    primaryColorCtrl.dispose();
    secondaryColorCtrl.dispose();
    tertiaryColorCtrl.dispose();
    quaternaryColorCtrl.dispose();
    customDomainCtrl.dispose();
    super.onClose();
  }

  Future<void> loadProperty() async {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      final detail = await repository.getHorizontalPropertyDetail(id: propertyId);
      if (detail == null) {
        errorMessage.value = 'No se encontró información de la propiedad.';
        property.value = null;
        return;
      }

      final selectedBusinessId = _loginController.selectedBusinessId;
      if (selectedBusinessId != null &&
          detail.parentBusinessId != null &&
          detail.parentBusinessId != selectedBusinessId) {
        errorMessage.value =
            'No tienes acceso para administrar esta propiedad horizontal.';
        property.value = null;
        return;
      }
      property.value = detail;
      _populate(detail);
    } on DioException catch (e) {
      final fallback =
          'No se pudo cargar la propiedad.${e.message != null ? ' (${e.message})' : ''}';
      errorMessage.value = _extractDioMessage(e, fallback);
      property.value = null;
    } catch (e) {
      errorMessage.value = 'Ocurrió un error al cargar la propiedad: $e';
      property.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  void _populate(HorizontalPropertyDetail detail) {
    nameCtrl.text = detail.name;
    codeCtrl.text = detail.code ?? '';
    addressCtrl.text = detail.address ?? '';
    descriptionCtrl.text = detail.description ?? '';
    timezoneCtrl.text = detail.timezone ?? '';
    totalUnitsCtrl.text = detail.totalUnits?.toString() ?? '';
    totalFloorsCtrl.text = detail.totalFloors?.toString() ?? '';
    primaryColorCtrl.text = detail.primaryColor ?? '';
    secondaryColorCtrl.text = detail.secondaryColor ?? '';
    tertiaryColorCtrl.text = detail.tertiaryColor ?? '';
    quaternaryColorCtrl.text = detail.quaternaryColor ?? '';
    customDomainCtrl.text = detail.customDomain ?? '';

    hasElevator.value = detail.hasElevator ?? false;
    hasParking.value = detail.hasParking ?? false;
    hasPool.value = detail.hasPool ?? false;
    hasGym.value = detail.hasGym ?? false;
    hasSocialArea.value = detail.hasSocialArea ?? false;
    isActive.value = detail.isActive ?? true;

    logoUrl.value = detail.logoUrl;
    navbarUrl.value = detail.navbarImageUrl;

    logoFile.value = null;
    navbarImageFile.value = null;
    clearLogo.value = false;
    clearNavbarImage.value = false;
  }

  Future<void> pickLogo() async {
    final result = await FilePicker.platform.pickFiles(type: FileType.image);
    if (result == null || result.files.isEmpty) return;

    logoProcessing.value = true;
    errorMessage.value = null;
    try {
      final processed = await PropertyFileHelper.process(result.files.first);
      if (processed == null) {
        errorMessage.value = 'No se pudo procesar el logo seleccionado.';
        logoFile.value = null;
        return;
      }
      logoFile.value = processed;
      logoUrl.value = null;
      clearLogo.value = false;
    } catch (e) {
      errorMessage.value = 'Error procesando el logo: $e';
      logoFile.value = null;
    } finally {
      logoProcessing.value = false;
    }
  }

  Future<void> pickNavbarImage() async {
    final result = await FilePicker.platform.pickFiles(type: FileType.image);
    if (result == null || result.files.isEmpty) return;

    navbarProcessing.value = true;
    errorMessage.value = null;
    try {
      final processed = await PropertyFileHelper.process(result.files.first);
      if (processed == null) {
        errorMessage.value =
            'No se pudo procesar la imagen del navbar seleccionada.';
        navbarImageFile.value = null;
        return;
      }
      navbarImageFile.value = processed;
      navbarUrl.value = null;
      clearNavbarImage.value = false;
    } catch (e) {
      errorMessage.value = 'Error procesando la imagen del navbar: $e';
      navbarImageFile.value = null;
    } finally {
      navbarProcessing.value = false;
    }
  }

  void removeLogoFile() {
    logoFile.value = null;
    clearLogo.value = false;
    final current = property.value?.logoUrl;
    if (current != null && current.isNotEmpty) {
      logoUrl.value = current;
    }
  }

  void removeNavbarImageFile() {
    navbarImageFile.value = null;
    clearNavbarImage.value = false;
    final current = property.value?.navbarImageUrl;
    if (current != null && current.isNotEmpty) {
      navbarUrl.value = current;
    }
  }

  void clearExistingLogo() {
    logoFile.value = null;
    logoUrl.value = null;
    clearLogo.value = true;
  }

  void clearExistingNavbarImage() {
    navbarImageFile.value = null;
    navbarUrl.value = null;
    clearNavbarImage.value = true;
  }

  void restoreExistingLogo() {
    clearLogo.value = false;
    final current = property.value?.logoUrl;
    if (current != null && current.isNotEmpty) {
      logoUrl.value = current;
    }
  }

  void restoreExistingNavbarImage() {
    clearNavbarImage.value = false;
    final current = property.value?.navbarImageUrl;
    if (current != null && current.isNotEmpty) {
      navbarUrl.value = current;
    }
  }

  String formatFileSize(int bytes) {
    if (bytes <= 0) return '0 KB';
    const units = ['B', 'KB', 'MB'];
    var value = bytes.toDouble();
    var index = 0;
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index++;
    }
    final decimals = index == 0 ? 0 : 1;
    return '${value.toStringAsFixed(decimals)} ${units[index]}';
  }

  Future<HorizontalPropertyUpdateResult?> submit() async {
    if (isSaving.value) return null;
    if (!formKey.currentState!.validate()) return null;
    if (logoProcessing.value || navbarProcessing.value) {
      errorMessage.value =
          'Espera a que termine el procesamiento de los archivos seleccionados.';
      return null;
    }

    isSaving.value = true;
    errorMessage.value = null;
    try {
      final payload = _buildPayload();
      final logo = logoFile.value;
      final navbar = navbarImageFile.value;
      final result = await repository.updateHorizontalProperty(
        id: propertyId,
        data: payload,
        logoFilePath: logo?.path,
        logoFileName: logo?.fileName,
        navbarImagePath: navbar?.path,
        navbarImageFileName: navbar?.fileName,
      );

      if (!result.success) {
        errorMessage.value =
            result.message ?? 'No se pudo actualizar la propiedad.';
        return result;
      }

      final detail = result.property;
      if (detail != null) {
        property.value = detail;
        _populate(detail);
        if (Get.isRegistered<HorizontalPropertiesController>()) {
          await Get.find<HorizontalPropertiesController>().fetchProperties();
        }
      }

      errorMessage.value = null;

      return result;
    } on DioException catch (e) {
      final fallback =
          'No se pudo actualizar la propiedad.${e.message != null ? ' (${e.message})' : ''}';
      final message = _extractDioMessage(e, fallback);
      errorMessage.value = message;
      return HorizontalPropertyUpdateResult(
        success: false,
        message: message,
      );
    } catch (e) {
      errorMessage.value = 'Error al actualizar la propiedad: $e';
      return HorizontalPropertyUpdateResult(
        success: false,
        message: 'Error al actualizar la propiedad: $e',
      );
    } finally {
      isSaving.value = false;
    }
  }

  Map<String, dynamic> _buildPayload() {
    final map = <String, dynamic>{
      'name': nameCtrl.text.trim(),
      'address': addressCtrl.text.trim(),
      'is_active': isActive.value,
      'has_elevator': hasElevator.value,
      'has_parking': hasParking.value,
      'has_pool': hasPool.value,
      'has_gym': hasGym.value,
      'has_social_area': hasSocialArea.value,
    };

    void assignIfNotEmpty(String key, String value) {
      if (value.trim().isNotEmpty) {
        map[key] = value.trim();
      }
    }

    assignIfNotEmpty('code', codeCtrl.text);
    assignIfNotEmpty('description', descriptionCtrl.text);
    assignIfNotEmpty('timezone', timezoneCtrl.text);
    assignIfNotEmpty('primary_color', primaryColorCtrl.text);
    assignIfNotEmpty('secondary_color', secondaryColorCtrl.text);
    assignIfNotEmpty('tertiary_color', tertiaryColorCtrl.text);
    assignIfNotEmpty('quaternary_color', quaternaryColorCtrl.text);
    assignIfNotEmpty('custom_domain', customDomainCtrl.text);

    final totalUnits = int.tryParse(totalUnitsCtrl.text.trim());
    if (totalUnits != null) map['total_units'] = totalUnits;
    final totalFloors = int.tryParse(totalFloorsCtrl.text.trim());
    if (totalFloors != null) map['total_floors'] = totalFloors;

    if (clearLogo.value) {
      map['logo_url'] = '';
    } else if (logoFile.value == null) {
      final currentLogoUrl = logoUrl.value?.trim();
      if (currentLogoUrl != null && currentLogoUrl.isNotEmpty) {
        map['logo_url'] = currentLogoUrl;
      }
    }

    if (clearNavbarImage.value) {
      map['navbar_image_url'] = '';
    } else if (navbarImageFile.value == null) {
      final currentNavbarUrl = navbarUrl.value?.trim();
      if (currentNavbarUrl != null && currentNavbarUrl.isNotEmpty) {
        map['navbar_image_url'] = currentNavbarUrl;
      }
    }

    return map;
  }

  String _extractDioMessage(DioException exception, String fallback) {
    final data = exception.response?.data;
    if (data is Map && data['message'] != null) {
      final value = data['message'];
      if (value is String && value.trim().isNotEmpty) {
        return value.trim();
      }
      return value?.toString() ?? fallback;
    }
    if (data is String && data.trim().isNotEmpty) {
      return data.trim();
    }
    return fallback;
  }
}

