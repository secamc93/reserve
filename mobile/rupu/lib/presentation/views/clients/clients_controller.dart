// clients_controller.dart
import 'package:get/get.dart';
import 'package:rupu/domain/entities/client.dart';
import 'package:rupu/domain/repositories/client_repository.dart';
import 'package:rupu/domain/infrastructure/repositories/client_repository_impl.dart';
import 'package:rupu/domain/infrastructure/datasources/clients_datasource_impl.dart';
import 'package:rupu/presentation/views/reserve/reserves_controller.dart';

class ClientsController extends GetxController {
  final ClientRepository repository;
  ClientsController()
    : repository = ClientRepositoryImpl(ClientsDatasourceImpl());

  final isLoading = false.obs;
  final errorMessage = RxnString();
  final clientes = <Client>[].obs;

  Worker? _wHoy, _wTodas;

  @override
  void onInit() {
    super.onInit();
    if (Get.isRegistered<ReserveController>()) {
      final r = Get.find<ReserveController>();
      _wHoy = debounce(
        r.reservasHoy,
        (_) => cargarClientes(silent: true),
        time: const Duration(milliseconds: 300),
      );
      _wTodas = debounce(
        r.reservasTodas,
        (_) => cargarClientes(silent: true),
        time: const Duration(milliseconds: 300),
      );
    }
  }

  @override
  void onReady() {
    super.onReady();
    cargarClientes(); // carga al entrar
  }

  @override
  void onClose() {
    _wHoy?.dispose();
    _wTodas?.dispose();
    super.onClose();
  }

  Future<void> cargarClientes({bool silent = false}) async {
    if (!silent) isLoading.value = true;
    errorMessage.value = null;
    try {
      final items = await repository.obtenerClientesConReservaHoy();
      clientes.assignAll(items);
    } catch (_) {
      errorMessage.value = 'No se pudieron cargar los clientes';
    } finally {
      if (!silent) isLoading.value = false;
    }
  }
}
