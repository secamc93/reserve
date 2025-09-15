import 'package:flutter/material.dart';
import 'package:get/get.dart';
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
      final query = {
        'page': int.tryParse(pageCtrl.text) ?? 1,
        'page_size': int.tryParse(pageSizeCtrl.text) ?? 10,
        if (nameCtrl.text.isNotEmpty) 'name': nameCtrl.text,
        if (emailCtrl.text.isNotEmpty) 'email': emailCtrl.text,
        if (phoneCtrl.text.isNotEmpty) 'phone': phoneCtrl.text,
        if (isActive.value != null) 'is_active': isActive.value,
        if (roleIdCtrl.text.isNotEmpty) 'role_id': int.tryParse(roleIdCtrl.text),
        if (businessIdCtrl.text.isNotEmpty)
          'business_id': int.tryParse(businessIdCtrl.text),
        if (createdAtCtrl.text.isNotEmpty) 'created_at': createdAtCtrl.text,
        if (sortByCtrl.text.isNotEmpty) 'sort_by': sortByCtrl.text,
        if (sortOrderCtrl.text.isNotEmpty) 'sort_order': sortOrderCtrl.text,
      };

      final items = await repository.getUsers(query: query);
      users.assignAll(items);
    } catch (_) {
      errorMessage.value = 'No se pudieron cargar los usuarios';
    } finally {
      isLoading.value = false;
    }
  }
}
