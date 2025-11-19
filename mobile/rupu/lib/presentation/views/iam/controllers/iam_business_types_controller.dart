import 'package:get/get.dart';
import 'package:rupu/domain/entities/iam_business_type.dart';
import 'package:rupu/domain/entities/iam_resource.dart';
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
  final RxSet<int> deletingTypeIds = <int>{}.obs;

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

  List<String> get availableIcons => types
      .map((type) => type.icon)
      .where((icon) => icon.isNotEmpty)
      .toSet()
      .toList(growable: false);

  Future<IamBusinessTypeMutationResult> saveBusinessType({
    int? id,
    required String name,
    required String code,
    String? description,
    required String icon,
    required bool isActive,
  }) async {
    final result = id == null
        ? await repository.createBusinessType(
            name: name,
            code: code,
            description: description,
            icon: icon,
            isActive: isActive,
          )
        : await repository.updateBusinessType(
            id: id,
            name: name,
            code: code,
            description: description,
            icon: icon,
            isActive: isActive,
          );
    if (result.success && result.type != null) {
      final existingIndex = types.indexWhere((type) => type.id == result.type!.id);
      if (existingIndex >= 0) {
        types[existingIndex] = result.type!;
      } else {
        types.add(result.type!);
      }
      types.sort((a, b) => a.name.compareTo(b.name));
    }
    return result;
  }

  Future<IamMessageResult> deleteBusinessType(int id) async {
    if (deletingTypeIds.contains(id)) {
      return const IamMessageResult(success: false, message: 'Operación en curso');
    }
    deletingTypeIds.add(id);
    try {
      final result = await repository.deleteBusinessType(id);
      if (result.success) {
        types.removeWhere((type) => type.id == id);
      }
      return result;
    } finally {
      deletingTypeIds.remove(id);
    }
  }
}
