// presentation/views/calendar/calendar_view_reserve.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:rupu/presentation/views/profile/perfil_controller.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

import 'package:rupu/domain/entities/reserve.dart';
import 'package:rupu/presentation/views/reserve/reserves_controller.dart';

class CalendarViewReserve extends StatefulWidget {
  const CalendarViewReserve({super.key});
  static const name = 'calendar';

  @override
  State<CalendarViewReserve> createState() => _CalendarViewReserveState();
}

class _CalendarViewReserveState extends State<CalendarViewReserve> {
  final calCtrl = CalendarController();
  CalendarView _view = CalendarView.month;

  // Solo vistas soportadas
  static const _views = <CalendarView>[
    CalendarView.month,
    CalendarView.week,
    CalendarView.workWeek,
    CalendarView.day,
    CalendarView.schedule,
  ];

  // Eventos creados localmente (además de los traídos del controller)
  final List<Appointment> _localEvents = [];

  @override
  void initState() {
    super.initState();
    calCtrl.view = _view;
  }

  @override
  void dispose() {
    calCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reserve = Get.isRegistered<ReserveController>()
        ? Get.find<ReserveController>()
        : Get.put(ReserveController());

    return SafeArea(
      child: Obx(() {
        final appts = _toAppointments(reserve.reservas);
        final merged = [...appts, ..._localEvents];

        return Stack(
          children: [
            Column(
              children: [
                _compactToolbar(context),
                Expanded(child: _calendar(merged)),
              ],
            ),

            // FAB para agregar desde la fecha visible
            Positioned(
              right: 16,
              bottom: 16,
              child: FloatingActionButton.extended(
                onPressed: () {
                  final base = calCtrl.displayDate ?? DateTime.now();
                  final initial = DateTime(base.year, base.month, base.day, 9);
                  _openAddEventSheet(initialDate: initial);
                },
                icon: const Icon(Icons.add),
                label: const Text('Agregar'),
              ),
            ),
          ],
        );
      }),
    );
  }

