import 'package:get/get.dart';
import 'package:rupu/domain/entities/iam_pagination.dart';
import 'package:rupu/domain/entities/iam_user.dart';
import 'package:rupu/domain/infrastructure/repositories/iam_repository_impl.dart';
import 'package:rupu/domain/repositories/iam_repository.dart';

class IamUsersController extends GetxController {
  final IamRepository repository;

  IamUsersController({IamRepository? repository})
      : repository = repository ?? IamRepositoryImpl();

  final users = <IamUser>[].obs;
  final isLoading = false.obs;
  final errorMessage = RxnString();
  final pagination = Rxn<IamPagination>();
  final searchText = ''.obs;
  int _currentPage = 1;
  final int perPage = 10;

  @override
  void onInit() {
    super.onInit();
    debounce<String>(searchText, (_) => fetchUsers(page: 1),
        time: const Duration(milliseconds: 400));
    fetchUsers();
  }

  Future<void> fetchUsers({int? page}) async {
    if (isLoading.value) return;
    final targetPage = page ?? _currentPage;
    isLoading.value = true;
    errorMessage.value = null;
    try {
      final result = await repository.getUsers(
        page: targetPage,
        perPage: perPage,
        search: searchText.value.trim().isEmpty ? null : searchText.value.trim(),
      );
      _currentPage = result.pagination.currentPage;
      users.assignAll(result.users);
      pagination.value = result.pagination;
    } catch (error) {
      errorMessage.value = 'No se pudieron cargar los usuarios.';
    } finally {
      isLoading.value = false;
    }
  }

  void setSearch(String value) {
    searchText.value = value;
  }

  Future<void> refreshData() async {
    await fetchUsers(page: _currentPage);
  }

  void nextPage() {
    final meta = pagination.value;
    if (meta == null || !meta.hasNext) return;
    fetchUsers(page: meta.currentPage + 1);
  }

  void previousPage() {
    final meta = pagination.value;
    if (meta == null || !meta.hasPrev) return;
    fetchUsers(page: meta.currentPage - 1);
  }
}
