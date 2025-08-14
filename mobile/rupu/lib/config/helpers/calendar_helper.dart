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

class ApptPalette {
  // Info (azul suave)
  static const infoBg = Color(0xFFE7F1FF);
  static const infoFg = Color(0xFF084298);

  // Success (verde suave)
  static const successBg = Color(0xFFE6F4EA);
  static const successFg = Color(0xFF0F5132);

  // Warning (ámbar suave)
  static const warningBg = Color(0xFFFFF4E5);
  static const warningFg = Color(0xFF7A4F01);

  // Danger (rojo suave) - por si lo usas
  static const dangerBg = Color(0xFFFFE5E5);
  static const dangerFg = Color(0xFF842029);

  // Neutro
  static const neutralBg = Color(0xFFEDEDED);
  static const neutralFg = Color(0xFF222222);
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
    Color colorForEstado(String estado) {
      final s = estado.toLowerCase();
      if (s.contains('confirm')) return ApptPalette.successBg;
      if (s.contains('pend')) return ApptPalette.warningBg;
      if (s.contains('pag')) return ApptPalette.infoBg;
      return ApptPalette.neutralBg;
    }

    final start = _parseDate(r.startAt) ?? DateTime.now();
    final end = _parseDate(r.endAt) ?? start.add(const Duration(hours: 1));
    final subject = _subjectFor(r);
    final notes = _notesFor(r);
    final color = colorForEstado(r.estadoNombre);
    return Appointment(
      startTime: start,
      endTime: end,
      subject: subject,
      notes: notes,
      color: color,
    );
  }).toList();
}

Color fixedFgForBg(Color bg) {
  if (bg.value == ApptPalette.successBg.value) return ApptPalette.successFg;
  if (bg.value == ApptPalette.warningBg.value) return ApptPalette.warningFg;
  if (bg.value == ApptPalette.infoBg.value) return ApptPalette.infoFg;
  if (bg.value == ApptPalette.dangerBg.value) return ApptPalette.dangerFg;
  // fallback por contraste:
  return (bg.computeLuminance() < 0.6) ? Colors.white : ApptPalette.neutralFg;
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

bool isValidEmail(String email) {
  // Validador simple/robusto suficiente para UI
  final re = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
  return re.hasMatch(email);
}
