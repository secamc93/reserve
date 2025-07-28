import 'package:rupu/domain/entities/user.dart';
import 'package:rupu/domain/infrastructure/models/login_response_model.dart';

class UserMapper {
  /// Mapea el JSON de la respuesta de login a [AuthSession].
  static User loginUserToEntity(LoginResponseModel user) => User(
    id: user.data.user.id,
    name: user.data.user.name,
    email: user.data.user.email,
    phone: user.data.user.phone,
    avatarUrl: user.data.user.avatarUrl,
    isActive: user.data.user.isActive,
    lastLoginAt: user.data.user.lastLoginAt,
    token: user.data.token,
    requirePasswordChange: user.data.requirePasswordChange,
  );
}
