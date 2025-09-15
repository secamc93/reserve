// presentation/views/settings/create_user_controller.dart
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/domain/infrastructure/datasources/users_management_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/repositories/users_repository_impl.dart';
import 'package:rupu/domain/repositories/users_repository.dart';

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
  final Rxn<PlatformFile> avatarFile = Rxn();
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
    if (result != null && result.files.isNotEmpty) {
      avatarFile.value = result.files.first;
    }
  }

  Future<bool> submit() async {
    if (!formKey.currentState!.validate()) return false;
    isSubmitting.value = true;
    errorMessage.value = null;
    try {
      await repository.createUser(
        name: nameCtrl.text.trim(),
        email: emailCtrl.text.trim(),
        phone: phoneCtrl.text.trim().isEmpty ? null : phoneCtrl.text.trim(),
        isActive: isActive.value,
        roleIds: _parseIds(roleIdsCtrl.text),
        businessIds: _parseIds(businessIdsCtrl.text),
        avatarUrl:
            avatarUrlCtrl.text.trim().isEmpty ? null : avatarUrlCtrl.text.trim(),
        avatarPath: avatarFile.value?.path,
      );
      return true;
    } catch (_) {
      errorMessage.value = 'Error al crear usuario';
      return false;
    } finally {
      isSubmitting.value = false;
    }
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
