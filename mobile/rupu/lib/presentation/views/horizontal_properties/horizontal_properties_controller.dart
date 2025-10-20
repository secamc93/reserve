import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:rupu/domain/entities/horizontal_properties_page.dart';
import 'package:rupu/domain/entities/horizontal_property.dart';
import 'package:rupu/domain/entities/horizontal_property_action_result.dart';
import 'package:rupu/domain/infrastructure/repositories/horizontal_properties_repository_impl.dart';
import 'package:rupu/domain/repositories/horizontal_properties_repository.dart';

class HorizontalPropertiesController extends GetxController {
  final HorizontalPropertiesRepository repository;

  HorizontalPropertiesController({HorizontalPropertiesRepository? repository})
      : repository = repository ?? HorizontalPropertiesRepositoryImpl();

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

  final _dateFormat = DateFormat('dd/MM/yyyy HH:mm');

  @override
  void onInit() {
    super.onInit();
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
    super.onClose();
  }

  Future<void> fetchProperties() async {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      final query = <String, dynamic>{};
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

      properties.assignAll(result.properties);
      total.value = result.total;
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

  String formatDate(DateTime? value) {
    if (value == null) return 'Sin registro';
    return _dateFormat.format(value.toLocal());
  }
}
