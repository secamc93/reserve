import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:rupu/domain/entities/user_action_result.dart';
import 'package:rupu/domain/entities/user_detail.dart';
import 'package:rupu/domain/entities/user_list_item.dart';
import 'package:rupu/domain/infrastructure/datasources/users_management_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/repositories/users_repository_impl.dart';
import 'package:rupu/domain/repositories/users_repository.dart';
import 'package:rupu/presentation/views/home/home_controller.dart';

class UsersController extends GetxController {
  final UsersRepository repository;
  UsersController()
      : repository = UsersRepositoryImpl(UsersManagementDatasourceImpl());

  final HomeController _homeController = Get.find<HomeController>();

  final users = <UserListItem>[].obs;
  final isLoading = false.obs;
  final errorMessage = RxnString();
  final totalCount = 0.obs;
  final deletingUserId = RxnInt();

  // Filters
  final pageCtrl = TextEditingController(text: '1');
  final pageSizeCtrl = TextEditingController(text: '10');
  final searchCtrl = TextEditingController();
  final nameCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  final roleIdCtrl = TextEditingController();
  final businessIdCtrl = TextEditingController();
  final createdAtCtrl = TextEditingController();
  final sortByCtrl = TextEditingController(text: 'created_at');
  final sortOrderCtrl = TextEditingController(text: 'desc');
  final isActive = RxnBool();
  final appliedFilters = const _UsersFilterSnapshot().obs;

  final _dateFormat = DateFormat('dd/MM/yyyy HH:mm');

  bool get _hasManage =>
      _homeController.canAccessResource('users', actions: const ['Manage'], requireActive: false);

  bool _hasAction(String action) {
    if (_hasManage) return true;
    return _homeController.canAccessResource(
      'users',
      actions: [action],
      requireActive: false,
    );
  }

  bool get canRead => _hasAction('Read');
  bool get canCreate => _hasAction('Create');
  bool get canUpdate => _hasAction('Update');
  bool get canDelete => _hasAction('Delete');

  @override
  void onReady() {
    super.onReady();
    fetchUsers();
  }

