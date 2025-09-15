import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:rupu/domain/entities/user_list_item.dart';
import 'package:rupu/domain/infrastructure/datasources/users_management_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/repositories/users_repository_impl.dart';
import 'package:rupu/domain/repositories/users_repository.dart';

class UsersController extends GetxController {
  final UsersRepository repository;
  UsersController()
      : repository = UsersRepositoryImpl(UsersManagementDatasourceImpl());

  final users = <UserListItem>[].obs;
  final isLoading = false.obs;
  final errorMessage = RxnString();
  final totalCount = 0.obs;

  // Filters
  final pageCtrl = TextEditingController(text: '1');
  final pageSizeCtrl = TextEditingController(text: '10');
  final nameCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  final roleIdCtrl = TextEditingController();
  final businessIdCtrl = TextEditingController();
  final createdAtCtrl = TextEditingController();
  final sortByCtrl = TextEditingController(text: 'created_at');
  final sortOrderCtrl = TextEditingController(text: 'desc');
  final isActive = RxnBool();

  final _dateFormat = DateFormat('dd/MM/yyyy HH:mm');

  @override
  void onReady() {
    super.onReady();
    fetchUsers();
  }

  @override
  void onClose() {
    pageCtrl.dispose();
    pageSizeCtrl.dispose();
    nameCtrl.dispose();
    emailCtrl.dispose();
    phoneCtrl.dispose();
    roleIdCtrl.dispose();
    businessIdCtrl.dispose();
    createdAtCtrl.dispose();
    sortByCtrl.dispose();
    sortOrderCtrl.dispose();
    super.onClose();
  }

  Future<void> fetchUsers() async {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      final query = <String, dynamic>{};
      final page = int.tryParse(pageCtrl.text);
      final pageSize = int.tryParse(pageSizeCtrl.text);
      if (page != null) query['page'] = page;
      if (pageSize != null) query['page_size'] = pageSize;
      if (nameCtrl.text.isNotEmpty) query['name'] = nameCtrl.text.trim();
      if (emailCtrl.text.isNotEmpty) query['email'] = emailCtrl.text.trim();
      if (phoneCtrl.text.isNotEmpty) query['phone'] = phoneCtrl.text.trim();
      if (isActive.value != null) query['is_active'] = isActive.value;
      if (roleIdCtrl.text.isNotEmpty) {
        final roleId = int.tryParse(roleIdCtrl.text.trim());
        if (roleId != null) query['role_id'] = roleId;
      }
      if (businessIdCtrl.text.isNotEmpty) {
        final businessId = int.tryParse(businessIdCtrl.text.trim());
        if (businessId != null) query['business_id'] = businessId;
      }
      if (createdAtCtrl.text.isNotEmpty) {
        query['created_at'] = createdAtCtrl.text.trim();
      }
      if (sortByCtrl.text.isNotEmpty) {
        query['sort_by'] = sortByCtrl.text.trim();
      }
      if (sortOrderCtrl.text.isNotEmpty) {
        query['sort_order'] = sortOrderCtrl.text.trim();
      }

      final result = await repository.getUsers(query: query.isEmpty ? null : query);
      if (!result.success) {
        users.clear();
        totalCount.value = 0;
        errorMessage.value = 'No se pudieron cargar los usuarios';
        return;
      }
      users.assignAll(result.users);
      totalCount.value = result.count;
    } catch (_) {
      errorMessage.value = 'No se pudieron cargar los usuarios';
    } finally {
      isLoading.value = false;
    }
  }

  String formatDate(DateTime? value) {
    if (value == null) return 'Sin registro';
    return _dateFormat.format(value.toLocal());
  }

  void clearFilters() {
    pageCtrl.text = '1';
    pageSizeCtrl.text = '10';
    nameCtrl.clear();
    emailCtrl.clear();
    phoneCtrl.clear();
    roleIdCtrl.clear();
    businessIdCtrl.clear();
    createdAtCtrl.clear();
    sortByCtrl.text = 'created_at';
    sortOrderCtrl.text = 'desc';
    isActive.value = null;
    errorMessage.value = null;
  }
}
