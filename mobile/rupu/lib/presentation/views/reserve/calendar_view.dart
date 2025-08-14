// presentation/views/calendar/calendar_view_reserve.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:rupu/config/helpers/calendar_helper.dart';
import 'package:rupu/presentation/views/profile/perfil_controller.dart';
import 'package:rupu/presentation/views/reserve/data_time_tile.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

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
    applyOrientationPolicy();
  }

  @override
  void dispose() {
    calCtrl.dispose();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reserve = Get.isRegistered<ReserveController>()
        ? Get.find<ReserveController>()
        : Get.put(ReserveController());

    if (reserve.reservasTodas.isEmpty) {
      reserve.cargarReservasTodas(silent: true);
    }

    return SafeArea(
      child: Obx(() {
        final appts = toAppointments(reserve.reservasTodas);
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
              // aplica/levanta el bloqueo según la vista elegida
              applyOrientationPolicy();
            }),
            itemBuilder: (_) => _views
                .map((v) => PopupMenuItem(value: v, child: Text(labelFor(v))))
                .toList(),
            child: Row(
              children: [
                Icon(viewIcon(_view), color: cs.onSurfaceVariant),
                const SizedBox(width: 6),
                Text(
                  labelFor(_view),
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
              calCtrl.displayDate = stepBack(d, _view);
            },
            icon: const Icon(Icons.chevron_left),
          ),
          IconButton(
            tooltip: 'Siguiente',
            onPressed: () {
              final d = calCtrl.displayDate ?? DateTime.now();
              calCtrl.displayDate = stepForward(d, _view);
            },
            icon: const Icon(Icons.chevron_right),
          ),
        ],
      ),
    );
  }

  // ───────────────── Calendario base ─────────────────
  Widget _calendar(List<Appointment> appts) {
    return LayoutBuilder(
      builder: (context, c) {
        // Medidas seguras según orientación/constraints
        final size = MediaQuery.of(context).size;
        final orientation = MediaQuery.of(context).orientation;
        final maxH = c.maxHeight > 0 ? c.maxHeight : size.height;
        final isTimeView =
            _view == CalendarView.day ||
            _view == CalendarView.week ||
            _view == CalendarView.workWeek;

        // Altura de slots en vistas de tiempo (evita 0/negativos)
        final slotHeight = (maxH / 12).clamp(40.0, 80.0).toDouble();

        // Altura del panel de agenda en vista Month (cuando showAgenda = true)
        final agendaHeight = (maxH * 0.28).clamp(120.0, 260.0).toDouble();

        final monthSettings = (_view == CalendarView.month)
            ? MonthViewSettings(
                appointmentDisplayMode: MonthAppointmentDisplayMode.indicator,
                showAgenda: true,
                numberOfWeeksInView: 6,
                agendaViewHeight: agendaHeight,
                agendaStyle: AgendaStyle(
                  appointmentTextStyle: TextStyle(color: Colors.black),
                  // dayTextStyle: TextStyle(color: Colors.black87, fontWeight: FontWeight.w600),
                  // dateTextStyle: TextStyle(color: Colors.black87),
                ),
              )
            : const MonthViewSettings();

        return SfCalendar(
          // Clave dependiente de vista y orientación -> resetea layout seguro
          key: ValueKey('$_view-${orientation.name}'),
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

          // 24 horas visibles en vistas de tiempo (con altura segura)
          timeSlotViewSettings: TimeSlotViewSettings(
            startHour: 0,
            endHour: 24,
            timeIntervalHeight: isTimeView ? slotHeight : 52,
            nonWorkingDays: const <int>[DateTime.sunday],
          ),

          monthViewSettings: monthSettings,
          showDatePickerButton: false,
          allowViewNavigation: true,
          appointmentBuilder: (ctx, details) {
            final appt = details.appointments.first as Appointment;
            final isMonth = _view == CalendarView.month;

            final startHM = DateFormat('HH:mm', 'es').format(appt.startTime);
            final endHM = DateFormat('HH:mm', 'es').format(appt.endTime);

            final bg = (appt.color == Colors.transparent || appt.color == null)
                ? ApptPalette.infoBg
                : appt.color;
            final fg = fixedFgForBg(bg); // 👈 texto/elementos con paleta

            final r = details.bounds;
            final w = r.width;
            final h = r.height;
            final safeRadius = (h / 2 - 1).clamp(4.0, 10.0);
            final tiny = w < 86;
            final compact = w < 120;

            if (isMonth) {
              return SizedBox(
                width: w,
                height: h,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(safeRadius),
                  child: Container(
                    color: bg,
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    alignment: Alignment.centerLeft,
                    child: Row(
                      children: [
                        if (!tiny)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            constraints: const BoxConstraints(
                              minWidth: 28,
                              maxWidth: 55,
                              minHeight: 25,
                              maxHeight: 50,
                            ),
                            decoration: BoxDecoration(
                              color: fg.withOpacity(
                                .12,
                              ), // 👈 overlay relativo al fg
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: FittedBox(
                              fit: BoxFit.scaleDown,
                              child: Column(
                                children: [
                                  Text(
                                    appt.isAllDay ? 'día' : startHM,
                                    maxLines: 1,
                                    style: TextStyle(
                                      color: fg, // 👈 texto con fg fijo
                                      fontWeight: FontWeight.w700,
                                      fontSize: 10,
                                    ),
                                  ),
                                  Text(
                                    appt.isAllDay ? 'día' : endHM,
                                    maxLines: 1,
                                    style: TextStyle(
                                      color: fg,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 10,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                        else
                          Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              color: fg, // 👈 puntito con fg
                              shape: BoxShape.circle,
                            ),
                          ),
                        SizedBox(width: tiny ? 4 : 6),
                        Flexible(
                          child: Text(
                            appt.subject,
                            maxLines: 1,
                            softWrap: false,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: fg, // 👈 texto con fg
                              fontWeight: FontWeight.w600,
                              fontSize: compact ? 10.5 : 11.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            } else {
              final collapse = h < 28;
              return SizedBox(
                width: w,
                height: h,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(safeRadius),
                  child: Container(
                    color: bg,
                    padding: const EdgeInsets.symmetric(horizontal: 6),
                    alignment: Alignment.centerLeft,
                    child: collapse
                        ? Text(
                            appt.isAllDay
                                ? 'Todo el día · ${appt.subject}'
                                : '$startHM–$endHM  ${appt.subject}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: fg, // 👈
                              fontWeight: FontWeight.w600,
                              fontSize: 11,
                            ),
                          )
                        : Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                appt.isAllDay
                                    ? 'Todo el día'
                                    : '$startHM–$endHM',
                                maxLines: 1,
                                overflow: TextOverflow.fade,
                                style: TextStyle(
                                  color: fg, // 👈
                                  fontWeight: FontWeight.w700,
                                  fontSize: 11,
                                ),
                              ),
                              Text(
                                appt.subject,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: fg, // 👈
                                  fontWeight: FontWeight.w600,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
              );
            }
          },

          // Taps
          onTap: _handleTap,
          onLongPress: _handleLongPress,
        );
      },
    );
  }

  void applyOrientationPolicy() {
    if (_view == CalendarView.month) {
      // Bloquea rotación: solo vertical (portrait up)
      SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    } else {
      // Restaura rotación libre para otras vistas del calendario
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.portraitUp,
        DeviceOrientation.portraitDown,
        DeviceOrientation.landscapeLeft,
        DeviceOrientation.landscapeRight,
      ]);
    }
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
      // final initial =
      //     (_view == CalendarView.month || _view == CalendarView.schedule)
      //     ? DateTime(base.year, base.month, base.day, 9, 0)
      //     : base;
      // _openAddEventSheet(initialDate: initial);
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

                if (!context.mounted) return;
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
                  if (!end.isAfter(start)) {
                    end = start.add(const Duration(hours: 1));
                  }
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
                if (!context.mounted) return;

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
                          child: DateTimeTile(
                            label: 'Inicio',
                            value: DateFormat(
                              'EEE d MMM, HH:mm',
                              'es',
                            ).format(start),
                            onTap: pickStart,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: DateTimeTile(
                            label: 'Fin',
                            value: DateFormat(
                              'EEE d MMM, HH:mm',
                              'es',
                            ).format(end),
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
                            if (email.isNotEmpty && !isValidEmail(email)) {
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
                              dni: dni,
                              email: email,
                              phone: phone,
                            );

                            if (!ok) {
                              _showSnack('No se pudo crear la reserva.');
                              return;
                            }
                            if (!context.mounted) return;
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
                const Spacer(),
                // 🟢 Botón de acción (al lado de Cerrar)
                FilledButton.icon(
                  onPressed: () {
                    // Cierra este sheet y abre el de creación usando la hora del evento
                  },
                  icon: const Icon(Icons.edit),
                  label: const Text('Accion'),
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
}

// DataSource simple
class _ReserveCalendarDataSource extends CalendarDataSource {
  _ReserveCalendarDataSource(List<Appointment> appts) {
    appointments = appts;
  }

  @override
  Color getColor(int index) {
    final Appointment appt = appointments![index] as Appointment;
    final Color bg =
        (appt.color == null || appt.color == Colors.transparent)
            ? ApptPalette.infoBg
            : appt.color!;

    // The month-view indicator is a small dot that easily fades when using the
    // pastel background colors of the appointments.  Instead, map the bg to a
    // stronger foreground color so the indicator matches the appointment
    // builder's palette.
    return fixedFgForBg(bg);
  }
}
