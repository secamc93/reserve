import 'package:get/get.dart';
import 'package:rupu/domain/entities/user_list_item.dart';
import 'package:rupu/domain/infrastructure/datasources/users_management_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/repositories/users_repository_impl.dart';
import 'package:rupu/domain/repositories/users_repository.dart';

class UsersController extends GetxController {
  final UsersRepository repository;
  UsersController()
      : repository = UsersRepositoryImpl(UsersManagementDatasourceImpl());

  final users = <UserListItem>[].obs;
  final isLoading = false.obs;
  final errorMessage = RxnString();

  @override
  void onReady() {
    super.onReady();
    fetchUsers();
  }

  Future<void> fetchUsers() async {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      final items = await repository.getUsers();
      users.assignAll(items);
    } catch (_) {
      errorMessage.value = 'No se pudieron cargar los usuarios';
    } finally {
      isLoading.value = false;
    }
  }
}
