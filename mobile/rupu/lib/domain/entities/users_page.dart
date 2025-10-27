import 'user_list_item.dart';

class UsersPage {
  final bool success;
  final int count;
  final List<UserListItem> users;

  const UsersPage({
    required this.success,
    required this.count,
    required this.users,
  });
}
