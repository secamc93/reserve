import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'clients_controller.dart';

class ClientsView extends GetView<ClientsController> {
  const ClientsView({super.key, required this.pageIndex});
  static const name = 'clients';
  final int pageIndex;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Clientes')),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }
        final error = controller.errorMessage.value;
        if (error != null) {
          return Center(child: Text(error));
        }
        if (controller.clientes.isEmpty) {
          return const Center(child: Text('Sin clientes con reserva'));
        }
        return ListView.separated(
          itemCount: controller.clientes.length,
          separatorBuilder: (_, __) => const Divider(height: 1),
          itemBuilder: (context, index) {
            final c = controller.clientes[index];
            return ListTile(
              title: Text(c.nombre),
              subtitle: Text(c.email),
              trailing: Text(c.telefono),
            );
          },
        );
      }),
    );
  }
}
