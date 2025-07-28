/// Modelo de datos para mapear JSON de una respuesta genérica.
class CambiarContrasenaResponseModel {
  final String message;
  final bool success;

  CambiarContrasenaResponseModel({
    required this.message,
    required this.success,
  });

  /// Crea una instancia de [ResponseModel] a partir de un mapa JSON.
  factory CambiarContrasenaResponseModel.fromJson(Map<String, dynamic> json) {
    return CambiarContrasenaResponseModel(
      message: json['message'] as String,
      success: json['success'] as bool,
    );
  }

  /// Convierte la instancia a un mapa JSON.
  Map<String, dynamic> toJson() {
    return {'message': message, 'success': success};
  }
}
