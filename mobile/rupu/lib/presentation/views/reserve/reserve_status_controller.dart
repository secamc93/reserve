import 'package:get/get.dart';
import 'package:rupu/domain/entities/reserve_status.dart';
import 'package:rupu/domain/infrastructure/datasources/reserve_status_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/repositories/reserve_status_repository_impl.dart';
import 'package:rupu/domain/repositories/reserve_status_repository.dart';

class ReserveStatusController extends GetxController {
  final ReserveStatusRepository repository;
  ReserveStatusController()
      : repository =
            ReserveStatusRepositoryImpl(ReserveStatusDatasourceImpl());

  final estados = <ReserveStatus>[].obs;
  final isLoading = false.obs;

  Future<void> cargarEstados() async {
    try {
      isLoading.value = true;
      estados.assignAll(await repository.obtenerEstados());
    } finally {
      isLoading.value = false;
    }
  }
}
