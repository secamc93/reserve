import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;
import 'package:rupu/domain/entities/iam_business.dart';
import 'package:rupu/domain/entities/user_action_result.dart';
import 'package:rupu/domain/entities/user_detail.dart';
import 'package:rupu/domain/entities/user_list_item.dart';
import 'package:rupu/domain/infrastructure/datasources/users_management_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/repositories/iam_repository_impl.dart';
import 'package:rupu/domain/infrastructure/repositories/users_repository_impl.dart';
import 'package:rupu/domain/repositories/iam_repository.dart';
import 'package:rupu/domain/repositories/users_repository.dart';
import 'package:rupu/presentation/views/home/home_controller.dart';
import 'package:rupu/presentation/views/settings/models/avatar_file_data.dart';
import 'package:rupu/presentation/views/settings/utils/avatar_file_helper.dart';
import 'package:rupu/presentation/views/users/users_controller.dart';

class UserDetailController extends GetxController {
  final UsersRepository repository;
  final IamRepository iamRepository;
  UserDetailController({IamRepository? iamRepository})
    : repository = UsersRepositoryImpl(UsersManagementDatasourceImpl()),
      iamRepository = iamRepository ?? IamRepositoryImpl();

  final HomeController _homeController = Get.find<HomeController>();

  final formKey = GlobalKey<FormState>();
  final nameCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  final roleIdsCtrl = TextEditingController();
  final avatarUrlCtrl = TextEditingController();
  final businessSearchCtrl = TextEditingController();

  final isActive = true.obs;
  final isLoading = false.obs;
  final isSaving = false.obs;
  final isDeleting = false.obs;
  final avatarProcessing = false.obs;
  final avatarError = RxnString();
  final hasAvatarUrl = false.obs;
  final avatarFile = Rxn<AvatarFileData>();
  final user = Rxn<UserDetail>();
  final errorMessage = RxnString();
  final selectedBusinesses = <UserBusinessSummary>[].obs;
  final businessSuggestions = <IamBusiness>[].obs;
  final businessSuggestionsLoading = false.obs;
  final businessSuggestionsError = RxnString();

  int? _userId;

  bool get _hasManage => _homeController.canAccessResource(
    'users',
    actions: const ['Manage'],
    requireActive: false,
  );

  bool _hasAction(String action) {
    if (_hasManage) return true;
    return _homeController.canAccessResource(
      'users',
      actions: [action],
      requireActive: false,
    );
  }

  bool get canRead => _hasAction('Read');
  bool get canUpdate => _hasAction('Update');
  bool get canDelete => _hasAction('Delete');

  Future<void> loadUser(int id) async {
    _userId = id;
    if (!canRead) {
      errorMessage.value = 'No tienes permisos para ver usuarios.';
      user.value = null;
      return;
    }
    isLoading.value = true;
    errorMessage.value = null;
    avatarFile.value = null;
    hasAvatarUrl.value = false;
    selectedBusinesses.clear();

    try {
      final detail = await repository.getUserDetail(id: id);
      if (detail == null) {
        errorMessage.value = 'No se encontró información del usuario.';
        return;
      }

      user.value = detail;
      _populateControllers(detail);
    } catch (e) {
      errorMessage.value = 'Error al cargar el usuario: $e';
    } finally {
      isLoading.value = false;
    }
  }

  void _populateControllers(UserDetail detail) {
    nameCtrl.text = detail.name;
    emailCtrl.text = detail.email;
    phoneCtrl.text = detail.phone;
    roleIdsCtrl.text = detail.roles.map((r) => r.id).join(',');
    avatarUrlCtrl.text = detail.avatarUrl;
    hasAvatarUrl.value = false;
    isActive.value = detail.isActive;
    selectedBusinesses.assignAll(detail.businesses);
  }

  List<int> _parseIds(String input) {
    return input
        .split(',')
        .map((e) => int.tryParse(e.trim()))
        .whereType<int>()
        .toList();
  }

  Future<void> pickAvatarFromCamera() async {
    final picker = ImagePicker();
    final xfile = await picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 92,
      maxWidth: 2000,
    );
    if (xfile == null) return;

    avatarProcessing.value = true;
    avatarError.value = null;
    errorMessage.value = null;

