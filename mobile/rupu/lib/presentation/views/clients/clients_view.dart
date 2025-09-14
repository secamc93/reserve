// presentation/views/clients/clients_view.dart
import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:url_launcher/url_launcher_string.dart';

import 'clients_controller.dart';
import 'package:rupu/presentation/views/profile/perfil_controller.dart';

class ClientsView extends StatefulWidget {
  const ClientsView({super.key, required this.pageIndex});
  static const name = 'clients';
  final int pageIndex;

  @override
  State<ClientsView> createState() => _ClientsViewState();
}

class _ClientsViewState extends State<ClientsView> with WidgetsBindingObserver {
  late final ClientsController controller;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    controller = Get.isRegistered<ClientsController>()
        ? Get.find<ClientsController>()
        : Get.put(ClientsController());

    // Refresco inmediato al montar (sin bloquear con loader)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller.cargarClientes(silent: true);
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  // Si la app vuelve a 1er plano, refresca
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      controller.cargarClientes(silent: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Clientes'), centerTitle: true),
      body: RefreshIndicator(
        onRefresh: () => controller.cargarClientes(silent: true),
        child: Obx(() {
          if (controller.isLoading.value && controller.clientes.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }
          final error = controller.errorMessage.value;
          if (error != null && controller.clientes.isEmpty) {
            return Center(child: Text(error));
          }

          return ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            children: [
              // Header premium
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(18),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      cs.primary.withValues(alpha: .10),
                      cs.secondary.withValues(alpha: .08),
                    ],
                  ),
                  border: Border.all(color: cs.outlineVariant),
                ),
                child: Row(
                  children: [
                    _InitialAvatar(
                      initial: 'C',
                      size: 52,
                      start: cs.primary,
                      end: cs.secondary,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Clientes con reserva',
                            style: tt.titleLarge!.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            controller.clientes.isEmpty
                                ? 'Aún no hay clientes registrados para hoy.'
                                : '${controller.clientes.length} cliente${controller.clientes.length == 1 ? '' : 's'} hoy',
                            style: tt.bodyMedium!.copyWith(
                              color: cs.onSurfaceVariant,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              if (controller.clientes.isEmpty) ...[
                _EmptyStateCard(
                  title: 'Sin clientes hoy',
                  message:
                      'Cuando registres reservas, los clientes aparecerán aquí para contactarlos rápido.',
                ),
              ] else ...[
                for (final c in controller.clientes) ...[
                  _ClientCard(
                    name: c.nombre,
                    email: c.email,
                    phone: c.telefono,
                    businessName: Get.isRegistered<PerfilController>()
                        ? (Get.find<PerfilController>().businessName)
                        : '',
                    onCall: () => _launchPhone(c.telefono),
                    onEmail: () => _launchEmail(
                      to: c.email,
                      subject: 'Hola ${c.nombre.isNotEmpty ? c.nombre : ''}',
                      body: 'Hola ${c.nombre.isNotEmpty ? c.nombre : ''},\n\n',
                    ),
                    onWhatsApp: () => _launchWhatsApp(
                      phone: c.telefono,
                      message:
                          'Hola ${c.nombre.isNotEmpty ? c.nombre : ''} 👋, te saluda ${Get.isRegistered<PerfilController>() ? (Get.find<PerfilController>().businessName) : 'nuestro negocio'}.',
                    ),
                  ),
                  const SizedBox(height: 14),
                ],
              ],
            ],
          );
        }),
      ),
    );
  }

  // ───────────── helpers url ─────────────
  Future<void> _launchPhone(String phone) async {
    final cleaned = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    if (cleaned.isEmpty) return;
    final uri = Uri(scheme: 'tel', path: cleaned);
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  Future<void> _launchEmail({
    required String to,
    String? subject,
    String? body,
  }) async {
    if (to.trim().isEmpty) return;
    final uri = Uri(
      scheme: 'mailto',
      path: to.trim(),
      queryParameters: {
        if ((subject ?? '').isNotEmpty) 'subject': subject!,
        if ((body ?? '').isNotEmpty) 'body': body!,
      },
    );
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  Future<void> _launchWhatsApp({
    required String phone,
    required String message,
  }) async {
    final cleaned = phone.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleaned.isEmpty) return;
    final encoded = Uri.encodeComponent(message);
    final wa = 'https://wa.me/$cleaned?text=$encoded';
    if (!await launchUrlString(wa, mode: LaunchMode.externalApplication)) {
      await launchUrlString(wa, mode: LaunchMode.platformDefault);
    }
  }
}

// ───────────── Widgets ─────────────

