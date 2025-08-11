import 'package:rupu/domain/entities/change_password.dart';
import 'package:rupu/domain/infrastructure/models/change_password_response_model.dart';

class ChangePasswordMapper {
  static ChangePassword cambiarContrasenaToEntity(
    ChangePasswordResponseModel cambiarContrasena,
  ) => ChangePassword(
    message: cambiarContrasena.message,
    success: cambiarContrasena.success,
  );
}
