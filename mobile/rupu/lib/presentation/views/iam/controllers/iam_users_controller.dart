import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/domain/entities/iam_pagination.dart';
import 'package:rupu/domain/entities/iam_user.dart';
import 'package:rupu/domain/entities/role.dart';
import 'package:rupu/domain/entities/iam_generate_password_result.dart';
import 'package:rupu/domain/entities/user_action_result.dart';
import 'package:rupu/domain/infrastructure/repositories/iam_repository_impl.dart';
import 'package:rupu/domain/repositories/iam_repository.dart';
import 'package:rupu/presentation/views/users/users_controller.dart';

class IamUsersController extends GetxController {
  final IamRepository repository;

  IamUsersController({IamRepository? repository})
    : repository = repository ?? IamRepositoryImpl();

  final users = <IamUser>[].obs;
  final isLoading = false.obs;
  final isLoadingMore = false.obs;
  final errorMessage = RxnString();
  final pagination = Rxn<IamPagination>();
  final searchText = ''.obs;
  final searchCtrl = TextEditingController();
  final deletingUserId = RxnInt();
  final int perPage = 20;
  int _nextPage = 1;
  bool _hasMore = true;

  UsersController? get _usersController =>
      Get.isRegistered<UsersController>() ? Get.find<UsersController>() : null;

  @override
  void onInit() {
    super.onInit();
    debounce<String>(
      searchText,
      (_) => fetchUsers(reset: true),
      time: const Duration(milliseconds: 400),
    );
    fetchUsers(reset: true);
  }

  Future<void> fetchUsers({bool reset = false}) async {
    if (isLoading.value || isLoadingMore.value) return;
    if (!_hasMore && !reset) return;

    if (reset) {
      isLoading.value = true;
      errorMessage.value = null;
      _nextPage = 1;
      _hasMore = true;
    } else {
      isLoadingMore.value = true;
    }

    try {
      final query = searchText.value.trim();
      final filters = _resolveSearchFilters(query);
      final result = await repository.getUsers(
        page: _nextPage,
        pageSize: perPage,
        name: filters.name,
        email: filters.email,
        phone: filters.phone,
      );

      pagination.value = result.pagination;
      _hasMore = result.pagination.hasNext;
      _nextPage = result.pagination.currentPage + 1;

      if (reset) {
        users.assignAll(result.users);
      } else {
        users.addAll(result.users);
      }
    } catch (_) {
      errorMessage.value = 'No se pudieron cargar los usuarios.';
    } finally {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  }

  void setSearch(String value) {
    searchText.value = value;
  }

  void clearSearch() {
    if (searchCtrl.text.isNotEmpty) {
      searchCtrl.clear();
    }
    searchText.value = '';
  }

  Future<void> refreshData() async {
    await fetchUsers(reset: true);
  }

  void loadMore() {
    fetchUsers(reset: false);
  }

  Future<UserActionResult> deleteUser(int id) async {
    final usersController = _usersController;
    if (usersController == null) {
      return const UserActionResult(
        success: false,
        message: 'No es posible eliminar usuarios en este momento.',
      );
    }

    deletingUserId.value = id;
    try {
      final result = await usersController.deleteUser(id);
      if (result.success) {
        users.removeWhere((user) => user.id == id);
        final currentPagination = pagination.value;
        if (currentPagination != null && currentPagination.total > 0) {
          pagination.value = currentPagination.copyWith(
            total: currentPagination.total - 1,
          );
        }
      }
      return result;
    } finally {
      deletingUserId.value = null;
    }
  }

  _IamUserSearchFilters _resolveSearchFilters(String query) {
    if (query.isEmpty) {
      return const _IamUserSearchFilters();
    }

    final trimmed = query.trim();
    if (_looksLikeEmail(trimmed)) {
      return _IamUserSearchFilters(email: trimmed);
    }

    if (_looksLikePhone(trimmed)) {
      final sanitized = trimmed.replaceAll(RegExp(r'[^0-9+]'), '');
      return _IamUserSearchFilters(phone: sanitized);
    }

    return _IamUserSearchFilters(name: trimmed);
  }

  bool _looksLikeEmail(String value) {
    return value.contains('@') && value.contains('.');
  }

  bool _looksLikePhone(String value) {
    final candidate = value.replaceAll(RegExp(r'[^0-9+]'), '');
    if (candidate.isEmpty) return false;
    return RegExp(r'^\+?\d{4,}$').hasMatch(candidate);
  }

  @override
  void onClose() {
    searchCtrl.dispose();
    super.onClose();
  }

  Future<List<Role>> fetchRoles({int? businessTypeId}) async {
    try {
      final result = await repository.getRoles(businessTypeId: businessTypeId);
      return result.roles;
    } catch (e) {
      rethrow;
    }
  }

  Future<IamGeneratePasswordResult> generatePassword(int userId) async {
    return await repository.generatePassword(userId);
  }
}

class _IamUserSearchFilters {
  final String? name;
  final String? email;
  final String? phone;

  const _IamUserSearchFilters({this.name, this.email, this.phone});
}
