// presentation/views/calendar/calendar_view_reserve.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

import 'package:rupu/config/helpers/calendar_helper.dart';
import 'package:rupu/presentation/views/profile/perfil_controller.dart';
import 'package:rupu/presentation/views/reserve/controllers/reserves_controller.dart';
import 'package:rupu/presentation/views/reserve/views/update_reserve_view.dart';
import 'package:rupu/presentation/views/reserve/controllers/reserve_calendar_controller.dart';

import '../widgets/calendar_compact_toolbar.dart';
import '../widgets/reserve_calendar.dart';
import '../widgets/add_event_sheet.dart';
import '../widgets/appointment_detail_sheet.dart';
import '../widgets/sheets.dart';

class CalendarViewReserve extends StatelessWidget {
  CalendarViewReserve({super.key, required this.pageIndex});
  static const name = 'calendar';
  final int pageIndex;

  final ReserveCalendarController calendarController =
      Get.isRegistered<ReserveCalendarController>()
          ? Get.find<ReserveCalendarController>()
          : Get.put(ReserveCalendarController());

  @override
  Widget build(BuildContext context) {
    final reserve = Get.isRegistered<ReserveController>()
        ? Get.find<ReserveController>()
        : Get.put(ReserveController());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Calendario'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Obx(() {
          final appts = toAppointments(reserve.reservasTodas);
          final merged = [...appts, ...calendarController.localEvents];

          return Stack(
            children: [
              Column(
                children: [
                  Obx(() => CalendarCompactToolbar(
                        currentView: calendarController.view.value,
                        onChangeView: calendarController.changeView,
                        onToday: calendarController.goToday,
                        onPrev: calendarController.goPrev,
                        onNext: calendarController.goNext,
                      )),
                  Expanded(
                    child: Obx(() => ReserveCalendar(
                          controller: calendarController.calendar,
                          view: calendarController.view.value,
                          appointments: merged,
                          onTap: (d) => _handleTap(context, d),
                          onLongPress: (d) => _handleLongPress(context, d),
                        )),
                  ),
                ],
              ),

              Positioned(
                right: 16,
                bottom: 16,
                child: FloatingActionButton.extended(
                  onPressed: () {
                    final base = calendarController.calendar.displayDate ??
                        DateTime.now();
                    final initial =
                        DateTime(base.year, base.month, base.day, 9);
                    _openAddEventSheet(context, initialDate: initial);
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('Agregar'),
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  // ──────────────────────────── Handlers ────────────────────────────
  void _handleTap(BuildContext context, CalendarTapDetails d) {
    if (d.targetElement == CalendarElement.appointment &&
        (d.appointments?.isNotEmpty ?? false)) {
      final appt = d.appointments!.first as Appointment;
      _showAppointmentSheet(context, appt);
      return;
    }

    if (d.targetElement == CalendarElement.calendarCell) {
      final tapped = d.date ?? DateTime.now();
      final base = DateTime(tapped.year, tapped.month, tapped.day, tapped.hour);
      if (_isPastDate(base)) {
        _showSnack(context, 'No puedes crear eventos en fechas pasadas.');
        return;
      }
      // Si quieres, puedes habilitar creación con tap corto aquí.
    }
  }

  void _handleLongPress(BuildContext context, CalendarLongPressDetails d) {
    final pressed = d.date ?? DateTime.now();
    final base = DateTime(
      pressed.year,
      pressed.month,
      pressed.day,
      pressed.hour,
    );
    if (_isPastDate(base)) {
      _showSnack(context, 'No puedes crear eventos en fechas pasadas.');
      return;
    }
    final initial = (calendarController.view.value == CalendarView.month ||
            calendarController.view.value == CalendarView.schedule)
        ? DateTime(base.year, base.month, base.day, 9, 0)
        : base;
    _openAddEventSheet(context, initialDate: initial);
  }

  // ────────────────────── Hojas (sheets) & acciones ──────────────────────
  Future<void> _openAddEventSheet(BuildContext context,
      {required DateTime initialDate}) async {
    await showAddEventSheet(
      context: context,
      initialDate: initialDate,
      onSubmit:
          ({
            required String name,
            required String dni,
            required String email,
            required String phone,
            required int guests,
            required DateTime start,
            required DateTime end,
            String? notes,
          }) async {
            Get.put(PerfilController());
            final perfil = Get.find<PerfilController>();
            final businessId = perfil.businessId;

            final reserveCtrl = Get.isRegistered<ReserveController>()
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
              _showSnack(context, 'No se pudo crear la reserva.');
              return false;
            }
            _showSnack(context, 'Evento creado');
            return true;
          },
    );
  }

  void _showAppointmentSheet(BuildContext context, Appointment appt) {
    showAppointmentDetailSheet(
      context: context,
      appt: appt,
      pageIndex: pageIndex,
      onEdit: () {
        context.pushNamed(
          UpdateReserveView.name,
          pathParameters: {'page': '$pageIndex', 'id': '${appt.id}'},
        );
      },
      onCancel: () async => _cancelFromCalendar(context, appt.id as int),
      onCheckIn: () async => _checkInFromCalendar(context, appt.id as int),
    );
  }

  Future<void> _cancelFromCalendar(BuildContext context, int id) async {
    final reserveCtrl = Get.isRegistered<ReserveController>()
        ? Get.find<ReserveController>()
        : Get.put(ReserveController());

    // Motivo en hoja modal
    final reason = await showCancelReasonSheet(context);
    if (reason == null) return;

    final ok = await reserveCtrl.cancelarReserva(
      id: id,
      reason: reason.trim().isEmpty ? null : reason.trim(),
    );

    if (!ok) {
      _showSnack(context, 'No se pudo cancelar la reserva.');
      return;
    }
    await showCancelledSheet(context);
    await reserveCtrl.cargarReservasHoy(silent: true);
    await reserveCtrl.cargarReservasTodas(silent: true);
  }

  Future<void> _checkInFromCalendar(BuildContext context, int id) async {
    final reserveCtrl = Get.isRegistered<ReserveController>()
        ? Get.find<ReserveController>()
        : Get.put(ReserveController());

    final confirm = await showConfirmCheckInSheet(context);
    if (confirm != true) return;

    final ok = await reserveCtrl.checkInReserva(id: id);
    if (!ok) {
      _showSnack(context, 'No se pudo confirmar la reserva.');
      return;
    }
    await showCheckInSheet(context);
    await reserveCtrl.cargarReservasHoy(silent: true);
    await reserveCtrl.cargarReservasTodas(silent: true);
  }

  // ─────────────────────────── Utilidades ───────────────────────────
  bool _isPastDate(DateTime dt) {
    final now = DateTime.now();
    final today0 = DateTime(now.year, now.month, now.day);
    final d0 = DateTime(dt.year, dt.month, dt.day);
    return d0.isBefore(today0);
  }

  void _showSnack(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }
}
