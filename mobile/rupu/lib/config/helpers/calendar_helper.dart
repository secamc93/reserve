import 'package:flutter/material.dart';
import 'package:rupu/domain/entities/reserve.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

String labelFor(CalendarView v) {
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

IconData viewIcon(CalendarView v) {
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

DateTime stepBack(DateTime d, CalendarView v) {
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

DateTime stepForward(DateTime d, CalendarView v) {
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

List<Appointment> toAppointments(List<Reserve> reservas) {
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
  if (s.contains('confirm')) return Colors.green;
  if (s.contains('pend')) return Colors.amber;
  if (s.contains('pag')) return Colors.grey;
  if (s.contains('completada')) return Colors.blue;
  if (s.contains('cancelada')) return Colors.red;

  return Colors.grey;
}

bool isValidEmail(String email) {
  // Validador simple/robusto suficiente para UI
  final re = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
  return re.hasMatch(email);
}