  // ───────────────── Toolbar compacta ─────────────────
  Widget _compactToolbar(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Container(
      height: 44,
      margin: const EdgeInsets.fromLTRB(12, 8, 12, 6),
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: cs.outlineVariant),
      ),
      child: Row(
        children: [
          PopupMenuButton<CalendarView>(
            tooltip: 'Cambiar vista',
            onSelected: (v) => setState(() {
              _view = v;
              calCtrl.view = v;
            }),
            itemBuilder: (_) => _views
                .map((v) => PopupMenuItem(value: v, child: Text(_labelFor(v))))
                .toList(),
            child: Row(
              children: [
                Icon(_viewIcon(_view), color: cs.onSurfaceVariant),
                const SizedBox(width: 6),
                Text(
                  _labelFor(_view),
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: cs.onSurface,
                  ),
                ),
                const Icon(Icons.expand_more, size: 18),
              ],
            ),
          ),
          const Spacer(),
          IconButton(
            tooltip: 'Hoy',
            onPressed: () {
              final now = DateTime.now();
              calCtrl.displayDate = DateTime(now.year, now.month, now.day);
            },
            icon: const Icon(Icons.today_outlined),
          ),
          IconButton(
            tooltip: 'Anterior',
            onPressed: () {
              final d = calCtrl.displayDate ?? DateTime.now();
              calCtrl.displayDate = _stepBack(d, _view);
            },
            icon: const Icon(Icons.chevron_left),
          ),
          IconButton(
            tooltip: 'Siguiente',
            onPressed: () {
              final d = calCtrl.displayDate ?? DateTime.now();
              calCtrl.displayDate = _stepForward(d, _view);
            },
            icon: const Icon(Icons.chevron_right),
          ),
        ],
      ),
    );
  }

  // ───────────────── Calendario base ─────────────────
  Widget _calendar(List<Appointment> appts) {
    final monthSettings = (_view == CalendarView.month)
        ? const MonthViewSettings(
            appointmentDisplayMode: MonthAppointmentDisplayMode.appointment,
            showAgenda: true,
          )
        : const MonthViewSettings();

    return SfCalendar(
      controller: calCtrl,
      view: _view,
      dataSource: _ReserveCalendarDataSource(appts),
      firstDayOfWeek: DateTime.monday,
      headerHeight: 48,
      headerStyle: const CalendarHeaderStyle(
        textAlign: TextAlign.center,
        textStyle: TextStyle(fontWeight: FontWeight.w800),
      ),
      viewHeaderStyle: const ViewHeaderStyle(
        dayTextStyle: TextStyle(fontWeight: FontWeight.w700),
      ),
      // 24 horas visibles en vistas de tiempo
      timeSlotViewSettings: const TimeSlotViewSettings(
        startHour: 0,
        endHour: 24,
        timeIntervalHeight: 52,
        nonWorkingDays: <int>[DateTime.sunday],
      ),
      monthViewSettings: monthSettings,
      showDatePickerButton: false,
      allowViewNavigation: true,

      // Taps: abrir detalles o formulario de creación
      onTap: _handleTap,
      onLongPress: _handleLongPress,
    );
  }

  // ─────────────── Creación con restricción (solo hoy→futuro) ───────────────
  void _handleTap(CalendarTapDetails d) {
    if (d.targetElement == CalendarElement.appointment &&
        (d.appointments?.isNotEmpty ?? false)) {
      final appt = d.appointments!.first as Appointment;
      _showAppointmentSheet(appt);
      return;
    }

    if (d.targetElement == CalendarElement.calendarCell) {
      final tapped = d.date ?? DateTime.now();
      final base = DateTime(
        tapped.year,
        tapped.month,
        tapped.day,
        tapped.hour,
        0,
      );
      if (_isPastDate(base)) {
        _showSnack('No puedes crear eventos en fechas pasadas.');
        return;
      }
      final initial =
          (_view == CalendarView.month || _view == CalendarView.schedule)
          ? DateTime(base.year, base.month, base.day, 9, 0)
          : base;
      _openAddEventSheet(initialDate: initial);
    }
  }

  void _handleLongPress(CalendarLongPressDetails d) {
    final pressed = d.date ?? DateTime.now();
    final base = DateTime(
      pressed.year,
      pressed.month,
      pressed.day,
      pressed.hour,
      0,
    );
    if (_isPastDate(base)) {
      _showSnack('No puedes crear eventos en fechas pasadas.');
      return;
    }
    final initial =
        (_view == CalendarView.month || _view == CalendarView.schedule)
        ? DateTime(base.year, base.month, base.day, 9, 0)
        : base;
    _openAddEventSheet(initialDate: initial);
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

  // ─────────────── Sheet de "Nuevo evento" con todos los campos ───────────────
  Future<void> _openAddEventSheet({required DateTime initialDate}) async {
    final cs = Theme.of(context).colorScheme;

    // Controllers para los campos solicitados
    final nameCtrl = TextEditingController();
    final dniCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final guestsCtrl = TextEditingController(text: '1');
    final notesCtrl = TextEditingController();

    DateTime start = initialDate;
    DateTime end = initialDate.add(const Duration(hours: 1));

    await showModalBottomSheet(
      context: context,
      useSafeArea: true,
      isScrollControlled: true,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 16,
            top: 6,
          ),
          child: StatefulBuilder(
            builder: (ctx, setLocal) {
              Future<void> pickStart() async {
                final date = await showDatePicker(
                  context: ctx,
                  initialDate: start,
                  firstDate: DateTime(
                    DateTime.now().year,
                    DateTime.now().month,
                    DateTime.now().day,
                  ), // hoy
                  lastDate: DateTime(2100),
                  locale: const Locale('es'),
                );
                if (date == null) return;
                final time = await showTimePicker(
                  context: ctx,
                  initialTime: TimeOfDay.fromDateTime(start),
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
                setLocal(() {
                  start = tmp;
                  if (!end.isAfter(start))
                    end = start.add(const Duration(hours: 1));
                });
              }

              Future<void> pickEnd() async {
                final date = await showDatePicker(
                  context: ctx,
                  initialDate: end.isAfter(start) ? end : start,
                  firstDate: DateTime(
                    DateTime.now().year,
                    DateTime.now().month,
                    DateTime.now().day,
                  ), // hoy
                  lastDate: DateTime(2100),
                  locale: const Locale('es'),
                );
                if (date == null) return;
                final time = await showTimePicker(
                  context: ctx,
                  initialTime: TimeOfDay.fromDateTime(end),
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
                if (!tmp.isAfter(start)) {
                  _showSnack('La hora de fin debe ser mayor a la de inicio.');
                  return;
                }
                setLocal(() => end = tmp);
              }

              return SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Nuevo evento',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Nombre (requerido)
                    TextField(
                      controller: nameCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Nombre del cliente *',
                        hintText: 'Ej: Ana Gómez',
                      ),
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: 8),

                    // DNI
                    TextField(
                      controller: dniCtrl,
                      decoration: const InputDecoration(
                        labelText: 'DNI / Documento',
                        hintText: 'Ej: 12345678',
                      ),
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: 8),

                    // Email
                    TextField(
                      controller: emailCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        hintText: 'ejemplo@dominio.com',
                      ),
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: 8),

                    // Teléfono
                    TextField(
                      controller: phoneCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Teléfono',
                        hintText: 'Ej: 3001234567',
                      ),
                      keyboardType: TextInputType.phone,
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(RegExp(r'[0-9+\- ]')),
                      ],
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: 8),

                    // Nº de personas
                    TextField(
                      controller: guestsCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Número de personas',
                        hintText: 'Ej: 2',
                      ),
                      keyboardType: TextInputType.number,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      textInputAction: TextInputAction.next,
                    ),
                    const SizedBox(height: 12),

                    Row(
                      children: [
                        Expanded(
                          child: _DateTimeTile(
                            label: 'Inicio',
                            value:
                                '${DateFormat('EEE d MMM, HH:mm', 'es').format(start)}',
                            onTap: pickStart,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _DateTimeTile(
                            label: 'Fin',
                            value:
                                '${DateFormat('EEE d MMM, HH:mm', 'es').format(end)}',
                            onTap: pickEnd,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Notas (opcional)
                    TextField(
                      controller: notesCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Notas',
                        hintText: 'Opcional',
                      ),
                      minLines: 1,
                      maxLines: 3,
                    ),
                    const SizedBox(height: 12),

                    Row(
                      children: [
                        OutlinedButton(
                          onPressed: () => Navigator.of(ctx).pop(),
                          child: const Text('Cancelar'),
                        ),
                        const SizedBox(width: 8),
                        FilledButton(
                          onPressed: () async {
                            final name = nameCtrl.text.trim();
                            final dni = dniCtrl.text.trim();
                            final email = emailCtrl.text.trim();
                            final phone = phoneCtrl.text.trim();
                            final guests =
                                int.tryParse(
                                  guestsCtrl.text.trim().isEmpty
                                      ? '0'
                                      : guestsCtrl.text.trim(),
                                ) ??
                                0;

                            if (name.isEmpty) {
                              _showSnack('El nombre es obligatorio.');
                              return;
                            }
                            if (_isPastDate(start)) {
                              _showSnack('La fecha debe ser hoy o futura.');
                              return;
                            }
                            if (!end.isAfter(start)) {
                              _showSnack(
                                'La hora de fin debe ser mayor a la de inicio.',
                              );
                              return;
                            }
                            if (guests <= 0) {
                              _showSnack(
                                'El número de personas debe ser mayor a 0.',
                              );
                              return;
                            }
                            // Requiere algún dato de contacto
                            if (email.isEmpty && phone.isEmpty) {
                              _showSnack(
                                'Proporciona al menos email o teléfono.',
                              );
                              return;
                            }
                            if (email.isNotEmpty && !_isValidEmail(email)) {
                              _showSnack('Email inválido.');
                              return;
                            }
                            Get.put(PerfilController());
                            // ✅ businessId desde PerfilController (ya registrado)
                            final perfil = Get.find<PerfilController>();
                            final businessId =
                                perfil.businessId; // <- ya es 1 en tu caso

                            final reserveCtrl =
                                Get.isRegistered<ReserveController>()
                                ? Get.find<ReserveController>()
                                : Get.put(ReserveController());

                            final ok = await reserveCtrl.crearReserva(
                              businessId: businessId,
                              name: name,
                              startAt: start,
                              endAt: end,
                              numberOfGuests: guests,
                              dni: dni, // ✅ pasa el string crudo
                              email: email, // ✅
                              phone: phone, // ✅
                            );

                            if (!ok) {
                              _showSnack('No se pudo crear la reserva.');
                              return;
                            }

                            if (mounted) Navigator.of(ctx).pop();
                            _showSnack('Evento creado');
                          },

                          child: const Text('Guardar'),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        );
      },
    );
  }

  void _showAppointmentSheet(Appointment appt) {
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 6, 16, 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              appt.subject,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 6),
            Text(
              '${DateFormat('EEE d MMM, HH:mm', 'es').format(appt.startTime)} - '
              '${DateFormat('HH:mm', 'es').format(appt.endTime)}',
            ),
            if ((appt.notes ?? '').isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(appt.notes!),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                OutlinedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Cerrar'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  // ───────────────── Utils ─────────────────
  String _labelFor(CalendarView v) {
    switch (v) {
      case CalendarView.month:
        return 'Mes';
      case CalendarView.week:
        return 'Semana';
      case CalendarView.workWeek:
        return 'Semana laboral';
      case CalendarView.day:
        return 'Día';
      case CalendarView.schedule:
        return 'Agenda';
      default:
        return v.toString();
    }
  }

  IconData _viewIcon(CalendarView v) {
    switch (v) {
      case CalendarView.month:
        return Icons.calendar_view_month;
      case CalendarView.week:
      case CalendarView.workWeek:
        return Icons.view_week;
      case CalendarView.day:
        return Icons.view_day;
      case CalendarView.schedule:
        return Icons.view_agenda;
      default:
        return Icons.calendar_today;
    }
  }

  DateTime _stepBack(DateTime d, CalendarView v) {
    switch (v) {
      case CalendarView.day:
        return d.subtract(const Duration(days: 1));
      case CalendarView.week:
      case CalendarView.workWeek:
        return d.subtract(const Duration(days: 7));
      case CalendarView.month:
      case CalendarView.schedule:
      default:
        return DateTime(d.year, d.month - 1, d.day);
    }
  }

  DateTime _stepForward(DateTime d, CalendarView v) {
    switch (v) {
      case CalendarView.day:
        return d.add(const Duration(days: 1));
      case CalendarView.week:
      case CalendarView.workWeek:
        return d.add(const Duration(days: 7));
      case CalendarView.month:
      case CalendarView.schedule:
      default:
        return DateTime(d.year, d.month + 1, d.day);
    }
  }

  List<Appointment> _toAppointments(List<Reserve> reservas) {
    final list = [...reservas];
    list.sort((a, b) {
      final da = _parseDate(a.startAt) ?? DateTime(9999);
      final db = _parseDate(b.startAt) ?? DateTime(9999);
      final c = da.compareTo(db);
      if (c != 0) return c;
      final ea = _parseDate(a.endAt) ?? da;
      final eb = _parseDate(b.endAt) ?? db;
      return ea.compareTo(eb);
    });

    return list.map((r) {
      final start = _parseDate(r.startAt) ?? DateTime.now();
      final end = _parseDate(r.endAt) ?? start.add(const Duration(hours: 1));
      final subject = _subjectFor(r);
      final notes = _notesFor(r);
      final color = _colorFor(r);
      return Appointment(
        startTime: start,
        endTime: end,
        subject: subject,
        notes: notes,
        color: color,
      );
    }).toList();
  }

  DateTime? _parseDate(dynamic raw) {
    if (raw == null) return null;
    if (raw is DateTime) return raw.toLocal();
    if (raw is String) return DateTime.tryParse(raw)?.toLocal();
    return null;
  }

  String _subjectFor(Reserve r) {
    final cliente = (r.clienteNombre).trim();
    final estado = (r.estadoNombre).trim();
    if (cliente.isEmpty && estado.isEmpty) return 'Reserva';
    if (cliente.isNotEmpty && estado.isNotEmpty) return '$cliente • $estado';
    return cliente.isNotEmpty ? cliente : estado;
  }

  String _notesFor(Reserve r) {
    final negocio = r.negocioNombre.trim();
    final mesa = r.mesaNumero?.toString().trim();
    final tel = r.clienteTelefono.toString().trim();
    final parts = <String>[
      if (negocio.isNotEmpty == true) 'Negocio: $negocio',
      if (mesa?.isNotEmpty == true) 'Mesa: $mesa',
      if (tel.isNotEmpty == true) 'Tel: $tel',
    ];
    return parts.isEmpty ? '' : parts.join(' • ');
  }

  Color _colorFor(Reserve r) {
    final s = (r.estadoNombre).toLowerCase();
    if (s.contains('confirm')) return Colors.teal;
    if (s.contains('pend')) return Colors.amber;
    if (s.contains('pag')) return Colors.blue;
    return Colors.grey;
  }

  bool _isValidEmail(String email) {
    // Validador simple/robusto suficiente para UI
    final re = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
    return re.hasMatch(email);
  }
}

// DataSource simple
class _ReserveCalendarDataSource extends CalendarDataSource {
  _ReserveCalendarDataSource(List<Appointment> appts) {
    appointments = appts;
  }
}

// Tile reutilizable para seleccionar fecha/hora
class _DateTimeTile extends StatelessWidget {
  const _DateTimeTile({
    required this.label,
    required this.value,
    required this.onTap,
  });

  final String label;
  final String value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: cs.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: cs.outlineVariant),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: Theme.of(context).textTheme.labelMedium!.copyWith(
                color: cs.onSurfaceVariant,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(
                context,
              ).textTheme.titleSmall!.copyWith(fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }
}