class _ClientCard extends StatelessWidget {
  const _ClientCard({
    required this.name,
    required this.email,
    required this.phone,
    required this.businessName,
    required this.onCall,
    required this.onEmail,
    required this.onWhatsApp,
  });

  final String name;
  final String email;
  final String phone;
  final String businessName;

  final VoidCallback onCall;
  final VoidCallback onEmail;
  final VoidCallback onWhatsApp;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    final initial =
        (name.trim().isNotEmpty ? name.trim().characters.first : '•')
            .toUpperCase();

    final canCall = phone.trim().isNotEmpty;
    final canEmail = email.trim().isNotEmpty;
    final canWA = phone.trim().isNotEmpty;

    return DecoratedBox(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .06),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: .02),
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Container(
        padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
        decoration: BoxDecoration(
          color: cs.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: cs.outlineVariant),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            _InitialAvatar(
              initial: initial,
              size: 52,
              start: cs.primary,
              end: cs.secondary,
            ),
            const SizedBox(width: 12),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name.isEmpty ? 'Cliente' : name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: tt.titleMedium!.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Wrap(
                    spacing: 8,
                    runSpacing: 2,
                    children: [
                      if (email.trim().isNotEmpty)
                        _MiniPill(icon: Icons.email_outlined, text: email),
                      if (phone.trim().isNotEmpty)
                        _MiniPill(icon: Icons.phone_outlined, text: phone),
                      if (businessName.trim().isNotEmpty)
                        _MiniPill(
                          icon: Icons.store_outlined,
                          text: businessName,
                        ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),

            // Acciones
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _IconAction(
                  tooltip: 'Llamar',
                  icon: Icons.call,
                  onTap: canCall ? onCall : null,
                  fg: canCall ? cs.primary : cs.onSurfaceVariant,
                  bg: canCall
                      ? cs.primary.withValues(alpha: .10)
                      : cs.surfaceContainerHighest,
                ),
                const SizedBox(width: 8),
                _IconAction(
                  tooltip: 'Email',
                  icon: Icons.email,
                  onTap: canEmail ? onEmail : null,
                  fg: canEmail ? cs.secondary : cs.onSurfaceVariant,
                  bg: canEmail
                      ? cs.secondary.withValues(alpha: .10)
                      : cs.surfaceContainerHighest,
                ),
                const SizedBox(width: 8),
                _IconAction(
                  tooltip: 'WhatsApp',
                  icon: FontAwesomeIcons.whatsapp, // <- logo real
                  onTap: canWA ? onWhatsApp : null,
                  fg: const Color(0xFF25D366),
                  bg: const Color(0xFF25D366).withValues(alpha: .12),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _InitialAvatar extends StatelessWidget {
  const _InitialAvatar({
    required this.initial,
    required this.size,
    required this.start,
    required this.end,
  });

  final String initial;
  final double size;
  final Color start;
  final Color end;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(size),
      child: Stack(
        children: [
          Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  start.withValues(alpha: .85),
                  end.withValues(alpha: .85),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              border: Border.all(
                color: Colors.white.withValues(alpha: .9),
                width: 3,
              ),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: .1),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
          ),
          Positioned.fill(
            child: Center(
              child: Text(
                initial,
                style: Theme.of(context).textTheme.titleLarge!.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniPill extends StatelessWidget {
  const _MiniPill({required this.icon, required this.text});
  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: cs.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: cs.outlineVariant),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: cs.onSurfaceVariant),
          const SizedBox(width: 6),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 160),
            child: Text(
              text,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(
                context,
              ).textTheme.labelSmall!.copyWith(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

class _IconAction extends StatelessWidget {
  const _IconAction({
    required this.tooltip,
    required this.icon,
    required this.onTap,
    required this.fg,
    required this.bg,
  });

  final String tooltip;
  final IconData icon;
  final VoidCallback? onTap;
  final Color fg;
  final Color bg;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Ink(
          width: 42,
          height: 38,
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: fg.withValues(alpha: .15)),
          ),
          child: Icon(icon, color: fg, size: 18),
        ),
      ),
    );
  }
}

class _EmptyStateCard extends StatelessWidget {
  const _EmptyStateCard({required this.title, required this.message});
  final String title;
  final String message;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: cs.surfaceContainerHighest.withValues(alpha: .35),
            border: Border.all(color: cs.outlineVariant),
            borderRadius: BorderRadius.circular(16),
          ),
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
                child: Icon(Icons.group_outlined, color: cs.primary),
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
                      style: tt.bodyMedium!.copyWith(
                        color: cs.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
