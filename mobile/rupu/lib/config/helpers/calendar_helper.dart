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
      id: r.reservaId,
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
  if (s.contains('confirm')) return Colors.blue;
  if (s.contains('pend')) return Colors.amber;
  if (s.contains('pag')) return Colors.grey;
  if (s.contains('completada')) return Colors.green;
  if (s.contains('cancelada')) return Colors.red;

  return Colors.grey;
}

bool isValidEmail(String email) {
  // Validador simple/robusto suficiente para UI
  final re = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
  return re.hasMatch(email);
}

// ——— Estado → tono
enum _Tone { success, warning, danger, info }

_Tone toneFor(String raw) {
  final s = raw.toLowerCase();
  if (s.contains('confirm')) return _Tone.info;
  if (s.contains('pend')) return _Tone.warning;
  if (s.contains('cancel')) return _Tone.danger;
  if (s.contains('complet')) return _Tone.success;
  return _Tone.info;
}

String normalizeStatus(String raw) {
  final s = raw.toLowerCase();
  if (s.contains('confirm')) return 'Confirmada';
  if (s.contains('pend')) return 'Pendiente';
  if (s.contains('pag')) return 'Pagada';
  if (s.contains('cancel')) return 'Cancelada';
  return raw.isEmpty ? 'Pendiente' : raw;
}

// ——— Subject parser "Cliente • Estado"
(String, String) parseSubject(String subject) {
  final parts = subject.split('•');
  final cliente = parts.isNotEmpty ? parts.first.trim() : 'Cliente';
  final estado = parts.length > 1 ? parts[1].trim() : '';
  return (cliente, estado);
}

String safeInitial(String name) {
  final t = name.trim();
  return t.isEmpty ? '•' : t.characters.first.toUpperCase();
}

// ——— Notes parser "Negocio: X • Mesa: Y • Tel: Z"
class _Meta {
  final String? negocio;
  final String? mesa;
  final String? tel;
  const _Meta({this.negocio, this.mesa, this.tel});
}

_Meta parseNotes(String notes) {
  String? negocio, mesa, tel;
  for (final raw in notes.split('•')) {
    final s = raw.trim();
    if (s.toLowerCase().startsWith('negocio:')) {
      negocio = s.substring(8).trim();
    } else if (s.toLowerCase().startsWith('mesa:')) {
      mesa = s.substring(5).trim();
    } else if (s.toLowerCase().startsWith('tel:')) {
      tel = s.substring(4).trim();
    }
  }
  return _Meta(negocio: negocio, mesa: mesa, tel: tel);
}

// ——— Pill de estado suave
class SoftStatusPill extends StatelessWidget {
  const SoftStatusPill({required this.text, required this.tone});
  final String text;
  final _Tone tone;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    Color fg;
    switch (tone) {
      case _Tone.success:
        fg = const Color(0xFF0F5132);
        break;
      case _Tone.warning:
        fg = const Color(0xFF7A4F01);
        break;
      case _Tone.danger:
        fg = cs.error;
        break;
      case _Tone.info:
        fg = const Color(0xFF084298);
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: ShapeDecoration(
        color: fg.withOpacity(.12),
        shape: StadiumBorder(side: BorderSide(color: fg.withOpacity(.22))),
      ),
      child: Text(
        text,
        style: TextStyle(fontWeight: FontWeight.w800, color: fg, fontSize: 12),
      ),
    );
  }
}

// ——— Chip con icono (fecha/hora/mesa)
class IconChip extends StatelessWidget {
  const IconChip({required this.icon, required this.label});
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

// ——— Avatar con inicial
class InitialAvatar extends StatelessWidget {
  const InitialAvatar({required this.initial, this.size = 48});
  final String initial;
  final double size;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
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
        border: Border.all(color: Colors.white.withOpacity(.95), width: 3),
        boxShadow: [
          BoxShadow(
            color: cs.primary.withOpacity(.20),
            blurRadius: 10,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      alignment: Alignment.center,
      child: Text(
        initial,
        style: Theme.of(context).textTheme.titleMedium!.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w900,
          fontSize: 18,
        ),
      ),
    );
  }
}
