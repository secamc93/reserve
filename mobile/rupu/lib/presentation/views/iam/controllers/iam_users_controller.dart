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
  final isLoadingMore = false.obs;
  final errorMessage = RxnString();
  final pagination = Rxn<IamPagination>();
  final searchText = ''.obs;
  final int perPage = 20;
  int _nextPage = 1;
  bool _hasMore = true;

  @override
  void onInit() {
    super.onInit();
    debounce<String>(searchText, (_) => fetchUsers(reset: true),
        time: const Duration(milliseconds: 400));
    fetchUsers(reset: true);
  }

  Future<void> fetchUsers({bool reset = false}) async {
    if (isLoading.value || isLoadingMore.value) return;
    if (!_hasMore && !reset) return;

    if (reset) {
      isLoading.value = true;
      errorMessage.value = null;
      _nextPage = 1;
      _hasMore = true;
    } else {
      isLoadingMore.value = true;
    }

    try {
      final query = searchText.value.trim();
      final result = await repository.getUsers(
        page: _nextPage,
        pageSize: perPage,
        name: query.isEmpty ? null : query,
        email: query.isEmpty ? null : query,
        phone: query.isEmpty ? null : query,
      );

      pagination.value = result.pagination;
      _hasMore = result.pagination.hasNext;
      _nextPage = result.pagination.currentPage + 1;

      if (reset) {
        users.assignAll(result.users);
      } else {
        users.addAll(result.users);
      }
    } catch (_) {
      errorMessage.value = 'No se pudieron cargar los usuarios.';
    } finally {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  }

  void setSearch(String value) {
    searchText.value = value;
  }

  Future<void> refreshData() async {
    await fetchUsers(reset: true);
  }

  void loadMore() {
    fetchUsers(reset: false);
  }
}