    try {
      final file = File(xfile.path);
      if (!await file.exists()) {
        avatarError.value = 'No se pudo acceder a la foto tomada.';
        return;
      }

      final length = await file.length();
      avatarFile.value = AvatarFileData(
        path: xfile.path,
        fileName: p.basename(xfile.path),
        sizeInBytes: length,
      );

      avatarUrlCtrl.clear();
      hasAvatarUrl.value = false;
    } catch (_) {
      avatarError.value = 'Ocurrió un error al tomar la foto.';
      avatarFile.value = null;
    } finally {
      avatarProcessing.value = false;
    }
  }

  Future<void> pickAvatar() async {
    final result = await FilePicker.platform.pickFiles(type: FileType.image);
    if (result == null || result.files.isEmpty) {
      return;
    }

    avatarProcessing.value = true;
    avatarError.value = null;
    errorMessage.value = null;

    try {
      final processed = await AvatarFileHelper.process(result.files.first);
      if (processed == null) {
        avatarError.value = 'No se pudo procesar la imagen seleccionada.';
        avatarFile.value = null;
        return;
      }
      avatarFile.value = processed;
      avatarUrlCtrl.clear();
      hasAvatarUrl.value = false;
    } catch (_) {
      avatarError.value = 'Ocurrió un error al comprimir la imagen.';
      avatarFile.value = null;
    } finally {
      avatarProcessing.value = false;
    }
  }

  void removeAvatarFile() {
    avatarFile.value = null;
    avatarError.value = null;
  }

  void onAvatarUrlChanged(String value) {
    hasAvatarUrl.value = value.trim().isNotEmpty;
    if (hasAvatarUrl.value) {
      avatarFile.value = null;
      avatarError.value = null;
    }
  }

  String formatFileSize(int bytes) {
    if (bytes <= 0) return '0 KB';
    const units = ['B', 'KB', 'MB'];
    double size = bytes.toDouble();
    int unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    final decimals = unitIndex == 0 ? 0 : 1;
    return '${size.toStringAsFixed(decimals)} ${units[unitIndex]}';
  }

  Future<UserActionResult?> submit() async {
    if (!canUpdate) {
      errorMessage.value = 'No tienes permisos para actualizar usuarios.';
      return const UserActionResult(
        success: false,
        message: 'No tienes permisos para actualizar usuarios.',
      );
    }
    if (!formKey.currentState!.validate()) return null;
    if (_userId == null) {
      return const UserActionResult(
        success: false,
        message: 'No se ha cargado el usuario.',
      );
    }
    if (avatarProcessing.value) {
      avatarError.value =
          'Espera a que finalice el procesamiento de la imagen.';
      return null;
    }

    isSaving.value = true;
    errorMessage.value = null;

    try {
      final avatarData = avatarFile.value;
      final avatarUrl = avatarUrlCtrl.text.trim();
      final result = await repository.updateUser(
        id: _userId!,
        name: nameCtrl.text.trim(),
        email: emailCtrl.text.trim(),
        phone: phoneCtrl.text.trim().isEmpty ? null : phoneCtrl.text.trim(),
        isActive: isActive.value,
        roleIds: _parseIds(roleIdsCtrl.text),
        businessIds: selectedBusinesses.map((biz) => biz.id).toList(),
        avatarUrl: avatarUrl.isEmpty ? null : avatarUrl,
        avatarPath: avatarData?.path,
        avatarFileName: avatarData?.fileName,
      );

      if (!result.success) {
        errorMessage.value =
            result.message ??
            'No se pudo actualizar el usuario, intenta nuevamente.';
        return result;
      }

      final detail = result.user;
      if (detail != null) {
        user.value = detail;
        _populateControllers(detail);
        if (Get.isRegistered<UsersController>()) {
          Get.find<UsersController>().upsertUser(detail);
        }
      }

      avatarFile.value = null;

      return result;
    } catch (e) {
      errorMessage.value = 'Error al actualizar el usuario: $e';
      return UserActionResult(
        success: false,
        message: 'Error al actualizar el usuario: $e',
      );
    } finally {
      isSaving.value = false;
    }
  }

  Future<UserActionResult> deleteCurrentUser() async {
    if (!canDelete) {
      return const UserActionResult(
        success: false,
        message: 'No tienes permisos para eliminar usuarios.',
      );
    }
    if (_userId == null) {
      return const UserActionResult(
        success: false,
        message: 'No se ha cargado el usuario.',
      );
    }

    isDeleting.value = true;
    try {
      final result = await repository.deleteUser(id: _userId!);
      if (result.success && Get.isRegistered<UsersController>()) {
        final usersController = Get.find<UsersController>();
        usersController.users.removeWhere((u) => u.id == _userId);
        if (usersController.totalCount.value > 0) {
          usersController.totalCount.value =
              usersController.totalCount.value - 1;
        }
      }
      return result;
    } catch (e) {
      return UserActionResult(
        success: false,
        message: 'No se pudo eliminar el usuario: $e',
      );
    } finally {
      isDeleting.value = false;
    }
  }

  @override
  void onClose() {
    nameCtrl.dispose();
    emailCtrl.dispose();
    phoneCtrl.dispose();
    roleIdsCtrl.dispose();
    avatarUrlCtrl.dispose();
    businessSearchCtrl.dispose();
    super.onClose();
  }

  Future<void> searchBusinesses(String query) async {
    if (!canUpdate) return;
    businessSuggestionsLoading.value = true;
    businessSuggestionsError.value = null;
    try {
      final page = await iamRepository.getBusinesses(
        page: 1,
        perPage: 20,
        name: query.trim().isEmpty ? null : query.trim(),
      );
      businessSuggestions.assignAll(page.businesses);
    } catch (_) {
      businessSuggestions.assignAll(const []);
      businessSuggestionsError.value =
          'No se pudieron cargar los negocios disponibles.';
    } finally {
      businessSuggestionsLoading.value = false;
    }
  }

  void addBusinessFromCatalog(IamBusiness business) {
    if (selectedBusinesses.any((b) => b.id == business.id)) return;
    selectedBusinesses.add(_summaryFromBusiness(business));
    selectedBusinesses.sort((a, b) => a.name.compareTo(b.name));
  }

  void removeBusiness(int businessId) {
    selectedBusinesses.removeWhere((biz) => biz.id == businessId);
  }

  UserBusinessSummary _summaryFromBusiness(IamBusiness business) {
    return UserBusinessSummary(
      id: business.id,
      name: business.name,
      code: business.code,
      businessTypeId: business.businessTypeId,
      address: business.address.isEmpty ? null : business.address,
      description: business.description.isEmpty ? null : business.description,
      logoUrl: business.logoUrl.isEmpty ? null : business.logoUrl,
      isActive: business.isActive,
      businessTypeName: business.businessType.isEmpty
          ? null
          : business.businessType,
      businessTypeCode: business.businessType.isEmpty
          ? null
          : business.businessType,
    );
  }
}
