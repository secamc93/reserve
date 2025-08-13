// presentation/views/reserve/reserve_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/config/helpers/design_helper.dart';
import 'package:rupu/presentation/views/views.dart'; // donde esté CalendarioView

class ReserveView extends GetView<ReserveController> {
  const ReserveView({super.key, required this.pageIndex});
  final int pageIndex;

  @override
  Widget build(BuildContext context) {
    Get.put(ReserveController());
    final quick = [
      ('Nueva reserva', Icons.add_circle_outline),
      ('Calendario', Icons.event_outlined),
      ('Check-in', Icons.how_to_reg_outlined),
      ('Clientes', Icons.person_outline),
    ];

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () => controller.cargarReservasOrdenadas(silent: true),
        child: Obx(() {
          // Siempre devolver un scrollable para que el pull-to-refresh funcione,
          // incluso en vacío o error.
          return ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            children: [
              PrimaryCard(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 4,
                          mainAxisSpacing: 12,
                          crossAxisSpacing: 12,
                          childAspectRatio: .9,
                        ),
                    itemCount: quick.length,
                    itemBuilder: (_, i) {
                      final label = quick[i].$1;
                      final icon = quick[i].$2;
                      return _QuickAction(
                        title: label,
                        icon: icon,
                        onTap: () {
                          if (label == 'Calendario') {
                            context.pushNamed(
                              'calendar',
                              pathParameters: {'page': '$pageIndex'},
                            );
                          }
                        },
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const SectionTitle('Próximas reservas'),

              // Estados
              if (controller.isLoading.value) ...[
                const Padding(
                  padding: EdgeInsets.all(16),
                  child: Center(child: CircularProgressIndicator()),
                ),
              ] else if (controller.errorMessage.value != null) ...[
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text(
                    controller.errorMessage.value!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
                ),
              ] else if (controller.reservas.isEmpty) ...[
                const Padding(
                  padding: EdgeInsets.all(16),
                  child: Text('No hay reservas por ahora'),
                ),
              ] else ...[
                for (final r in controller.reservas)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: BookingListCard(
                      client: controller.cliente(r),
                      subtitle: 'Servicio: Reserva',
                      time: controller.fecha(r),
                      status: controller.estado(r),
                      onTap: () {},
                    ),
                  ),
              ],
            ],
          );
        }),
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({required this.title, required this.icon, this.onTap});
  final String title;
  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Ink(
        decoration: BoxDecoration(
          color: cs.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: cs.outlineVariant),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: cs.primary),
            const SizedBox(height: 8),
            Text(
              title,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.labelMedium,
            ),
          ],
        ),
      ),
    );
  }
}

// Tu BookingListCard se mantiene igual que lo compartiste.

class BookingListCard extends StatelessWidget {
  const BookingListCard({
    super.key,
    required this.client,
    required this.subtitle,
    required this.time,
    required this.status,
    this.onTap,
  });
  final String client;
  final String subtitle;
  final String time;
  final String status;
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) {
    final tone = status == 'Confirmada'
        ? StatusTone.success
        : (status == 'Pendiente' ? StatusTone.warning : StatusTone.info);
    return PrimaryCard(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                'https://picsum.photos/seed/$client/120/120',
                width: 56,
                height: 56,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(client, style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodySmall!.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.schedule, size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 6),
                      Text(time),
                      const Spacer(),
                      StatusBadge(status, tone: tone),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
