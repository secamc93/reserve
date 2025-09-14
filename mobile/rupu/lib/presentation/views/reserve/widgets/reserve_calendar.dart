// presentation/views/calendar/widgets/reserve_calendar.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

class ReserveCalendar extends StatelessWidget {
  const ReserveCalendar({
    super.key,
    required this.controller,
    required this.view,
    required this.appointments,
    required this.onTap,
    required this.onLongPress,
  });

  final CalendarController controller;
  final CalendarView view;
  final List<Appointment> appointments;
  final CalendarTapCallback onTap;
  final CalendarLongPressCallback onLongPress;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, c) {
        final size = MediaQuery.of(context).size;
        final orientation = MediaQuery.of(context).orientation;
        final maxH = c.maxHeight > 0 ? c.maxHeight : size.height;
        final isTimeView =
            view == CalendarView.day ||
            view == CalendarView.week ||
            view == CalendarView.workWeek;

        final slotHeight = (maxH / 12).clamp(40.0, 80.0).toDouble();
        final agendaHeight = (maxH * 0.28).clamp(120.0, 260.0).toDouble();

        final monthSettings = (view == CalendarView.month)
            ? MonthViewSettings(
                appointmentDisplayMode: MonthAppointmentDisplayMode.indicator,
                showAgenda: true,
                numberOfWeeksInView: 6,
                agendaViewHeight: agendaHeight,
                agendaStyle: const AgendaStyle(
                  appointmentTextStyle: TextStyle(color: Colors.black),
                ),
              )
            : const MonthViewSettings();

        return SfCalendar(
          key: ValueKey('$view-${orientation.name}'),
          controller: controller,
          view: view,
          dataSource: _ReserveCalendarDataSource(appointments),
          firstDayOfWeek: DateTime.monday,
          headerHeight: 48,
          headerStyle: const CalendarHeaderStyle(
            textAlign: TextAlign.center,
            textStyle: TextStyle(fontWeight: FontWeight.w800),
          ),
          viewHeaderStyle: const ViewHeaderStyle(
            dayTextStyle: TextStyle(fontWeight: FontWeight.w700),
          ),
          timeSlotViewSettings: TimeSlotViewSettings(
            startHour: 0,
            endHour: 24,
            timeIntervalHeight: isTimeView ? slotHeight : 52,
            nonWorkingDays: const <int>[DateTime.sunday],
          ),
          monthViewSettings: monthSettings,
          showDatePickerButton: false,
          allowViewNavigation: true,
          appointmentBuilder: _appointmentBuilder(view),
          onTap: onTap,
          onLongPress: onLongPress,
        );
      },
    );
  }

  CalendarAppointmentBuilder _appointmentBuilder(CalendarView v) {
    return (ctx, details) {
      final appt = details.appointments.first as Appointment;
      final isMonth = v == CalendarView.month;
      final locale = 'es';
      final startHM = DateFormat('HH:mm', locale).format(appt.startTime);
      final endHM = DateFormat('HH:mm', locale).format(appt.endTime);
      final bg = appt.color;

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
                        color: Colors.black.withOpacity(.08),
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
      }

      // Vistas Day/Week/WorkWeek/Schedule
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
                        appt.isAllDay ? 'Todo el día' : '$startHM–$endHM',
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
    };
  }
}

// DataSource simple
class _ReserveCalendarDataSource extends CalendarDataSource {
  _ReserveCalendarDataSource(List<Appointment> appts) {
    appointments = appts;
  }
}
