import 'package:get/get.dart';
import 'package:rupu/domain/entities/iam_resource.dart';
import 'package:rupu/domain/infrastructure/repositories/iam_repository_impl.dart';
import 'package:rupu/domain/repositories/iam_repository.dart';

class IamResourcesController extends GetxController {
  final IamRepository repository;

  IamResourcesController({IamRepository? repository})
      : repository = repository ?? IamRepositoryImpl();

  final resources = <IamResource>[].obs;
  final isLoading = false.obs;
  final errorMessage = RxnString();
  final total = 0.obs;
  final page = 1.obs;
  final totalPages = 1.obs;
  final searchText = ''.obs;
  final int pageSize = 10;

  @override
  void onInit() {
    super.onInit();
    debounce<String>(searchText, (_) => fetchResources(page: 1),
        time: const Duration(milliseconds: 350));
    fetchResources();
  }

  Future<void> fetchResources({int? page}) async {
    if (isLoading.value) return;
    final targetPage = page ?? this.page.value;
    isLoading.value = true;
    errorMessage.value = null;
    try {
      final result = await repository.getResources(
        page: targetPage,
        pageSize: pageSize,
        name: searchText.value.trim().isEmpty ? null : searchText.value.trim(),
      );
      resources.assignAll(result.resources);
      total.value = result.total;
      this.page.value = result.page;
      totalPages.value = result.totalPages;
    } catch (error) {
      errorMessage.value = 'No se pudieron cargar los recursos.';
    } finally {
      isLoading.value = false;
    }
  }

  void setSearch(String value) => searchText.value = value;

  void nextPage() {
    if (page.value >= totalPages.value) return;
    fetchResources(page: page.value + 1);
  }

  void previousPage() {
    if (page.value <= 1) return;
    fetchResources(page: page.value - 1);
  }
}
