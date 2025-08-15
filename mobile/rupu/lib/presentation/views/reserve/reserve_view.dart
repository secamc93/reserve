// presentation/views/reserve/reserve_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:rupu/config/helpers/design_helper.dart';
import 'package:rupu/presentation/views/views.dart';

class ReserveView extends GetView<ReserveController> {
  const ReserveView({super.key, required this.pageIndex});
  final int pageIndex;

  @override
  Widget build(BuildContext context) {
    Get.put(ReserveController());

    Future<void> _cancel(int id) async {
      final reasonCtrl = TextEditingController();
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (ctx) {
          return AlertDialog(
            title: const Text('Cancelar reserva'),
            content: TextField(
              controller: reasonCtrl,
              decoration:
                  const InputDecoration(labelText: 'Motivo (opcional)'),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(false),
                child: const Text('Volver'),
              ),
              FilledButton(
                onPressed: () => Navigator.of(ctx).pop(true),
                child: const Text('Cancelar'),
              ),
            ],
          );
        },
      );

      if (confirmed != true) return;

      final ok = await controller.cancelarReserva(
        id: id,
        reason: reasonCtrl.text.trim().isEmpty ? null : reasonCtrl.text.trim(),
      );

      if (!ok) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No se pudo cancelar la reserva.')),
        );
        return;
      }

      await showModalBottomSheet(
        context: context,
        useSafeArea: true,
        showDragHandle: true,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
        builder: (ctx) {
          return Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 18,
                      backgroundColor:
                          Theme.of(ctx).colorScheme.primaryContainer,
                      child: Icon(
                        Icons.check,
                        color: Theme.of(ctx).colorScheme.onPrimaryContainer,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Reserva cancelada',
                      style: Theme.of(ctx)
                          .textTheme
                          .titleMedium!
                          .copyWith(fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  'La reserva se canceló correctamente.',
                  style: Theme.of(ctx).textTheme.bodyMedium,
                ),
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: () => Navigator.of(ctx).pop(),
                  child: const Text('Entendido'),
                ),
              ],
            ),
          );
        },
      );

      await controller.cargarReservasHoy(silent: true);
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
              _PremiumHeader(
                totalHoy: totalHoy,
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
              _QuickActionsStrip(
                onNew: () => context.pushNamed(
                  'reserve_new',
                  pathParameters: {'page': '$pageIndex'},
                ),
                onCalendar: () => context.pushNamed(
                  'calendar',
                  pathParameters: {'page': '$pageIndex'},
                ),
                onCheckIn: () {}, // TODO: tu flujo de check-in
                onClients: () {}, // TODO: navegación a clientes
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
                _EmptyStateCard(
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
                // ───────────────── Lista premium ─────────────────
                for (final r in controller.reservasHoy)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _BookingListCardPremium(
                      client: controller.cliente(r),
                      subtitle: 'Servicio: Reserva',
                      time: controller.fechaHome(r),
                      status: controller.estado(r),
                      onTap: () => context.pushNamed(
                        'reserve_detail',
                        pathParameters: {
                          'page': '$pageIndex',
                          'id': '${r.reservaId}',
                        },
                      ),
                      onCancel: () => _cancel(r.reservaId),
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

// ─────────────────────────────────────────────────────────────
// HEADER PREMIUM (gradiente suave + CTA)
// ─────────────────────────────────────────────────────────────
class _PremiumHeader extends StatelessWidget {
  const _PremiumHeader({
    required this.totalHoy,
    required this.onNew,
    required this.onCalendar,
  });

  final int totalHoy;
  final VoidCallback onNew;
  final VoidCallback onCalendar;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            cs.primary.withValues(alpha: .10),
            cs.secondary.withValues(alpha: .08),
          ],
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: cs.outlineVariant),
      ),
      child: Row(
        children: [
          // Copy
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Agenda de hoy',
                  style: tt.titleLarge!.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text(
                  totalHoy == 0
                      ? 'No hay reservas registradas.'
                      : '$totalHoy reserva${totalHoy == 1 ? '' : 's'} programada${totalHoy == 1 ? '' : 's'}.',
                  style: tt.bodyMedium!.copyWith(
                    color: cs.onSurfaceVariant,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    FilledButton.icon(
                      onPressed: onNew,
                      icon: const Icon(Icons.add_circle_outline),
                      label: const Text('Nueva reserva'),
                    ),
                    OutlinedButton.icon(
                      onPressed: onCalendar,
                      icon: const Icon(Icons.event_outlined),
                      label: const Text(
                        'Calendario',
                        style: TextStyle(fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),

          // Ilustración simple (icono grande)
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// QUICK ACTIONS (horizontal, cards fijos, sin overflows)
// ─────────────────────────────────────────────────────────────
class _QuickActionsStrip extends StatelessWidget {
  const _QuickActionsStrip({
    required this.onNew,
    required this.onCalendar,
    required this.onCheckIn,
    required this.onClients,
  });

  final VoidCallback onNew;
  final VoidCallback onCalendar;
  final VoidCallback onCheckIn;
  final VoidCallback onClients;

  @override
  Widget build(BuildContext context) {
    final items = [
      ('Nueva', Icons.add_circle_outline, onNew),
      ('Calendario', Icons.event_outlined, onCalendar),
      ('Check-in', Icons.how_to_reg_outlined, onCheckIn),
      ('Clientes', Icons.person_outline, onClients),
    ];

    return SizedBox(
      height: 104,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        padding: const EdgeInsets.symmetric(horizontal: 2),
        itemBuilder: (_, i) {
          final (label, icon, handler) = items[i];
          return _QuickCard(label: label, icon: icon, onTap: handler);
        },
      ),
    );
  }
}

class _QuickCard extends StatelessWidget {
  const _QuickCard({required this.label, required this.icon, this.onTap});
  final String label;
  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Ink(
        width: 145, // ancho fijo para evitar cálculos y overflows
        height: 100,
        decoration: BoxDecoration(
          color: cs.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: cs.outlineVariant),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Row(
            children: [
              Container(
                width: 34,
                height: 36,
                decoration: BoxDecoration(
                  color: cs.primary.withValues(alpha: .12),
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: Icon(icon, color: cs.primary),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  label,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: tt.labelLarge!.copyWith(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// CARD PREMIUM DE RESERVA (avatar inicial + badge + layout robusto)
// ─────────────────────────────────────────────────────────────
class _BookingListCardPremium extends StatelessWidget {
  const _BookingListCardPremium({
    required this.client,
    required this.subtitle,
    required this.time,
    required this.status,
    this.onTap,
    this.onCancel,
  });

  final String client;
  final String subtitle;
  final String time;
  final String status;
  final VoidCallback? onTap;
  final VoidCallback? onCancel;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final tone = status == 'Completada'
        ? StatusTone.success
        : (status == 'Pendiente'
              ? StatusTone.warning
              : status == 'Cancelada'
              ? StatusTone.danger
              : status == 'Confirmada'
              ? StatusTone.info
              : StatusTone.info);

    return PrimaryCard(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            _InitialAvatar(
              name: client,
              size: 56,
              start: cs.primary.withValues(alpha: .14),
              end: cs.secondary.withValues(alpha: .14),
            ),
            const SizedBox(width: 12),

            // Contenido flexible
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // fila superior: nombre + badge
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Expanded(
                        child: Text(
                          client,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: tt.titleMedium!.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        fit: FlexFit.loose,
                        child: Align(
                          alignment: Alignment.centerRight,
                          child: StatusBadge(status, tone: tone),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    subtitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: tt.bodySmall!.copyWith(color: cs.onSurfaceVariant),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.schedule,
                        size: 16,
                        color: cs.onSurfaceVariant,
                      ),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          time,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: tt.bodyMedium,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(width: 8),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (onCancel != null)
                  IconButton(
                    icon: const Icon(Icons.cancel_outlined),
                    color: cs.error,
                    tooltip: 'Cancelar',
                    onPressed: onCancel,
                  ),
                Icon(
                  Icons.chevron_right_rounded,
                  size: 22,
                  color: cs.onSurfaceVariant,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Avatar con inicial (sin imágenes), con gradiente sutil
class _InitialAvatar extends StatelessWidget {
  const _InitialAvatar({
    required this.name,
    this.size = 56,
    this.start = const Color(0xFFE6F0FF),
    this.end = const Color(0xFFDCEBFF),
  });

  final String name;
  final double size;
  final Color start;
  final Color end;

  String _initialOf(String s) {
    final t = s.trim();
    if (t.isEmpty) return '?';
    // Si el nombre tiene espacios, intenta usar la primera letra del primer token
    final first = t.split(RegExp(r'\s+')).first;
    return first.isNotEmpty ? first.characters.first.toUpperCase() : '?';
  }

  @override
  Widget build(BuildContext context) {
    final initial = _initialOf(name);
    final tt = Theme.of(context).textTheme;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [start, end],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      alignment: Alignment.center,
      child: Text(
        initial,
        style: tt.titleLarge!.copyWith(
          fontWeight: FontWeight.w900,
          letterSpacing: .2,
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Empty state amigable
// ─────────────────────────────────────────────────────────────
class _EmptyStateCard extends StatelessWidget {
  const _EmptyStateCard({
    required this.title,
    required this.message,
    required this.ctaText,
    required this.onCta,
  });

  final String title;
  final String message;
  final String ctaText;
  final VoidCallback onCta;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return PrimaryCard(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 18, 16, 16),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: cs.primary.withValues(alpha: .12),
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: Icon(Icons.event_busy, color: cs.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: tt.titleMedium!.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    message,
                    style: tt.bodyMedium!.copyWith(color: cs.onSurfaceVariant),
                  ),
                  const SizedBox(height: 10),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: FilledButton(onPressed: onCta, child: Text(ctaText)),
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
