import 'package:rupu/domain/entities/user_list_item.dart';
import '../models/users_response_model.dart';

class UsersMapper {
  static UserListItem userModelToEntity(UserModel model) => UserListItem(
        id: model.id,
        name: model.name,
        email: model.email,
        phone: model.phone,
        avatarUrl: model.avatarUrl,
        isActive: model.isActive,
      );
}
