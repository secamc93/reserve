/// Modelo de datos para mapear JSON de una respuesta genérica.
class ChangePasswordResponseModel {
  final String message;
  final bool success;

  ChangePasswordResponseModel({required this.message, required this.success});

  /// Crea una instancia de [ResponseModel] a partir de un mapa JSON.
  factory ChangePasswordResponseModel.fromJson(Map<String, dynamic> json) {
    return ChangePasswordResponseModel(
      message: json['message'] as String,
      success: json['success'] as bool,
    );
  }

  /// Convierte la instancia a un mapa JSON.
  Map<String, dynamic> toJson() {
    return {'message': message, 'success': success};
  }
}
