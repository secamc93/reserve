import 'package:get/get.dart';
import 'package:rupu/domain/entities/reserve.dart';
import 'package:rupu/domain/infrastructure/datasources/reservas_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/repositories/reserve_repository_impl.dart';
import 'package:rupu/domain/repositories/reserve_repository.dart';

import 'reserves_controller.dart';

class ReserveUpdateController extends GetxController {
  final ReserveRepository repository;
  ReserveUpdateController()
      : repository = ReserveRepositoryImpl(ReservasDatasourceImpl());

  final isLoading = false.obs;
  final reserva = Rxn<Reserve>();

  Future<void> cargarReserva(int id) async {
    try {
      isLoading.value = true;
      reserva.value = await repository.obtenerReserva(id: id);
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> actualizar({
    required int id,
    required DateTime startAt,
    required DateTime endAt,
    required int numberOfGuests,
    required int statusId,
    int? tableId,
  }) async {
    try {
      final updated = await repository.actualizarReserva(
        id: id,
        startAt: startAt,
        endAt: endAt,
        numberOfGuests: numberOfGuests,
        statusId: statusId,
        tableId: tableId,
      );
      reserva.value = updated;
      if (Get.isRegistered<ReserveController>()) {
        Get.find<ReserveController>().actualizarLocal(updated);
      }
      return true;
    } catch (_) {
      return false;
    }
  }
}
