// presentation/views/calendar/calendar_view_reserve.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:rupu/config/helpers/calendar_helper.dart';
import 'package:rupu/presentation/views/profile/perfil_controller.dart';
import 'package:rupu/presentation/views/reserve/data_time_tile.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

import 'package:rupu/presentation/views/reserve/reserves_controller.dart';
import 'package:rupu/presentation/views/reserve/update_reserve_view.dart';

class CalendarViewReserve extends StatefulWidget {
  const CalendarViewReserve({super.key, required this.pageIndex});
  static const name = 'calendar';
  final int pageIndex;

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

    // Asegura tener TODAS las reservas para el calendario
    final reserve = Get.isRegistered<ReserveController>()
        ? Get.find<ReserveController>()
        : Get.put(ReserveController());

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (reserve.reservasTodas.isEmpty) {
        reserve.cargarReservasTodas(silent: true);
      }
    });
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

  Future<void> _cancelFromCalendar(int id) async {
    final reserveCtrl = Get.isRegistered<ReserveController>()
        ? Get.find<ReserveController>()
        : Get.put(ReserveController());

    final reason = await showModalBottomSheet<String>(
      context: context,
      useSafeArea: true,
      isScrollControlled: true,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
      ),
      builder: (ctx) {
        final cs = Theme.of(ctx).colorScheme;
        final reasonCtrl = TextEditingController();
        return Padding(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: 10,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 16,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          cs.error.withValues(alpha: .12),
                          cs.errorContainer.withValues(alpha: .10),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.cancel_outlined, color: cs.error),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Cancelar reserva',
                    style: Theme.of(ctx).textTheme.titleMedium!.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                '¿Deseas cancelar esta reserva? Puedes indicar un motivo (opcional).',
                style: Theme.of(
                  ctx,
                ).textTheme.bodyMedium!.copyWith(color: cs.onSurfaceVariant),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: reasonCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Motivo (opcional)',
                  hintText: 'Ej: cliente no podrá asistir',
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  OutlinedButton(
                    onPressed: () => Navigator.of(ctx).pop(null),
                    child: const Text('Volver'),
                  ),
                  const Spacer(),
                  FilledButton.tonal(
                    style: FilledButton.styleFrom(
                      foregroundColor: cs.error,
                      backgroundColor: cs.error.withValues(alpha: .08),
                    ),
                    onPressed: () => Navigator.of(ctx).pop(reasonCtrl.text),
                    child: const Text('Confirmar cancelación'),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );

    if (reason == null) return;

    final ok = await reserveCtrl.cancelarReserva(
      id: id,
      reason: reason.trim().isEmpty ? null : reason.trim(),
    );

    if (!ok) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No se pudo cancelar la reserva.')),
      );
      return;
    }
    if (!mounted) return;
    await showCancelledSheet(context);

    // Refresca lista de hoy y calendario
    await reserveCtrl.cargarReservasHoy(silent: true);
    await reserveCtrl.cargarReservasTodas(silent: true);
  }

  Future<void> _checkInFromCalendar(int id) async {
    final reserveCtrl = Get.isRegistered<ReserveController>()
        ? Get.find<ReserveController>()
        : Get.put(ReserveController());

    final confirm = await showModalBottomSheet<bool>(
      context: context,
      useSafeArea: true,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
      ),
      builder: (ctx) {
        final cs = Theme.of(ctx).colorScheme;
        return Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          cs.primary.withValues(alpha: .12),
                          cs.primaryContainer.withValues(alpha: .10),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.how_to_reg, color: cs.primary),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Confirmar check-in',
                    style: Theme.of(ctx).textTheme.titleMedium!.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                '¿Deseas marcar esta reserva como confirmada?',
                style: Theme.of(
                  ctx,
                ).textTheme.bodyMedium!.copyWith(color: cs.onSurfaceVariant),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  OutlinedButton(
                    onPressed: () => Navigator.of(ctx).pop(false),
                    child: const Text('Volver'),
                  ),
                  const Spacer(),
                  FilledButton.tonal(
                    style: FilledButton.styleFrom(
                      foregroundColor: cs.primary,
                      backgroundColor: cs.primary.withValues(alpha: .08),
                    ),
                    onPressed: () => Navigator.of(ctx).pop(true),
                    child: const Text('Confirmar'),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );

    if (confirm != true) return;

    final ok = await reserveCtrl.checkInReserva(id: id);

    if (!ok) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No se pudo confirmar la reserva.')),
      );
      return;
    }
    if (!mounted) return;
    await showCheckInSheet(context);

    await reserveCtrl.cargarReservasHoy(silent: true);
    await reserveCtrl.cargarReservasTodas(silent: true);
  }

  Future<void> showCheckInSheet(BuildContext context) async {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final tt = theme.textTheme;
    if (!context.mounted) return;
    await showModalBottomSheet(
      context: context,
      useSafeArea: true,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
      ),
      builder: (sheetCtx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundColor: cs.primaryContainer,
                    child: Icon(
                      Icons.check_rounded,
                      color: cs.onPrimaryContainer,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Check-in realizado',
                    style: tt.titleMedium!.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'La reserva se confirmó correctamente.',
                  style: tt.bodyMedium,
                ),
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () => Navigator.of(sheetCtx).pop(),
                child: const Text('Listo'),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> showCancelledSheet(BuildContext context) async {
    // Capturamos Theme y ColorScheme ANTES de cualquier await
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final tt = theme.textTheme;

    // Confirmamos que el contexto sigue montado
    if (!context.mounted) return;

    // Mostramos el bottom sheet (no usamos `context` luego del await en esta función)
    await showModalBottomSheet(
      context: context,
      useSafeArea: true,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
      ),
      builder: (sheetCtx) {
        // Usar `sheetCtx` DENTRO del builder está OK
        return Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundColor: cs.primaryContainer,
                    child: Icon(
                      Icons.check_rounded,
                      color: cs.onPrimaryContainer,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Reserva cancelada',
                    style: tt.titleMedium!.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'La reserva se canceló correctamente.',
                  style: tt.bodyMedium,
                ),
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () =>
                    Navigator.of(sheetCtx).pop(), // usar sheetCtx aquí
                child: const Text('Listo'),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final reserve = Get.isRegistered<ReserveController>()
        ? Get.find<ReserveController>()
        : Get.put(ReserveController());

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
    (context, details) {
      final appt = details.appointments.first as Appointment;

      // Mantén tu color de evento como fondo (amarillo)…
      final bg = appt.color;
      // …o usa un fondo más suave si prefieres (descomenta):
      // final bg = appt.color.withOpacity(0.18);

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: appt.color.withValues(alpha: .35)),
        ),
        child: Text(
          appt.subject,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Colors.black, // <-- TEXTO EN NEGRO
            fontWeight: FontWeight.w600,
            fontSize: 12,
          ),
        ),
      );
    };

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
            final bg = appt.color;

            // Bounds reales del slot (clave para evitar overflow)
            final r = details.bounds;
            final w = r.width;
            final h = r.height;

            // Radio seguro según altura real del slot
            final safeRadius = (h / 2 - 1).clamp(4.0, 10.0);
            final tiny = w < 86; // muy angosto
            final compact = w < 120; // teléfono normal

            if (isMonth) {
              // MONTH: chip de hora (o punto si no hay espacio) + nombre en 1 línea
              return SizedBox(
                width: w,
                height: h, // ← nos ajustamos al alto exacto del slot
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(safeRadius),
                  child: Container(
                    color: bg,
                    // sin padding vertical para no exceder el alto
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
                              color: Colors.black.withValues(alpha: .08),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: FittedBox(
                              fit: BoxFit.scaleDown,
                              child: Column(
                                children: [
                                  Text(
                                    appt.isAllDay ? 'día' : startHM,
                                    maxLines: 1,
                                    style: const TextStyle(
                                      color: Colors.black,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 10,
                                    ),
                                  ),
                                  Text(
                                    appt.isAllDay ? 'día' : endHM,
                                    maxLines: 1,
                                    style: const TextStyle(
                                      color: Colors.black,
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
                            decoration: const BoxDecoration(
                              color: Colors.black,
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
                              color: Colors.black,
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
              // DAY/WEEK/WORKWEEK/SCHEDULE (Agenda)
              // Si el slot es bajo, colapsa a 1 línea para evitar overflow
              final collapse = h < 28;

              return SizedBox(
                width: w,
                height: h, // ← altura exacta del item de agenda/tiempo
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(safeRadius),
                  child: Container(
                    color: bg,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                    ), // sin padding vertical
                    alignment: Alignment.centerLeft,
                    child: collapse
                        ? Text(
                            appt.isAllDay
                                ? 'Todo el día · ${appt.subject}'
                                : '$startHM–$endHM  ${appt.subject}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.black,
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
                                style: const TextStyle(
                                  color: Colors.black,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 11,
                                ),
                              ),
                              Text(
                                appt.subject,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: Colors.black,
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
    // subject viene como: "Cliente • Estado" (según tu mapper)
    final (cliente, estado) = parseSubject(appt.subject);
    final isCancelled = estado.toLowerCase().contains('cancel');
    final tone = toneFor(estado);

    // notas: "Negocio: X • Mesa: Y • Tel: Z"  (según tu mapper)
    final meta = parseNotes(appt.notes ?? '');

    final locale = 'es';
    final day = DateFormat('EEE d MMM', locale).format(appt.startTime);
    final startHM = DateFormat('HH:mm', locale).format(appt.startTime);
    final endHM = DateFormat('HH:mm', locale).format(appt.endTime);

    showModalBottomSheet(
      context: context,
      useSafeArea: true,
      showDragHandle: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        final cs = Theme.of(ctx).colorScheme;
        final tt = Theme.of(ctx).textTheme;

        return Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ——— Header: avatar + nombre + pill estado
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  InitialAvatar(initial: safeInitial(cliente), size: 44),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      '$cliente • ${estado.isEmpty ? "Pendiente" : estado}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: tt.titleMedium!.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  SoftStatusPill(text: normalizeStatus(estado), tone: tone),
                ],
              ),
              const SizedBox(height: 12),
              // ——— Fecha y hora (chips)
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  IconChip(icon: Icons.event_outlined, label: day),
                  IconChip(icon: Icons.schedule, label: '$startHM – $endHM'),
                  if (meta.mesa != null && meta.mesa!.isNotEmpty)
                    IconChip(
                      icon: Icons.table_bar_outlined,
                      label: 'Mesa ${meta.mesa}',
                    ),
                ],
              ),
              const SizedBox(height: 10),
              // ——— Info negocio / contacto
              if ((meta.negocio ?? '').isNotEmpty ||
                  (meta.tel ?? '').isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text(
                    [
                      if ((meta.negocio ?? '').isNotEmpty)
                        'Negocio: ${meta.negocio}',
                      if ((meta.tel ?? '').isNotEmpty) 'Tel: ${meta.tel}',
                    ].join('   •   '),
                    style: tt.bodyMedium!.copyWith(
                      color: cs.onSurfaceVariant,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              const SizedBox(height: 16),
              const Divider(height: 1),
              const SizedBox(height: 12),
              // ——— Acciones (prioridad: Check-in > Cancelar > Editar > Cerrar)
              Wrap(
                spacing: 10,
                runSpacing: 10,
                alignment: WrapAlignment.end,
                children: [
                  // Cerrar
                  OutlinedButton(
                    onPressed: () => Navigator.of(ctx).pop(),
                    child: const Text('Cerrar'),
                  ),
                  // Check-in (primaria)
                  FilledButton.icon(
                    onPressed: isCancelled
                        ? null
                        : () async {
                            Navigator.of(ctx).pop(); // cierra primero
                            await _checkInFromCalendar(appt.id as int);
                          },
                    icon: const Icon(Icons.how_to_reg_outlined),
                    label: const Text('Check-in'),
                  ),
                  // Cancelar (destructive tonal)
                  FilledButton.tonalIcon(
                    icon: const Icon(Icons.cancel_outlined),
                    label: const Text('Cancelar'),
                    style: FilledButton.styleFrom(
                      foregroundColor: cs.error,
                      backgroundColor: cs.error.withOpacity(.10),
                    ),
                    onPressed: isCancelled
                        ? null
                        : () async {
                            Navigator.of(ctx).pop(); // cierra primero
                            await _cancelFromCalendar(appt.id as int);
                          },
                  ),
                  // Editar (suave, secundario)
                  FilledButton.tonalIcon(
                    onPressed: isCancelled
                        ? null
                        : () {
                            Navigator.of(ctx).pop();
                            context.pushNamed(
                              UpdateReserveView.name,
                              pathParameters: {
                                'page': '${widget.pageIndex}',
                                'id': '${appt.id}',
                              },
                            );
                          },
                    icon: const Icon(Icons.edit_outlined),
                    label: const Text('Editar'),
                  ),
                ],
              ),
            ],
          ),
        );
      },
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
}
