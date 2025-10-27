import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

class CalendarCompactToolbar extends StatelessWidget {
  final CalendarController controller;
  final CalendarView view;
  final ValueChanged<CalendarView> onChangeView;
  final VoidCallback onToday;
  final VoidCallback onPrev;
  final VoidCallback onNext;

  const CalendarCompactToolbar({
    super.key,
    required this.controller,
    required this.view,
    required this.onChangeView,
    required this.onToday,
    required this.onPrev,
    required this.onNext,
  });

  static String labelFor(CalendarView v) {
    switch (v) {
      case CalendarView.month:
        return 'Mes';
      case CalendarView.week:
        return 'Semana';
      case CalendarView.workWeek:
        return 'Laboral';
      case CalendarView.day:
        return 'Día';
      case CalendarView.schedule:
        return 'Agenda';
      default:
        return 'Vista';
    }
  }

  static IconData iconFor(CalendarView v) {
    switch (v) {
      case CalendarView.month:
        return Icons.calendar_view_month;
      case CalendarView.week:
        return Icons.view_week;
      case CalendarView.workWeek:
        return Icons.work_history_outlined;
      case CalendarView.day:
        return Icons.view_day;
      case CalendarView.schedule:
        return Icons.view_agenda;
      default:
        return Icons.calendar_today;
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final now = controller.displayDate ?? DateTime.now();
    final title = DateFormat('MMMM yyyy', 'es').format(now);

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
            onSelected: onChangeView,
            itemBuilder: (_) =>
                const [
                      CalendarView.month,
                      CalendarView.week,
                      CalendarView.workWeek,
                      CalendarView.day,
                      CalendarView.schedule,
                    ]
                    .map(
                      (v) => PopupMenuItem(value: v, child: Text(labelFor(v))),
                    )
                    .toList(),
            child: Row(
              children: [
                Icon(iconFor(view), color: cs.onSurfaceVariant),
                const SizedBox(width: 6),
                Text(
                  labelFor(view),
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: cs.onSurface,
                  ),
                ),
                const Icon(Icons.expand_more, size: 18),
              ],
            ),
          ),
          const VerticalDivider(width: 16),
          Expanded(
            child: Text(
              title[0].toUpperCase() + title.substring(1),
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w800),
              textAlign: TextAlign.center,
            ),
          ),
          const Spacer(),
          IconButton(
            tooltip: 'Hoy',
            onPressed: onToday,
            icon: const Icon(Icons.today_outlined),
          ),
          IconButton(
            tooltip: 'Anterior',
            onPressed: onPrev,
            icon: const Icon(Icons.chevron_left),
          ),
          IconButton(
            tooltip: 'Siguiente',
            onPressed: onNext,
            icon: const Icon(Icons.chevron_right),
          ),
        ],
      ),
    );
  }
}
