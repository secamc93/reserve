import 'package:rupu/domain/entities/cambiar_contrasena.dart';
import 'package:rupu/domain/infrastructure/models/cambiar_contrasena_response_model.dart';

class CambioContrasenaMapper {
  static CambiarContrasena cambiarContrasenaToEntity(
    CambiarContrasenaResponseModel cambiarContrasena,
  ) => CambiarContrasena(
    message: cambiarContrasena.message,
    success: cambiarContrasena.success,
  );
}
