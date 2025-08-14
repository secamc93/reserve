import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:rupu/presentation/views/profile/perfil_controller.dart';
import 'package:rupu/presentation/views/reserve/reserves_controller.dart';

class CreateReserveView extends StatefulWidget {
  const CreateReserveView({super.key});

  static const name = 'reserve_new';

  @override
  State<CreateReserveView> createState() => _CreateReserveViewState();
}

class _CreateReserveViewState extends State<CreateReserveView> {
  final _formKey = GlobalKey<FormState>();

  final _nameCtrl = TextEditingController();
  final _dniCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _guestsCtrl = TextEditingController(text: '1');
  final _notesCtrl = TextEditingController();

  DateTime _start = _todayAt(hour: 9);
  DateTime _end = _todayAt(hour: 10);
  bool _saving = false;

  static DateTime _todayAt({required int hour, int minute = 0}) {
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day, hour, minute);
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _dniCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _guestsCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  bool _isPastDate(DateTime dt) {
    final today0 = DateTime(
      DateTime.now().year,
      DateTime.now().month,
      DateTime.now().day,
    );
    final d0 = DateTime(dt.year, dt.month, dt.day);
    return d0.isBefore(today0);
  }

  Future<void> _pickStart() async {
    final ctx = context;
    final date = await showDatePicker(
      context: ctx,
      initialDate: _start,
      firstDate: DateTime(
        DateTime.now().year,
        DateTime.now().month,
        DateTime.now().day,
      ),
      lastDate: DateTime(2100),
      locale: const Locale('es'),
    );
    if (date == null) return;

    if (!context.mounted) return;
    final time = await showTimePicker(
      context: ctx,
      initialTime: TimeOfDay.fromDateTime(_start),
      helpText: 'Hora de inicio',
    );
    if (time == null) return;

    final tmp = DateTime(
      date.year,
      date.month,
      date.day,
      time.hour,
      time.minute,
    );
    if (_isPastDate(tmp)) {
      _showSnack('La fecha debe ser hoy o futura.');
      return;
    }
    setState(() {
      _start = tmp;
      if (!_end.isAfter(_start)) _end = _start.add(const Duration(hours: 1));
    });
  }

  Future<void> _pickEnd() async {
    final ctx = context;
    final date = await showDatePicker(
      context: ctx,
      initialDate: _end.isAfter(_start) ? _end : _start,
      firstDate: DateTime(
        DateTime.now().year,
        DateTime.now().month,
        DateTime.now().day,
      ),
      lastDate: DateTime(2100),
      locale: const Locale('es'),
    );
    if (date == null) return;

    if (!context.mounted) return;

    final time = await showTimePicker(
      context: ctx,
      initialTime: TimeOfDay.fromDateTime(_end),
      helpText: 'Hora de fin',
    );
    if (time == null) return;

    final tmp = DateTime(
      date.year,
      date.month,
      date.day,
      time.hour,
      time.minute,
    );
    if (_isPastDate(tmp)) {
      _showSnack('La fecha debe ser hoy o futura.');
      return;
    }
    if (!tmp.isAfter(_start)) {
      _showSnack('La hora de fin debe ser mayor a la de inicio.');
      return;
    }
    setState(() => _end = tmp);
  }

  Future<void> _submit() async {
    final name = _nameCtrl.text.trim();
    final dni = _dniCtrl.text.trim();
    final email = _emailCtrl.text.trim();
    final phone = _phoneCtrl.text.trim();
    final guests =
        int.tryParse(
          _guestsCtrl.text.trim().isEmpty ? '0' : _guestsCtrl.text.trim(),
        ) ??
        0;

    if (!_formKey.currentState!.validate()) return;
    if (_isPastDate(_start)) {
      _showSnack('La fecha debe ser hoy o futura.');
      return;
    }
    if (!_end.isAfter(_start)) {
      _showSnack('La hora de fin debe ser mayor a la de inicio.');
      return;
    }
    if (guests <= 0) {
      _showSnack('El número de personas debe ser mayor a 0.');
      return;
    }
    if (email.isEmpty && phone.isEmpty) {
      _showSnack('Proporciona al menos email o teléfono.');
      return;
    }
    if (email.isNotEmpty && !_isValidEmail(email)) {
      _showSnack('Email inválido.');
      return;
    }

    final perfil = Get.isRegistered<PerfilController>()
        ? Get.find<PerfilController>()
        : null;
    final businessId = perfil?.businessId ?? 0;
    if (businessId <= 0) {
      _showSnack('No hay negocio seleccionado.');
      return;
    }

    final reserveCtrl = Get.isRegistered<ReserveController>()
        ? Get.find<ReserveController>()
        : Get.put(ReserveController());

    setState(() => _saving = true);
    final ok = await reserveCtrl.crearReserva(
      businessId: businessId,
      name: name,
      startAt: _start,
      endAt: _end,
      numberOfGuests: guests,
      dni: dni.isEmpty ? null : dni,
      email: email.isEmpty ? null : email,
      phone: phone.isEmpty ? null : phone,
    );
    setState(() => _saving = false);

    if (!ok) {
      _showSnack('No se pudo crear la reserva.');
      return;
    }

    // Refresca la lista al volver
    reserveCtrl.reservasHoy();

    if (mounted) Navigator.of(context).pop();
    _showSnack('Reserva creada');
  }

