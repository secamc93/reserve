import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:get/get.dart';
import 'package:local_auth/local_auth.dart';
import 'package:rupu/config/helpers/error_message_helper.dart';
import 'package:rupu/config/theme/app_theme.dart';
import 'package:rupu/config/constants/secure_storage/token_storage.dart';
import 'package:rupu/config/services/biometric_auth_service.dart';
import 'package:rupu/domain/infrastructure/datasources/user_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/models/login_response_model.dart';
import 'package:rupu/domain/infrastructure/repositories/user_repository_impl.dart';
import 'package:rupu/domain/repositories/user_repository.dart';

class LoginController extends GetxController {
  final UserRepository repository;
  final BiometricAuthService biometricService;

  LoginController()
    : repository = UserRepositoryImpl(UserDatasource()),
      biometricService = BiometricAuthService();

  final formKey = GlobalKey<FormState>();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final isFormLoading = false.obs;
  final isBiometricLoading = false.obs;

  // Getter para compatibilidad si se usa en otros lados
  bool get isLoading => isFormLoading.value || isBiometricLoading.value;

  final errorMessage = RxnString();
  final Rxn<LoginResponseModel> sessionModel = Rxn();
  final Rxn<BusinessModel> selectedBusiness = Rxn();

  // Biometric authentication observables
  final isBiometricAvailable = false.obs;
  final hasSavedCredentials = false.obs;
  final Rxn<BiometricType> biometricType = Rxn();
  final biometricDescription = 'Biometría'.obs;

  @override
  void onInit() {
    super.onInit();
    _checkBiometricAvailability();
  }

  /// Verifica la disponibilidad de autenticación biométrica
  Future<void> _checkBiometricAvailability() async {
    isBiometricAvailable.value = await biometricService.isBiometricAvailable();
    hasSavedCredentials.value = await biometricService.hasStoredCredentials();
    biometricType.value = await biometricService.getBiometricType();
    biometricDescription.value = await biometricService
        .getBiometricDescription();
  }

  /// Ejecuta login y devuelve si fue exitoso.
  /// Si [saveBiometric] es true, guarda las credenciales para login biométrico
  Future<bool> submit({bool saveBiometric = false}) async {
    if (!formKey.currentState!.validate()) return false;
    isFormLoading.value = true;
    errorMessage.value = null;
    try {
      await TokenStorage().clearAllTokens();
      final session = await repository.getUser(
        email: emailController.text.trim().toLowerCase(),
        password: passwordController.text,
      );

      sessionModel.value = session;
      selectedBusiness.value = null;

      final loginToken = session.data.token;
      if (loginToken.isNotEmpty) {
        await TokenStorage().saveLoginToken(loginToken);
      }

      // Guardar credenciales para autenticación biométrica si se solicita
      if (saveBiometric) {
        await biometricService.saveCredentials(
          email: emailController.text.trim().toLowerCase(),
          password: passwordController.text,
        );
        hasSavedCredentials.value = true;
      }

      return true;
    } on DioException catch (e) {
      errorMessage.value = (e.response?.statusCode == 401)
          ? 'Email o contraseña incorrectos.'
          : ErrorMessageHelper.getUserFriendlyMessage(
              e,
              fallbackMessage: 'No se pudo iniciar sesión. Intenta nuevamente.',
            );
      return false;
    } finally {
      isFormLoading.value = false;
    }
  }

  /// Realiza login con autenticación biométrica
  /// Retorna true si el login fue exitoso
  Future<bool> loginWithBiometrics() async {
    try {
      isBiometricLoading.value = true;
      errorMessage.value = null;

      // Verificar que hay credenciales guardadas
      if (!await biometricService.hasStoredCredentials()) {
        errorMessage.value =
            'No hay credenciales guardadas. Inicia sesión con email y contraseña primero.';
        return false;
      }

      // Solicitar autenticación biométrica
      final authenticated = await biometricService.authenticate();
      if (!authenticated) {
        errorMessage.value = 'Autenticación biométrica cancelada.';
        return false;
      }

      // Obtener credenciales guardadas
      final credentials = await biometricService.getStoredCredentials();
      if (credentials == null) {
        errorMessage.value = 'No se pudieron recuperar las credenciales.';
        return false;
      }

      // Realizar login con credenciales guardadas
      await TokenStorage().clearAllTokens();
      final session = await repository.getUser(
        email: credentials['email']!,
        password: credentials['password']!,
      );

      sessionModel.value = session;
      selectedBusiness.value = null;

      final loginToken = session.data.token;
      if (loginToken.isNotEmpty) {
        await TokenStorage().saveLoginToken(loginToken);
      }

      return true;
    } on BiometricException catch (e) {
      // Errores específicos de biometría (no enrollado, bloqueado, etc.)
      errorMessage.value = e.message;
      return false;
    } on DioException catch (e) {
      errorMessage.value = (e.response?.statusCode == 401)
          ? 'Las credenciales guardadas ya no son válidas. Por favor, inicia sesión nuevamente.'
          : ErrorMessageHelper.getUserFriendlyMessage(
              e,
              fallbackMessage: 'No se pudo completar el login biométrico.',
            );

      // Si las credenciales ya no son válidas, limpiarlas
      if (e.response?.statusCode == 401) {
        await biometricService.clearStoredCredentials();
        hasSavedCredentials.value = false;
      }

      return false;
    } catch (e) {
      errorMessage.value = 'Error inesperado durante el login biométrico.';
      return false;
    } finally {
      isBiometricLoading.value = false;
    }
  }

