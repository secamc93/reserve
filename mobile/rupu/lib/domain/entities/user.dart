/// Entidad de dominio que representa al usuario autenticado.
class User {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String avatarUrl;
  final bool isActive;
  final String lastLoginAt;
  final String token;
  final bool requirePasswordChange;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.avatarUrl,
    required this.isActive,
    required this.lastLoginAt,
    required this.token,
    required this.requirePasswordChange,
  });
}
