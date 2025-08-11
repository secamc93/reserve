// presentation/views/calendar/calendar_view_reserve.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/presentation/views/reserve/reserves_controller.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';
import 'package:rupu/domain/entities/reserve.dart';

class CalendarViewReserve extends StatefulWidget {
  const CalendarViewReserve({super.key});
  static const name = 'calendar';

  @override
  State<CalendarViewReserve> createState() => _CalendarViewReserveState();
}

class _CalendarViewReserveState extends State<CalendarViewReserve> {
  final calCtrl = CalendarController();
  CalendarView _view = CalendarView.month;

  // Puedes ajustar las opciones que quieras mostrar
  final _views = const <CalendarView>[
    CalendarView.month,
    CalendarView.week,
    CalendarView.workWeek,
    CalendarView.day,
    CalendarView.schedule,
    CalendarView.timelineWeek,
  ];

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
    // Si no está registrado por la ruta, puedes hacer fallback:
    final reserve = Get.isRegistered<ReserveController>()
        ? Get.find<ReserveController>()
        : Get.put(ReserveController());

    return SafeArea(
      child: Column(
        children: [
          // ── Barra de controles (cambia de vista)
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
            child: Row(
              children: [
                DropdownButton<CalendarView>(
                  value: _view,
                  onChanged: (v) {
                    if (v == null) return;
                    setState(() {
                      _view = v;
                      calCtrl.view = v;
                    });
                  },
                  items: _views
                      .map(
                        (v) => DropdownMenuItem(
                          value: v,
                          child: Text(_labelFor(v)),
                        ),
                      )
                      .toList(),
                ),
                const Spacer(),
                // Navegación básica (opcional): hoy / atrás / adelante
                IconButton(
                  tooltip: 'Hoy',
                  onPressed: () {
                    final now = DateTime.now();
                    calCtrl.displayDate = DateTime(
                      now.year,
                      now.month,
                      now.day,
                    );
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
          ),

          // ── Calendario (reactivo a reservas)
          Expanded(
            child: Obx(() {
              final appts = _toAppointments(reserve.reservas);
              return SfCalendar(
                controller: calCtrl,
                view: _view,
                dataSource: _ReserveCalendarDataSource(appts),
                firstDayOfWeek: DateTime.monday,
                timeSlotViewSettings: const TimeSlotViewSettings(
                  startHour: 6,
                  endHour: 22,
                  nonWorkingDays: <int>[DateTime.sunday],
                ),
                monthViewSettings: const MonthViewSettings(
                  appointmentDisplayMode:
                      MonthAppointmentDisplayMode.appointment,
                  showAgenda: true,
                ),
                showDatePickerButton: false,
                allowViewNavigation: true,
              );
            }),
          ),
        ],
      ),
    );
  }

  // ───────────────────────── helpers ─────────────────────────

  // String _labelFor(CalendarView v) {
  //   switch (v) {
  //     case CalendarView.month:
  //       return 'Month';
  //     case CalendarView.week:
  //       return 'Week';
  //     case CalendarView.workWeek:
  //       return 'Work week';
  //     case CalendarView.day:
  //       return 'Day';
  //     case CalendarView.schedule:
  //       return 'Schedule';
  //     case CalendarView.timelineWeek:
  //       return 'Timeline week';
  //     default:
  //       return v.toString();
  //   }
  // }

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
      case CalendarView.timelineWeek:
        return 'Cronología semanal';
      default:
        return v.toString();
    }
  }

  DateTime _stepBack(DateTime d, CalendarView v) {
    switch (v) {
      case CalendarView.day:
        return d.subtract(const Duration(days: 1));
      case CalendarView.week:
      case CalendarView.workWeek:
      case CalendarView.timelineWeek:
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
      case CalendarView.timelineWeek:
        return d.add(const Duration(days: 7));
      case CalendarView.month:
      case CalendarView.schedule:
      default:
        return DateTime(d.year, d.month + 1, d.day);
    }
  }

  List<Appointment> _toAppointments(List<Reserve> reservas) {
    // Orden opcional antes de pintar (más viejo -> más nuevo)
    reservas = [...reservas];
    reservas.sort((a, b) {
      final da = _parseDate(a.startAt) ?? DateTime(9999);
      final db = _parseDate(b.startAt) ?? DateTime(9999);
      final c = da.compareTo(db);
      if (c != 0) return c;
      final ea = _parseDate(a.endAt) ?? da;
      final eb = _parseDate(b.endAt) ?? db;
      return ea.compareTo(eb);
    });

    return reservas.map((r) {
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
        // id: r.reservaId,   // si quieres usarlo
        // isAllDay: false,
        // location: r.negocioNombre,
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
}

// DataSource simple porque ya pasamos Appointment list
class _ReserveCalendarDataSource extends CalendarDataSource {
  _ReserveCalendarDataSource(List<Appointment> appts) {
    appointments = appts;
  }
}