  @override
  void onClose() {
    pageCtrl.dispose();
    pageSizeCtrl.dispose();
    searchCtrl.dispose();
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
    if (!canRead) {
      users.clear();
      totalCount.value = 0;
      errorMessage.value = 'No tienes permisos para ver los usuarios.';
      return;
    }

    isLoading.value = true;
    errorMessage.value = null;
    final filters = _UsersFilterSnapshot.fromController(this);
    try {
      final query = <String, dynamic>{};
      final page = int.tryParse(pageCtrl.text);
      final pageSize = int.tryParse(pageSizeCtrl.text);
      if (page != null) query['page'] = page;
      if (pageSize != null) query['page_size'] = pageSize;
      if (filters.search.isNotEmpty) {
        query['search'] = _wildcard(filters.search);
      }
      if (filters.name.isNotEmpty) {
        query['name'] = _wildcard(filters.name);
      }
      if (filters.email.isNotEmpty) {
        query['email'] = _wildcard(filters.email);
      }
      if (filters.phone.isNotEmpty) {
        query['phone'] = _wildcard(filters.phone);
      }
      if (isActive.value != null) query['is_active'] = isActive.value;
      if (filters.roleQuery.isNotEmpty) {
        final roleId = int.tryParse(filters.roleQuery);
        if (roleId != null) query['role_id'] = roleId;
      }
      if (filters.businessQuery.isNotEmpty) {
        final businessId = int.tryParse(filters.businessQuery);
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
      appliedFilters.value = filters;
      isLoading.value = false;
    }
  }

  Future<UserActionResult> deleteUser(int id) async {
    if (!canDelete) {
      return const UserActionResult(
        success: false,
        message: 'No tienes permisos para eliminar usuarios.',
      );
    }

    deletingUserId.value = id;
    try {
      final result = await repository.deleteUser(id: id);
      if (result.success) {
        users.removeWhere((u) => u.id == id);
        if (totalCount.value > 0) {
          totalCount.value = totalCount.value - 1;
        }
      }
      return result;
    } catch (_) {
      return const UserActionResult(
        success: false,
        message: 'No se pudo eliminar el usuario, intenta nuevamente.',
      );
    } finally {
      deletingUserId.value = null;
    }
  }

  void upsertUser(UserDetail detail) {
    final index = users.indexWhere((u) => u.id == detail.id);
    if (index >= 0) {
      users[index] = detail;
      users.refresh();
    } else {
      users.insert(0, detail);
    }
  }

  String formatDate(DateTime? value) {
    if (value == null) return 'Sin registro';
    return _dateFormat.format(value.toLocal());
  }

  void clearFilters() {
    pageCtrl.text = '1';
    pageSizeCtrl.text = '10';
    searchCtrl.clear();
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
    appliedFilters.value = const _UsersFilterSnapshot();
  }

  List<UserListItem> get visibleUsers {
    final filters = appliedFilters.value;
    Iterable<UserListItem> filtered = users;
    if (filters.search.isNotEmpty) {
      final query = filters.search.toLowerCase();
      filtered = filtered.where((user) => _matchesQuickSearch(user, query));
    }
    if (filters.name.isNotEmpty) {
      final query = filters.name.toLowerCase();
      filtered = filtered.where(
        (user) => user.name.toLowerCase().contains(query),
      );
    }
    if (filters.email.isNotEmpty) {
      final query = filters.email.toLowerCase();
      filtered = filtered.where(
        (user) => user.email.toLowerCase().contains(query),
      );
    }
    if (filters.phone.isNotEmpty) {
      final query = filters.phone.toLowerCase();
      filtered = filtered.where(
        (user) => user.phone.toLowerCase().contains(query),
      );
    }
    if (filters.isActive != null) {
      filtered = filtered.where((user) => user.isActive == filters.isActive);
    }
    if (filters.roleQuery.isNotEmpty) {
      final roleId = int.tryParse(filters.roleQuery);
      if (roleId != null) {
        filtered = filtered.where(
          (user) => user.roles.any((role) => role.id == roleId),
        );
      } else {
        final query = filters.roleQuery.toLowerCase();
        filtered = filtered.where((user) => user.roles.any((role) {
              final name = role.name.toLowerCase();
              final code = role.code?.toLowerCase() ?? '';
              return name.contains(query) || code.contains(query);
            }));
      }
    }
    if (filters.businessQuery.isNotEmpty) {
      final businessId = int.tryParse(filters.businessQuery);
      if (businessId != null) {
        filtered = filtered.where(
          (user) => user.businesses.any((biz) => biz.id == businessId),
        );
      } else {
        final query = filters.businessQuery.toLowerCase();
        filtered = filtered.where((user) => user.businesses.any((biz) {
              final name = biz.name.toLowerCase();
              final code = biz.code.toLowerCase();
              return name.contains(query) || code.contains(query);
            }));
      }
    }
    return filtered.toList(growable: false);
  }

  bool _matchesQuickSearch(UserListItem user, String query) {
    if (query.isEmpty) return true;
    final normalizedQuery = query.toLowerCase();
    if (user.name.toLowerCase().contains(normalizedQuery)) return true;
    if (user.email.toLowerCase().contains(normalizedQuery)) return true;
    if (user.phone.toLowerCase().contains(normalizedQuery)) return true;
    if ((user.isActive ? 'activo' : 'inactivo').contains(normalizedQuery)) {
      return true;
    }
    final roleMatch = user.roles.any((role) {
      final name = role.name.toLowerCase();
      final code = role.code?.toLowerCase() ?? '';
      return name.contains(normalizedQuery) || code.contains(normalizedQuery);
    });
    if (roleMatch) return true;
    final businessMatch = user.businesses.any((biz) {
      final name = biz.name.toLowerCase();
      final code = biz.code.toLowerCase();
      return name.contains(normalizedQuery) || code.contains(normalizedQuery);
    });
    return businessMatch;
  }

  String _wildcard(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) return trimmed;
    return trimmed.contains('%') ? trimmed : '%$trimmed%';
  }
}

class _UsersFilterSnapshot {
  final String search;
  final String name;
  final String email;
  final String phone;
  final bool? isActive;
  final String roleQuery;
  final String businessQuery;

  const _UsersFilterSnapshot({
    this.search = '',
    this.name = '',
    this.email = '',
    this.phone = '',
    this.isActive,
    this.roleQuery = '',
    this.businessQuery = '',
  });

  factory _UsersFilterSnapshot.fromController(UsersController controller) {
    return _UsersFilterSnapshot(
      search: controller.searchCtrl.text.trim(),
      name: controller.nameCtrl.text.trim(),
      email: controller.emailCtrl.text.trim(),
      phone: controller.phoneCtrl.text.trim(),
      isActive: controller.isActive.value,
      roleQuery: controller.roleIdCtrl.text.trim(),
      businessQuery: controller.businessIdCtrl.text.trim(),
    );
  }
}
