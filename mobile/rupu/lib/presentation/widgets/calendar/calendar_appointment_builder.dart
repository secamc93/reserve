import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

// Builder minimalista y seguro para todas las vistas.
// Llama esto desde `appointmentBuilder` del SfCalendar.
Widget buildCalendarAppointment(
  BuildContext ctx,
  CalendarAppointmentDetails details,
  CalendarView currentView,
) {
  final appt = details.appointments.first as Appointment;
  final isMonth = currentView == CalendarView.month;
  final startHM = DateFormat('HH:mm', 'es').format(appt.startTime);
  final endHM = DateFormat('HH:mm', 'es').format(appt.endTime);
  final bg = appt.color;

  final r = details.bounds;
  final w = r.width;
  final h = r.height;
  final safeRadius = (h / 2 - 1).clamp(4.0, 10.0);

  if (isMonth) {
    final tiny = w < 86;
    final compact = w < 120;
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
                    minHeight: 22,
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
}
