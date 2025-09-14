// presentation/views/calendar/widgets/calendar_compact_toolbar.dart
import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';
import 'package:rupu/config/helpers/calendar_helper.dart';

class CalendarCompactToolbar extends StatelessWidget {
  const CalendarCompactToolbar({
    super.key,
    required this.currentView,
    required this.onChangeView,
    required this.onToday,
    required this.onPrev,
    required this.onNext,
  });

  final CalendarView currentView;
  final ValueChanged<CalendarView> onChangeView;
  final VoidCallback onToday;
  final VoidCallback onPrev;
  final VoidCallback onNext;

  static const _views = <CalendarView>[
    CalendarView.month,
    CalendarView.week,
    CalendarView.workWeek,
    CalendarView.day,
    CalendarView.schedule,
  ];

  @override
  Widget build(BuildContext context) {
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
            onSelected: onChangeView,
            itemBuilder: (_) => _views
                .map((v) => PopupMenuItem(value: v, child: Text(labelFor(v))))
                .toList(),
            child: Row(
              children: [
                Icon(viewIcon(currentView), color: cs.onSurfaceVariant),
                const SizedBox(width: 6),
                Text(
                  labelFor(currentView),
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
