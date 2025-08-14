import 'package:get/get.dart';
import 'package:rupu/domain/entities/reserve.dart';
import 'package:rupu/domain/infrastructure/datasources/reservas_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/repositories/reserve_repository_impl.dart';
import 'package:rupu/domain/repositories/reserve_repository.dart';

class ReserveDetailController extends GetxController {
  final ReserveRepository repository;
  ReserveDetailController()
      : repository = ReserveRepositoryImpl(ReservasDatasourceImpl());

  final isLoading = false.obs;
  final reserva = Rxn<Reserve>();
  final error = RxnString();

  Future<void> cargarReserva(int id) async {
    try {
      isLoading.value = true;
      error.value = null;
      reserva.value = await repository.obtenerReserva(id: id);
    } catch (e) {
      error.value = 'No se pudo cargar la reserva';
    } finally {
      isLoading.value = false;
    }
  }
}
