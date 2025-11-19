import 'package:get/get.dart';
import 'package:rupu/domain/entities/iam_business.dart';
import 'package:rupu/domain/entities/iam_pagination.dart';
import 'package:rupu/domain/entities/iam_resource.dart';
import 'package:rupu/domain/infrastructure/repositories/iam_repository_impl.dart';
import 'package:rupu/domain/repositories/iam_repository.dart';

class IamBusinessesController extends GetxController {
  final IamRepository repository;

  IamBusinessesController({IamRepository? repository})
      : repository = repository ?? IamRepositoryImpl();

  final businesses = <IamBusiness>[].obs;
  final isLoading = false.obs;
  final errorMessage = RxnString();
  final pagination = Rxn<IamPagination>();
  final searchText = ''.obs;
  final statusFilter = RxnBool();
  final selectedBusinessTypeId = RxnInt();
  int _currentPage = 1;
  final int perPage = 10;

  @override
  void onInit() {
    super.onInit();
    debounce<String>(searchText, (_) => fetchBusinesses(page: 1),
        time: const Duration(milliseconds: 400));
    fetchBusinesses();
  }

  Future<void> fetchBusinesses({int? page}) async {
    if (isLoading.value) return;
    final targetPage = page ?? _currentPage;
    isLoading.value = true;
    errorMessage.value = null;
    try {
      final result = await repository.getBusinesses(
        page: targetPage,
        perPage: perPage,
        name: searchText.value.trim().isEmpty ? null : searchText.value.trim(),
        businessTypeId: selectedBusinessTypeId.value,
        isActive: statusFilter.value,
      );
      _currentPage = result.pagination.currentPage;
      businesses.assignAll(result.businesses);
      pagination.value = result.pagination;
    } catch (error) {
      errorMessage.value = 'No se pudieron cargar los negocios.';
    } finally {
      isLoading.value = false;
    }
  }

  void setSearch(String value) => searchText.value = value;

  void setStatusFilter(bool? active) {
    statusFilter.value = active;
    fetchBusinesses(page: 1);
  }

  void setBusinessType(int? typeId) {
    selectedBusinessTypeId.value = typeId;
    fetchBusinesses(page: 1);
  }

  void nextPage() {
    final meta = pagination.value;
    if (meta == null || !meta.hasNext) return;
    fetchBusinesses(page: meta.currentPage + 1);
  }

  void previousPage() {
    final meta = pagination.value;
    if (meta == null || !meta.hasPrev) return;
    fetchBusinesses(page: meta.currentPage - 1);
  }

  Future<List<IamBusinessConfiguredResource>> getConfiguredResources(
    int businessId,
  ) async {
    return repository.getBusinessConfiguredResources(businessId);
  }

  Future<IamMessageResult> toggleConfiguredResource({
    required int resourceId,
    required bool activate,
    required int businessId,
  }) {
    return activate
        ? repository.activateBusinessConfiguredResource(
            resourceId,
            businessId: businessId,
          )
        : repository.deactivateBusinessConfiguredResource(
            resourceId,
            businessId: businessId,
          );
  }
}
