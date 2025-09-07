import 'package:get/get.dart';
import 'package:rupu/domain/entities/client.dart';
import 'package:rupu/domain/repositories/client_repository.dart';
import 'package:rupu/domain/infrastructure/repositories/client_repository_impl.dart';
import 'package:rupu/domain/infrastructure/datasources/clients_datasource_impl.dart';

class ClientsController extends GetxController {
  final ClientRepository repository;
  ClientsController()
      : repository = ClientRepositoryImpl(ClientsDatasourceImpl());

  final isLoading = false.obs;
  final errorMessage = RxnString();
  final clientes = <Client>[].obs;

  @override
  void onReady() {
    super.onReady();
    cargarClientes();
  }

  Future<void> cargarClientes({bool silent = false}) async {
    if (!silent) isLoading.value = true;
    errorMessage.value = null;
    try {
      final items = await repository.obtenerClientesConReservaHoy();
      clientes.assignAll(items);
    } catch (e) {
      errorMessage.value = 'No se pudieron cargar los clientes';
    } finally {
      if (!silent) isLoading.value = false;
    }
  }
}
