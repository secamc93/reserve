// presentation/views/settings/settings_controller.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/config/theme/app_theme_controller.dart';
import 'package:rupu/config/services/biometric_auth_service.dart';
import 'package:rupu/config/helpers/dialog_helper.dart';
import 'package:rupu/presentation/views/home/home_controller.dart';

import '../views/create_user_view.dart';

class SettingsController extends GetxController {
  final AppThemeController _themeCtrl = Get.find<AppThemeController>();
  final HomeController _homeCtrl = Get.find<HomeController>();
  final BiometricAuthService _biometricService = BiometricAuthService();

  RxBool get isDarkRx => _themeCtrl.isDark;
  bool get isAdmin => _homeCtrl.isSuper;

  // Biometric observables
  final isBiometricAvailable = false.obs;
  final hasSavedCredentials = false.obs;
  final biometricDescription = 'Biometría'.obs;

  @override
  void onInit() {
    super.onInit();
    checkBiometricStatus();
  }

  /// Verifica el estado de la autenticación biométrica
  Future<void> checkBiometricStatus() async {
    isBiometricAvailable.value = await _biometricService.isBiometricAvailable();
    hasSavedCredentials.value = await _biometricService.hasStoredCredentials();
    biometricDescription.value = await _biometricService
        .getBiometricDescription();
  }

  void toggleTheme() => _themeCtrl.toggleTheme();

  void goToCreateUser(BuildContext context, int pageIndex) {
    if (!isAdmin) return;
    GoRouter.of(
      context,
    ).pushNamed(CreateUserView.name, pathParameters: {'page': '$pageIndex'});
  }

  /// Elimina las credenciales biométricas guardadas
  Future<void> removeBiometricCredentials(BuildContext context) async {
    final cs = Theme.of(context).colorScheme;

    final confirmed = await DialogHelper.showBlurredDialog<bool>(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.4),
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: cs.errorContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.delete_outline, color: cs.error, size: 28),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                '¿Eliminar biometría?',
                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Esto eliminará tus credenciales guardadas y ya no podrás iniciar sesión con ${biometricDescription.value}.',
              style: TextStyle(
                fontSize: 15,
                color: cs.onSurfaceVariant,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: cs.errorContainer.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: cs.error.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.warning_amber_rounded, size: 20, color: cs.error),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Tendrás que volver a guardar tus credenciales si deseas usar biometría nuevamente.',
                      style: TextStyle(
                        fontSize: 12,
                        color: cs.onErrorContainer,
                        height: 1.3,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () =>
                Navigator.of(context, rootNavigator: true).pop(false),
            child: Text(
              'Cancelar',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: cs.onSurfaceVariant,
              ),
            ),
          ),
          FilledButton(
            onPressed: () =>
                Navigator.of(context, rootNavigator: true).pop(true),
            style: FilledButton.styleFrom(
              backgroundColor: cs.error,
              foregroundColor: cs.onError,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text(
              'Eliminar',
              style: TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await _biometricService.clearStoredCredentials();
      hasSavedCredentials.value = false;

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle, color: cs.onPrimary),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'Credenciales biométricas eliminadas correctamente.',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            backgroundColor: cs.primary,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }
}