  /// Limpia los campos de email y contraseña.
  void clearFields() {
    emailController.clear();
    passwordController.clear();
    sessionModel.value = null;
    selectedBusiness.value = null;
  }

  /// Cierra la sesión eliminando solo los tokens de autenticación
  /// Las credenciales biométricas se mantienen guardadas en secure_storage
  Future<void> logout() async {
    await TokenStorage().clearAllTokens();
    // NO eliminamos las credenciales biométricas para permitir login rápido
    // Pero sí verificamos el estado actual
    hasSavedCredentials.value = await biometricService.hasStoredCredentials();
    clearFields();
  }

  /// Elimina las credenciales biométricas guardadas
  /// Útil si el usuario desea desactivar el login biométrico manualmente
  Future<void> removeBiometricCredentials() async {
    await biometricService.clearStoredCredentials();
    hasSavedCredentials.value = false;
  }

  void selectBusiness(BusinessModel business) {
    selectedBusiness.value = business;
    AppTheme.instance.updateColors(
      business.primaryColor,
      business.secondaryColor,
      business.tertiaryColor,
      business.quaternaryColor,
    );
  }

  List<BusinessModel> get businesses =>
      sessionModel.value?.data.businesses ?? const <BusinessModel>[];

  int? get selectedBusinessId => selectedBusiness.value?.id;

  String get _normalizedScope {
    final scope = sessionModel.value?.data.scope;
    if (scope == null || scope.isEmpty) return '';
    return scope.toLowerCase().trim();
  }

  bool get hasBusinessScope => _normalizedScope == 'business';

  bool get isSuperAdmin => sessionModel.value?.data.isSuperAdmin ?? false;

  Future<bool> activateBusinessSession(BusinessModel business) async {
    final loginToken = sessionModel.value?.data.token;
    if (loginToken == null || loginToken.isEmpty) {
      errorMessage.value =
          'No se encontró un token de autenticación válido para la sesión actual.';
      return false;
    }

    errorMessage.value = null;

    try {
      final businessToken = await repository.getBusinessToken(
        token: loginToken,
        businessId: business.id,
      );

      await TokenStorage().saveBusinessToken(businessToken);
      selectBusiness(business);
      return true;
    } on DioException catch (e) {
      errorMessage.value = _resolveDioMessage(
        e,
        'No fue posible activar el negocio seleccionado.',
      );
      return false;
    } catch (_) {
      errorMessage.value = 'No fue posible activar el negocio seleccionado.';
      return false;
    }
  }

  Future<bool> activateSuperAdminSession() async {
    final loginToken = sessionModel.value?.data.token;
    if (loginToken == null || loginToken.isEmpty) {
      errorMessage.value =
          'No se encontró un token de autenticación válido para la sesión actual.';
      return false;
    }

    errorMessage.value = null;

    try {
      final businessToken = await repository.getBusinessToken(
        token: loginToken,
        businessId: 0,
      );

      await TokenStorage().saveBusinessToken(businessToken);
      selectedBusiness.value = null;
      return true;
    } on DioException catch (e) {
      errorMessage.value = _resolveDioMessage(
        e,
        'No fue posible completar la sesión del super administrador.',
      );
      return false;
    } catch (_) {
      errorMessage.value =
          'No fue posible completar la sesión del super administrador.';
      return false;
    }
  }

  String _resolveDioMessage(DioException e, String fallback) {
    final data = e.response?.data;
    if (data is Map<String, dynamic>) {
      final messageCandidate = data['message'] ?? data['error'];
      if (messageCandidate is String && messageCandidate.isNotEmpty) {
        return messageCandidate;
      }
    }
    return fallback;
  }

  @override
  void onClose() {
    emailController.dispose();
    passwordController.dispose();
    super.onClose();
  }
}
