// presentation/views/reserve/reserve_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/config/helpers/design_helper.dart';
import 'package:rupu/presentation/views/views.dart';
import 'package:rupu/config/helpers/design_helper.dart' as design;

import 'package:rupu/presentation/widgets/premium_reserve_card.dart';
import '../widgets.dart';

class ReserveView extends GetView<ReserveController> {
  const ReserveView({super.key, required this.pageIndex});
  final int pageIndex;

  @override
  Widget build(BuildContext context) {
    Get.put(ReserveController());

    Future<void> showResultSheet(
      BuildContext context, {
      required IconData icon,
      required Color color,
      required String title,
      required String message,
      String buttonText = 'Listo',
    }) async {
      final cs = Theme.of(context).colorScheme;
      final tt = Theme.of(context).textTheme;

      await showModalBottomSheet(
        context: context,
        showDragHandle: true,
        isScrollControlled: false,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        builder: (ctx) {
          return Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: color, size: 28),
                const SizedBox(height: 8),
                Text(
                  title,
                  style: tt.titleLarge!.copyWith(fontWeight: FontWeight.w800),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),
                Text(
                  message,
                  textAlign: TextAlign.center,
                  style: tt.bodyMedium!.copyWith(color: cs.onSurfaceVariant),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () => Navigator.of(ctx).pop(),
                    child: Text(buttonText),
                  ),
                ),
              ],
            ),
          );
        },
      );
    }

    Future<void> confirmCancel(BuildContext context, dynamic reserva) async {
      final cs = Theme.of(context).colorScheme;
      final tt = Theme.of(context).textTheme;

      // Obtiene el id pase lo que pase (Reserve o id directo)
      int extractId(dynamic r) {
        try {
          if (r is int) return r;
          final any = r?.reservaId ?? r?.id ?? r;
          return int.tryParse('$any') ?? 0;
        } catch (_) {
          return 0;
        }
      }

      bool working = false;

      await showModalBottomSheet(
        context: context,
        showDragHandle: true,
        isScrollControlled: false,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        builder: (ctx) {
          return StatefulBuilder(
            builder: (ctx, setLocal) {
              return Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.block, color: cs.error),
                    const SizedBox(height: 8),
                    Text(
                      'Cancelar reserva',
                      style: tt.titleLarge!.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '¿Estás seguro de cancelar esta reserva?',
                      textAlign: TextAlign.center,
                      style: tt.bodyMedium!.copyWith(
                        color: cs.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: working
                                ? null
                                : () => Navigator.of(ctx).pop(),
                            child: const Text('No, volver'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: FilledButton(
                            style: FilledButton.styleFrom(
                              backgroundColor: cs.error,
                              foregroundColor: Colors.white,
                            ),
                            onPressed: working
                                ? null
                                : () async {
                                    final id = extractId(reserva);
                                    if (id <= 0) {
                                      // resultado: error de id
                                      if (ctx.mounted) Navigator.of(ctx).pop();
                                      await showResultSheet(
                                        context,
                                        icon: Icons.error_outline,
                                        color: cs.error,
                                        title: 'No se pudo cancelar',
                                        message:
                                            'No se encontró el identificador de la reserva.',
                                      );
                                      return;
                                    }

                                    setLocal(() => working = true);
                                    final ctrl = Get.find<ReserveController>();
                                    final ok = await ctrl.cancelarReserva(
                                      id: id,
                                    );
                                    setLocal(() => working = false);

                                    if (ctx.mounted) Navigator.of(ctx).pop();

                                    if (ok) {
                                      // Refresca “hoy” y “todas”
                                      // Usa los que tengas disponibles:
                                      // await ctrl.reservasHoy();
                                      // await ctrl.reservasTodos();
                                      await ctrl.cargarReservasHoy(
                                        silent: true,
                                      );
                                      await ctrl.cargarReservasTodas(
                                        silent: true,
                                      );
                                      if (!context.mounted) return;

                                      await showResultSheet(
                                        context,
                                        icon: Icons.check_circle_outline,
                                        color: Colors.green,
                                        title: 'Reserva cancelada',
                                        message:
                                            'La reserva ha sido cancelada correctamente.',
                                      );
                                    } else {
                                      if (!context.mounted) return;

                                      await showResultSheet(
                                        context,
                                        icon: Icons.error_outline,
                                        color: cs.error,
                                        title: 'No se pudo cancelar',
                                        message:
                                            'Intenta nuevamente en unos segundos.',
                                      );
                                    }
                                  },
                            child: working
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation(
                                        Colors.white,
                                      ),
                                    ),
                                  )
                                : const Text('Cancelar'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                  ],
                ),
              );
            },
          );
        },
      );
    }

    design.StatusTone toneForStatus(String status) {
      final s = status.toLowerCase();

      // Ajusta las palabras clave a tus estados reales si difieren
      if (s.contains('confirm')) {
        return design.StatusTone.info; // Confirmada
      }
      if (s.contains('pend')) {
        return design.StatusTone.warning; // Pendiente
      }
      if (s.contains('cancel')) {
        return design.StatusTone.danger; // Cancelada
      }
      if (s.contains('completada')) {
        return design.StatusTone.success; // Pagada
      }
      return design.StatusTone.info; // fallback
    }

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () => controller.cargarReservasHoy(silent: true),
        child: Obx(() {
          // Contadores útiles para header
          final totalHoy = controller.reservasHoy.length;

          return ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            children: [
              // ───────────────── Hero / Header ─────────────────
              ReserveHeader(
                totalToday: totalHoy,
                onNew: () => context.pushNamed(
                  'reserve_new',
                  pathParameters: {'page': '$pageIndex'},
                ),
                onCalendar: () => context.pushNamed(
                  'calendar',
                  pathParameters: {'page': '$pageIndex'},
                ),
              ),
              const SizedBox(height: 16),

              // ───────────────── Acciones rápidas (scroll horizontal) ─────────────────
              QuickActionsStrip(
                onNew: () => context.pushNamed(
                  'reserve_new',
                  pathParameters: {'page': '$pageIndex'},
                ),
                onCalendar: () => context.pushNamed(
                  'calendar',
                  pathParameters: {'page': '$pageIndex'},
                ),
                onCheckIn: () {}, // TODO: tu flujo de check-in
                onClients: () => context.pushNamed(
                  ClientsView.name,
                  pathParameters: {'page': '$pageIndex'},
                ),
              ),
              const SizedBox(height: 16),

              const SectionTitle('Próximas reservas'),

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
              ] else if (controller.reservasHoy.isEmpty) ...[
                EmptyStateCard(
                  title: 'Sin reservas hoy',
                  message:
                      'Aún no tienes reservas para hoy. Crea la primera y aparecerá aquí.',
                  ctaText: 'Nueva reserva',
                  onCta: () => context.pushNamed(
                    'reserve_new',
                    pathParameters: {'page': '$pageIndex'},
                  ),
                ),
              ] else ...[
                for (final r in controller.reservasHoy)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: PremiumReserveCard(
                      client: controller.cliente(r),
                      subtitle: 'Servicio: Reserva',
                      time: controller.fechaHome(r),
                      status: controller.estado(r),
                      tone: toneForStatus(controller.estado(r)),
                      logoUrl: Get.find<PerfilController>().businessLogoUrl,
                      onTap: () {
                        context.pushNamed(
                          'reserve_detail',
                          pathParameters: {
                            'page': '$pageIndex',
                            'id': '${r.reservaId}',
                          },
                        );
                      },
                      // Si la reserva está cancelada ocultamos la opción de cancelación
                      onCancel: r.estadoNombre.toLowerCase().contains('cancel')
                          ? null
                          : () => confirmCancel(context, r),
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
