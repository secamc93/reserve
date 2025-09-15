// presentation/views/settings/create_user_controller.dart
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/domain/infrastructure/datasources/users_management_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/repositories/users_repository_impl.dart';
import 'package:rupu/domain/repositories/users_repository.dart';
import 'package:rupu/presentation/views/settings/models/avatar_file_data.dart';
import 'package:rupu/presentation/views/settings/utils/avatar_file_helper.dart';

class CreateUserController extends GetxController {
  final UsersRepository repository;
  CreateUserController()
      : repository = UsersRepositoryImpl(UsersManagementDatasourceImpl());

  final formKey = GlobalKey<FormState>();
  final nameCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  final avatarUrlCtrl = TextEditingController();
  final roleIdsCtrl = TextEditingController();
  final businessIdsCtrl = TextEditingController();

  final isActive = true.obs;
  final Rxn<AvatarFileData> avatarFile = Rxn();
  final avatarProcessing = false.obs;
  final avatarError = RxnString();
  final hasAvatarUrl = false.obs;
  final isSubmitting = false.obs;
  final errorMessage = RxnString();

  List<int> _parseIds(String input) {
    return input
        .split(',')
        .map((e) => int.tryParse(e.trim()))
        .whereType<int>()
        .toList();
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

  Future<bool> submit() async {
    if (!formKey.currentState!.validate()) return false;
    if (avatarProcessing.value) {
      avatarError.value =
          'Por favor espera a que terminemos de procesar la imagen.';
      return false;
    }
    isSubmitting.value = true;
    errorMessage.value = null;
    try {
      final avatarData = avatarFile.value;
      final avatarUrl = avatarUrlCtrl.text.trim();
      await repository.createUser(
        name: nameCtrl.text.trim(),
        email: emailCtrl.text.trim(),
        phone: phoneCtrl.text.trim().isEmpty ? null : phoneCtrl.text.trim(),
        isActive: isActive.value,
        roleIds: _parseIds(roleIdsCtrl.text),
        businessIds: _parseIds(businessIdsCtrl.text),
        avatarUrl: avatarUrl.isEmpty ? null : avatarUrl,
        avatarPath: avatarData?.path,
        avatarFileName: avatarData?.fileName,
      );
      return true;
    } catch (_) {
      errorMessage.value = 'Error al crear usuario';
      return false;
    } finally {
      isSubmitting.value = false;
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

  @override
  void onClose() {
    nameCtrl.dispose();
    emailCtrl.dispose();
    phoneCtrl.dispose();
    avatarUrlCtrl.dispose();
    roleIdsCtrl.dispose();
    businessIdsCtrl.dispose();
    super.onClose();
  }
}
