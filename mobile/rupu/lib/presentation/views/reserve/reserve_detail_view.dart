import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:rupu/config/helpers/design_helper.dart';
import 'reserve_detail_controller.dart';

class ReserveDetailView extends GetView<ReserveDetailController> {
  const ReserveDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    final df = DateFormat('dd/MM/yyyy HH:mm');
    return Scaffold(
      appBar: AppBar(title: const Text('Detalle de reserva')),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }
        final r = controller.reserva.value;
        if (r == null) {
          return Center(child: Text(controller.error.value ?? ''));
        }
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            PrimaryCard(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      r.clienteNombre,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.schedule, size: 16),
                        const SizedBox(width: 6),
                        Text('${df.format(r.startAt)} - ${df.format(r.endAt)}'),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('Estado: ${r.estadoNombre}'),
                    const SizedBox(height: 8),
                    Text('Invitados: ${r.numberOfGuests}'),
                  ],
                ),
              ),
            ),
          ],
        );
      }),
    );
  }
}
