/// Entidad de dominio que representa al cambio de contraseña.
class ChangePassword {
  final String message;
  final bool success;

  ChangePassword({required this.message, required this.success});
}
