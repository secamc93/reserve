// presentation/views/reserve/reserve_detail_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:rupu/config/helpers/design_helper.dart';
import 'package:rupu/domain/entities/reserve.dart';
import 'package:rupu/presentation/views/profile/perfil_controller.dart';
import '../controllers/reserve_detail_controller.dart';
import 'update_reserve_view.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../controllers/reserves_controller.dart';
import 'package:rupu/config/helpers/calendar_helper.dart';
import 'package:rupu/presentation/widgets/widgets.dart';
import '../widgets.dart';

class ReserveDetailView extends GetView<ReserveDetailController> {
  const ReserveDetailView({super.key, required this.pageIndex});
  final int pageIndex;

  // ─── Acciones de contacto ───
  String _onlyDigits(String s) => s.replaceAll(RegExp(r'\D+'), '');

  Future<void> _launchPhone(BuildContext context, String phone) async {
    final p = _onlyDigits(phone);
    if (p.isEmpty) {
      _toast(context, 'No hay un número válido');
      return;
    }
    final uri = Uri(scheme: 'tel', path: p);
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!context.mounted) return;

    if (!ok) _toast(context, 'No se pudo abrir el marcador');
  }

  Future<void> _launchEmail(BuildContext context, String email) async {
    final e = email.trim();
    if (e.isEmpty) {
      _toast(context, 'No hay un email válido');
      return;
    }
    final uri = Uri(
      scheme: 'mailto',
      path: e,
      queryParameters: {
        // Opcionales:
        'subject': 'Reserva',
        // 'body': 'Hola, sobre tu reserva...'
      },
    );
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!context.mounted) return;

    if (!ok) _toast(context, 'No se pudo abrir el correo');
  }

  Future<void> _launchWhatsApp(
    BuildContext context,
    String phone, {
    String? message,
  }) async {
    final p = _onlyDigits(phone);
    if (p.isEmpty) {
      _toast(context, 'No hay un teléfono para WhatsApp');
      return;
    }
    // wa.me funciona en iOS/Android y abre WhatsApp si está disponible.
    final base = 'https://wa.me/$p';
    final uri = Uri.parse(
      message == null || message.isEmpty
          ? base
          : '$base?text=${Uri.encodeComponent(message)}',
    );
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!context.mounted) return;

    if (!ok) _toast(context, 'No se pudo abrir WhatsApp');
  }

  void _toast(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  Future<void> _showResultSheet(
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

  Future<void> _confirmCheckIn(BuildContext context, Reserve r) async {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

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
                  Icon(Icons.how_to_reg, color: cs.primary),
                  const SizedBox(height: 8),
                  Text(
                    'Confirmar check-in',
                    style: tt.titleLarge!.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '¿Deseas marcar esta reserva como confirmada?',
                    textAlign: TextAlign.center,
                    style: tt.bodyMedium!.copyWith(color: cs.onSurfaceVariant),
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
                          onPressed: working
                              ? null
                              : () async {
                                  setLocal(() => working = true);
                                  final reserveCtrl =
                                      Get.isRegistered<ReserveController>()
                                      ? Get.find<ReserveController>()
                                      : Get.put(ReserveController());
                                  final ok = await reserveCtrl.checkInReserva(
                                    id: r.reservaId,
                                  );
                                  setLocal(() => working = false);

                                  if (ctx.mounted) Navigator.of(ctx).pop();

                                  if (ok) {
                                    await reserveCtrl.cargarReservasHoy(
                                      silent: true,
                                    );
                                    await reserveCtrl.cargarReservasTodas(
                                      silent: true,
                                    );
                                    await controller.cargarReserva(r.reservaId);
                                    if (!context.mounted) return;
                                    await _showResultSheet(
                                      context,
                                      icon: Icons.check_circle_outline,
                                      color: Colors.green,
                                      title: 'Check-in realizado',
                                      message: 'La reserva ha sido confirmada.',
                                    );
                                  } else {
                                    if (!context.mounted) return;
                                    await _showResultSheet(
                                      context,
                                      icon: Icons.error_outline,
                                      color: cs.error,
                                      title: 'No se pudo confirmar',
                                      message:
                                          'Intenta nuevamente en unos segundos.',
                                    );
                                  }
                                },
                          child: working
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Text('Confirmar'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    const locale = 'es';

    // obtenemos el logo del negocio
    final perfil = Get.isRegistered<PerfilController>()
        ? Get.find<PerfilController>()
        : null;
    final businessLogoUrl = (perfil?.businessLogoUrl ?? '').trim();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle de reserva'),
        centerTitle: true,
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        final r = controller.reserva.value;
        if (r == null) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Text(
                controller.error.value ?? 'No se pudo cargar la reserva',
              ),
            ),
          );
        }

        final cs = Theme.of(context).colorScheme;
        final tt = Theme.of(context).textTheme;
        final start = _asLocal(r.startAt);
        final end = _asLocal(r.endAt);
        final dfDay = DateFormat('EEEE d MMMM y', locale);
        final dfTime = DateFormat('HH:mm', locale);
        final dfShort = DateFormat('dd/MM/yyyy HH:mm', locale);
        final dur = end.difference(start);
        final durationLabel = _humanDuration(dur);

        // inicial del cliente
        final name = (r.clienteNombre).trim();
        final initial = name.isNotEmpty
            ? name.characters.first.toUpperCase()
            : '•';

        // Determinamos si la reserva está cancelada
        final isCancelled = r.estadoNombre.toLowerCase().contains('cancel');

        return ListView(
          key: const PageStorageKey('reserve-detail'),
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          children: [
            HeaderCard(
              name: name.isEmpty ? 'Cliente' : name,
              email: (r.clienteEmail).trim(),
              bannerUrl: businessLogoUrl,
              initial: initial,
            ),
            const SizedBox(height: 12),

            PrimaryCard(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.event, color: cs.primary),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                dfDay.format(start).toUpperCase(),
                                style: tt.labelLarge!.copyWith(
                                  letterSpacing: .4,
                                  color: cs.onSurfaceVariant,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  TimeChip(
                                    icon: Icons.schedule,
                                    label:
                                        '${dfTime.format(start)} – ${dfTime.format(end)}',
                                  ),
                                  const SizedBox(width: 8),
                                  TimeChip(
                                    icon: Icons.timelapse,
                                    label: durationLabel,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        SoftStatusPill(
                          text: _normalizeStatus(r.estadoNombre),
                          tone: _toneForStatus(r.estadoNombre),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Divider(height: 1),
                    const SizedBox(height: 12),

                    Wrap(
                      runSpacing: 10,
                      spacing: 16,
                      children: [
                        InfoTile(
                          icon: Icons.group_outlined,
                          label: 'Personas',
                          value: '${r.numberOfGuests}',
                        ),
                        if ((r.mesaNumero ?? '').toString().isNotEmpty)
                          InfoTile(
                            icon: Icons.table_bar_outlined,
                            label: 'Mesa',
                            value: '${r.mesaNumero}',
                          ),
                        if ((r.negocioNombre).trim().isNotEmpty)
                          InfoTile(
                            icon: Icons.store_mall_directory_outlined,
                            label: 'Negocio',
                            value: r.negocioNombre,
                          ),
                        InfoTile(
                          icon: Icons.confirmation_number_outlined,
                          label: 'Reserva',
                          value: '#${r.reservaId}',
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'Creada: ${dfShort.format(_asLocal(r.reservaCreada))}',
                        style: tt.bodySmall!.copyWith(
                          color: cs.onSurfaceVariant,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 12),

            PrimaryCard(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionTitle('Contacto del cliente'),
                    const SizedBox(height: 10),
                    if (r.clienteTelefono.toString().trim().isNotEmpty)
                      ContactRow(
                        icon: Icons.phone_outlined,
                        label: 'Teléfono',
                        value: r.clienteTelefono.toString(),
                      ),
                    if ((r.clienteEmail).trim().isNotEmpty)
                      ContactRow(
                        icon: Icons.email_outlined,
                        label: 'Email',
                        value: r.clienteEmail,
                      ),
                    if ((r.clienteDni).toString().trim().isNotEmpty)
                      ContactRow(
                        icon: Icons.badge_outlined,
                        label: 'Documento',
                        value: r.clienteDni.toString(),
                      ),
                    const SizedBox(height: 14),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        // Llamar
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed:
                                r.clienteTelefono.toString().trim().isEmpty
                                ? null
                                : () => _launchPhone(
                                    context,
                                    r.clienteTelefono.toString(),
                                  ),
                            icon: const Icon(Icons.call),
                            label: const Text('Llamar'),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                vertical: 12,
                                horizontal: 8,
                              ),
                              visualDensity: VisualDensity.compact,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),

                        // Email
                        Expanded(
                          child: FilledButton.icon(
                            onPressed: (r.clienteEmail).trim().isEmpty
                                ? null
                                : () => _launchEmail(context, r.clienteEmail),
                            icon: const Icon(Icons.email),
                            label: const Text('Email'),
                            style: FilledButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                vertical: 12,
                                horizontal: 8,
                              ),
                              visualDensity: VisualDensity.compact,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),

                        // WhatsApp (verde + chat icon)
                        Expanded(
                          child: FilledButton.icon(
                            onPressed:
                                r.clienteTelefono.toString().trim().isEmpty
                                ? null
                                : () => _launchWhatsApp(
                                    context,
                                    r.clienteTelefono.toString(),
                                    message:
                                        'Hola ${r.clienteNombre.trim().isEmpty ? "👋" : r.clienteNombre.trim()}, '
                                        'te contacto sobre tu reserva (#${r.reservaId}).',
                                  ),
                            icon: const FaIcon(
                              FontAwesomeIcons.whatsapp,
                            ), // si quieres el logo real, ver nota abajo
                            label: const Text('WhatsApp'),
                            style: FilledButton.styleFrom(
                              backgroundColor: const Color(
                                0xFF25D366,
                              ), // verde WhatsApp
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                vertical: 12,
                                horizontal: 2,
                              ),
                              visualDensity: VisualDensity.compact,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            if (r.statusHistory.isNotEmpty) ...[
              const SizedBox(height: 12),
              PrimaryCard(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SectionTitle('Historial'),
                      const SizedBox(height: 12),
                      Column(
                        children: List.generate(r.statusHistory.length, (i) {
                          final h = r.statusHistory[i];
                          final when = _asLocal(h.changedAt);
                          return Padding(
                            padding: EdgeInsets.only(
                              bottom: i == r.statusHistory.length - 1 ? 0 : 12,
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Icon(
                                  Icons.flag_outlined,
                                  size: 18,
                                  color: cs.onSurfaceVariant,
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        h.statusName,
                                        style: tt.labelLarge!.copyWith(
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        DateFormat(
                                          'dd/MM/yyyy • HH:mm',
                                          locale,
                                        ).format(when),
                                        style: tt.bodySmall!.copyWith(
                                          color: cs.onSurfaceVariant,
                                        ),
                                      ),
                                      if ((h.changedByUser ?? '').isNotEmpty)
                                        Text(
                                          'Por: ${h.changedByUser}',
                                          style: tt.bodySmall!.copyWith(
                                            color: cs.onSurfaceVariant,
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ),
                    ],
                  ),
                ),
              ),
            ],

            const SizedBox(height: 16),

            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: isCancelled
                        ? null
                        : () => context.pushNamed(
                            UpdateReserveView.name,
                            pathParameters: {
                              'page': '$pageIndex',
                              'id': '${r.reservaId}',
                            },
                          ),
                    icon: const Icon(Icons.event_repeat),
                    label: const Text('Reasignar'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FilledButton.icon(
                    onPressed: isCancelled
                        ? null
                        : () => _confirmCheckIn(context, r),
                    icon: const Icon(Icons.how_to_reg),
                    label: const Text('Check-in'),
                  ),
                ),
              ],
            ),
          ],
        );
      }),
    );
  }
}

// ───────────── Helpers ─────────────
DateTime _asLocal(dynamic dt) {
  if (dt is DateTime) return dt.toLocal();
  if (dt is String) return DateTime.tryParse(dt)?.toLocal() ?? DateTime.now();
  return DateTime.now();
}

String _humanDuration(Duration d) {
  final h = d.inHours;
  final m = d.inMinutes.remainder(60);
  if (h > 0 && m > 0) return '${h}h ${m}m';
  if (h > 0) return '${h}h';
  return '${m}m';
}

String _normalizeStatus(String raw) {
  final s = raw.toLowerCase();
  if (s.contains('confirm')) return 'Confirmada';
  if (s.contains('pend')) return 'Pendiente';
  if (s.contains('complet')) return 'Completada';
  if (s.contains('cancel')) return 'Cancelada';
  return raw.isEmpty ? 'Pendiente' : raw;
}

Tone _toneForStatus(String raw) {
  final s = raw.toLowerCase();
  if (s.contains('complet')) return Tone.success;
  if (s.contains('pend')) return Tone.warning;
  if (s.contains('cancel')) return Tone.danger;
  if (s.contains('confirm')) return Tone.info;
  return Tone.info;
}

