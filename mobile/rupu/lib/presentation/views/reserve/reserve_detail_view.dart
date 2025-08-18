// presentation/views/reserve/reserve_detail_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:rupu/config/helpers/design_helper.dart';
import 'package:rupu/presentation/views/profile/perfil_controller.dart';
import 'reserve_detail_controller.dart';
import 'update_reserve_view.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

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
            _HeaderCard(
              name: name.isEmpty ? 'Cliente' : name,
              email: (r.clienteEmail).trim(),
              statusText: r.estadoNombre,
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
                                  _TimeChip(
                                    icon: Icons.schedule,
                                    label:
                                        '${dfTime.format(start)} – ${dfTime.format(end)}',
                                  ),
                                  const SizedBox(width: 8),
                                  _TimeChip(
                                    icon: Icons.timelapse,
                                    label: durationLabel,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        StatusPill(text: _normalizeStatus(r.estadoNombre)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Divider(height: 1),
                    const SizedBox(height: 12),

                    Wrap(
                      runSpacing: 10,
                      spacing: 16,
                      children: [
                        _InfoTile(
                          icon: Icons.group_outlined,
                          label: 'Personas',
                          value: '${r.numberOfGuests}',
                        ),
                        if ((r.mesaNumero ?? '').toString().isNotEmpty)
                          _InfoTile(
                            icon: Icons.table_bar_outlined,
                            label: 'Mesa',
                            value: '${r.mesaNumero}',
                          ),
                        if ((r.negocioNombre).trim().isNotEmpty)
                          _InfoTile(
                            icon: Icons.store_mall_directory_outlined,
                            label: 'Negocio',
                            value: r.negocioNombre,
                          ),
                        _InfoTile(
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
                    _SectionTitle('Contacto del cliente'),
                    const SizedBox(height: 10),
                    if (r.clienteTelefono.toString().trim().isNotEmpty)
                      _ContactRow(
                        icon: Icons.phone_outlined,
                        label: 'Teléfono',
                        value: r.clienteTelefono.toString(),
                      ),
                    if ((r.clienteEmail).trim().isNotEmpty)
                      _ContactRow(
                        icon: Icons.email_outlined,
                        label: 'Email',
                        value: r.clienteEmail,
                      ),
                    if ((r.clienteDni).toString().trim().isNotEmpty)
                      _ContactRow(
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
                      _SectionTitle('Historial'),
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
                    onPressed: () {},
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

class _HeaderCard extends StatelessWidget {
  const _HeaderCard({
    required this.name,
    required this.email,
    required this.statusText,
    required this.bannerUrl,
    required this.initial,
  });

  final String name;
  final String email;
  final String statusText;
  final String bannerUrl; // <- logo del negocio
  final String initial; // <- inicial del cliente

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return SizedBox(
      height: 150,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Banner: logo del negocio
            if (bannerUrl.isNotEmpty)
              Image.network(
                bannerUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(color: cs.surface),
              )
            else
              Container(color: cs.surface),

            // Overlay muy sutil (sin blur agresivo)
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    cs.surface.withValues(alpha: .75),
                    cs.surface.withValues(alpha: .75),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),

            // Contenido
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Row(
                children: [
                  _InitialAvatar(initial: initial, size: 64),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center, // centrado
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: tt.titleLarge!.copyWith(
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (email.trim().isNotEmpty)
                          Text(
                            email,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: tt.bodyMedium!.copyWith(
                              color: cs.onSurfaceVariant,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                      ],
                    ),
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

/// Avatar con la inicial (gradiente del tema, borde blanco y sombra sutil)
class _InitialAvatar extends StatelessWidget {
  const _InitialAvatar({required this.initial, this.size = 56});

  final String initial;
  final double size;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final textStyle = Theme.of(context).textTheme.headlineSmall!.copyWith(
      color: Colors.white,
      fontWeight: FontWeight.w800,
    );

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: [cs.primary, cs.secondary],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: cs.primary.withValues(alpha: .22),
            blurRadius: 10,
            offset: const Offset(0, 6),
          ),
        ],
        border: Border.all(
          color: Colors.white.withValues(alpha: .95),
          width: 3,
        ),
      ),
      alignment: Alignment.center,
      child: FittedBox(
        fit: BoxFit.scaleDown,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 6),
          child: Text(initial, style: textStyle),
        ),
      ),
    );
  }
}

class _TimeChip extends StatelessWidget {
  const _TimeChip({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: cs.outlineVariant),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: cs.onSurfaceVariant),
          const SizedBox(width: 6),
          Text(
            label,
            style: Theme.of(
              context,
            ).textTheme.labelMedium!.copyWith(fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({
    required this.icon,
    required this.label,
    required this.value,
  });
  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return ConstrainedBox(
      constraints: const BoxConstraints(minWidth: 120),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: cs.primary),
          const SizedBox(width: 8),
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: tt.labelSmall!.copyWith(
                    color: cs.onSurfaceVariant,
                    height: 1,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: tt.titleSmall!.copyWith(fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;
  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    return Text(
      text,
      style: tt.titleMedium!.copyWith(fontWeight: FontWeight.w800),
    );
  }
}

class _ContactRow extends StatelessWidget {
  const _ContactRow({
    required this.icon,
    required this.label,
    required this.value,
  });
  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Icon(icon, color: cs.onSurfaceVariant),
          const SizedBox(width: 10),
          Text(
            label,
            style: tt.labelMedium!.copyWith(color: cs.onSurfaceVariant),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: tt.bodyMedium!.copyWith(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

/// Colores fijos por estado
class StatusPill extends StatelessWidget {
  const StatusPill({super.key, required this.text});
  final String text;

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = _statusColors(text);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: fg.withValues(alpha: .25)),
      ),
      child: Text(
        text,
        style: Theme.of(context).textTheme.labelMedium!.copyWith(
          color: fg,
          fontWeight: FontWeight.w700,
          letterSpacing: .2,
        ),
      ),
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
  if (s.contains('pag')) return 'Pagada';
  if (s.contains('cancel')) return 'Cancelada';
  return raw.isEmpty ? 'Pendiente' : raw;
}

(Color, Color) _statusColors(String status) {
  final s = status.toLowerCase();
  if (s.contains('confirm')) {
    return (const Color(0xFFE6F4EA), const Color(0xFF0F5132));
  } else if (s.contains('pend')) {
    return (const Color(0xFFFFF4E5), const Color(0xFF7A4F01));
  } else if (s.contains('pag')) {
    return (const Color(0xFFE7F1FF), const Color(0xFF084298));
  } else if (s.contains('cancel')) {
    return (const Color(0xFFFFE5E5), const Color(0xFF842029));
  }
  return (const Color(0xFFEDEDED), const Color(0xFF222222));
}
