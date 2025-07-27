/// Entidad de dominio que representa al usuario autenticado.
class User {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String avatarUrl;
  final bool isActive;
  final DateTime lastLoginAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.avatarUrl,
    required this.isActive,
    required this.lastLoginAt,
  });
}
