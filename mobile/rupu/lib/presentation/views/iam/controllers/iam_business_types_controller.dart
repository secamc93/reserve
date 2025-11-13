import 'package:get/get.dart';
import 'package:rupu/domain/entities/iam_business_type.dart';
import 'package:rupu/domain/infrastructure/repositories/iam_repository_impl.dart';
import 'package:rupu/domain/repositories/iam_repository.dart';

class IamBusinessTypesController extends GetxController {
  final IamRepository repository;

  IamBusinessTypesController({IamRepository? repository})
      : repository = repository ?? IamRepositoryImpl();

  final types = <IamBusinessType>[].obs;
  final isLoading = false.obs;
  final errorMessage = RxnString();
  final searchText = ''.obs;

  @override
  void onInit() {
    super.onInit();
    fetchTypes();
  }

  List<IamBusinessType> get filteredTypes {
    final query = searchText.value.trim().toLowerCase();
    if (query.isEmpty) return types;
    return types
        .where((type) =>
            type.name.toLowerCase().contains(query) ||
            type.code.toLowerCase().contains(query) ||
            type.description.toLowerCase().contains(query))
        .toList(growable: false);
  }

  Future<void> fetchTypes() async {
    if (isLoading.value) return;
    isLoading.value = true;
    errorMessage.value = null;
    try {
      final result = await repository.getBusinessTypes();
      types.assignAll(result.types);
    } catch (error) {
      errorMessage.value = 'No se pudieron cargar los tipos de negocio.';
    } finally {
      isLoading.value = false;
    }
  }

  void setSearch(String value) => searchText.value = value;
}