  bool _isValidEmail(String email) {
    final re = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
    return re.hasMatch(email);
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return SafeArea(
      child: Scaffold(
        // Sin AppBar para no chocar con tu layout global
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          children: [
            // Encabezado suave con degradado del tema
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icon(Icons.add_circle_outline, color: cs.primary, size: 28),
                  const SizedBox(height: 8),
                  Text(
                    'Nueva reserva',
                    style: textTheme.titleLarge!.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Completa los datos para crear una nueva reserva.',
                    style: textTheme.bodyMedium!.copyWith(
                      color: cs.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Tarjeta principal (glass-lite)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: cs.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: cs.outlineVariant),
              ),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    // Nombre
                    TextFormField(
                      controller: _nameCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Nombre del cliente *',
                        hintText: 'Ej: Ana Gómez',
                        prefixIcon: Icon(Icons.person_outline),
                      ),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) {
                          return 'El nombre es obligatorio';
                        }
                        return null;
                      },
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: 12),

                    // DNI
                    TextFormField(
                      controller: _dniCtrl,
                      decoration: const InputDecoration(
                        labelText: 'DNI / Documento',
                        hintText: 'Ej: 12345678',
                        prefixIcon: Icon(Icons.badge_outlined),
                      ),
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: 12),

                    // Email
                    TextFormField(
                      controller: _emailCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        hintText: 'ejemplo@dominio.com',
                        prefixIcon: Icon(Icons.email_outlined),
                      ),
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: 12),

                    // Teléfono
                    TextFormField(
                      controller: _phoneCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Teléfono',
                        hintText: 'Ej: 3001234567',
                        prefixIcon: Icon(Icons.phone_outlined),
                      ),
                      keyboardType: TextInputType.phone,
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(RegExp(r'[0-9+\- ]')),
                      ],
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: 12),

                    // # Personas
                    TextFormField(
                      controller: _guestsCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Número de personas',
                        hintText: 'Ej: 2',
                        prefixIcon: Icon(Icons.group_outlined),
                      ),
                      keyboardType: TextInputType.number,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      validator: (v) {
                        final n = int.tryParse((v ?? '').trim());
                        if (n == null || n <= 0) return 'Debe ser mayor a 0';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Fecha / Hora
                    Row(
                      children: [
                        Expanded(
                          child: _DateTile(
                            label: 'Inicio',
                            value: DateFormat(
                              'EEE d MMM, HH:mm',
                              'es',
                            ).format(_start),
                            icon: Icons.schedule,
                            onTap: _pickStart,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _DateTile(
                            label: 'Fin',
                            value: DateFormat(
                              'EEE d MMM, HH:mm',
                              'es',
                            ).format(_end),
                            icon: Icons.schedule_outlined,
                            onTap: _pickEnd,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Notas (UI solo)
                    TextFormField(
                      controller: _notesCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Notas (opcional)',
                        hintText: 'Algo que quieras recordar…',
                        prefixIcon: Icon(Icons.sticky_note_2_outlined),
                      ),
                      minLines: 1,
                      maxLines: 3,
                    ),
                    const SizedBox(height: 20),

                    // Botones
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _saving
                                ? null
                                : () => Navigator.of(context).pop(),
                            child: const Text('Cancelar'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: FilledButton.icon(
                            onPressed: _saving ? null : _submit,
                            icon: _saving
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  )
                                : const Icon(Icons.check_circle_outline),
                            label: Text(_saving ? 'Guardando…' : 'Guardar'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DateTile extends StatelessWidget {
  const _DateTile({
    required this.label,
    required this.value,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final String value;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: cs.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: cs.outlineVariant),
        ),
        child: Row(
          children: [
            Icon(icon, color: cs.primary),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: tt.labelMedium!.copyWith(color: cs.onSurfaceVariant),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    value,
                    style: tt.titleSmall!.copyWith(fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),
            const Icon(Icons.edit_calendar_outlined),
          ],
        ),
      ),
    );
  }
}
