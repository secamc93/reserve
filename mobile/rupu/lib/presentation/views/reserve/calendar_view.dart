// presentation/views/calendar/calendar_view_reserve.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

import 'package:rupu/config/helpers/calendar_helper.dart';
import 'package:rupu/presentation/views/profile/perfil_controller.dart';
import 'package:rupu/presentation/views/reserve/reserves_controller.dart';
import 'package:rupu/presentation/views/reserve/update_reserve_view.dart';

import 'widgets/calendar_compact_toolbar.dart';
import 'widgets/reserve_calendar.dart';
import 'widgets/add_event_sheet.dart';
import 'widgets/appointment_detail_sheet.dart';
import 'widgets/sheets.dart';

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

  // Eventos creados localmente (además de los traídos del controller)
  final List<Appointment> _localEvents = [];

  @override
  void initState() {
    super.initState();
    calCtrl.view = _view;
    _applyOrientationPolicy(_view);

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
    // Restablece todas las orientaciones
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    super.dispose();
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
                CalendarCompactToolbar(
                  currentView: _view,
                  onChangeView: (v) {
                    setState(() {
                      _view = v;
                      calCtrl.view = v;
                      _applyOrientationPolicy(v);
                    });
                  },
                  onToday: () {
                    final now = DateTime.now();
                    calCtrl.displayDate = DateTime(
                      now.year,
                      now.month,
                      now.day,
                    );
                  },
                  onPrev: () {
                    final d = calCtrl.displayDate ?? DateTime.now();
                    calCtrl.displayDate = stepBack(d, _view);
                  },
                  onNext: () {
                    final d = calCtrl.displayDate ?? DateTime.now();
                    calCtrl.displayDate = stepForward(d, _view);
                  },
                ),
                Expanded(
                  child: ReserveCalendar(
                    controller: calCtrl,
                    view: _view,
                    appointments: merged,
                    onTap: _handleTap,
                    onLongPress: _handleLongPress,
                  ),
                ),
              ],
            ),

            // FAB agregar desde la fecha visible
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

  // ──────────────────────────── Handlers ────────────────────────────
  void _handleTap(CalendarTapDetails d) {
    if (d.targetElement == CalendarElement.appointment &&
        (d.appointments?.isNotEmpty ?? false)) {
      final appt = d.appointments!.first as Appointment;
      _showAppointmentSheet(appt);
      return;
    }

    if (d.targetElement == CalendarElement.calendarCell) {
      final tapped = d.date ?? DateTime.now();
      final base = DateTime(tapped.year, tapped.month, tapped.day, tapped.hour);
      if (_isPastDate(base)) {
        _showSnack('No puedes crear eventos en fechas pasadas.');
        return;
      }
      // Si quieres, puedes habilitar creación con tap corto aquí.
    }
  }

  void _handleLongPress(CalendarLongPressDetails d) {
    final pressed = d.date ?? DateTime.now();
    final base = DateTime(
      pressed.year,
      pressed.month,
      pressed.day,
      pressed.hour,
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

  // ────────────────────── Hojas (sheets) & acciones ──────────────────────
  Future<void> _openAddEventSheet({required DateTime initialDate}) async {
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
              _showSnack('No se pudo crear la reserva.');
              return false;
            }
            _showSnack('Evento creado');
            return true;
          },
    );
  }

  void _showAppointmentSheet(Appointment appt) {
    showAppointmentDetailSheet(
      context: context,
      appt: appt,
      pageIndex: widget.pageIndex,
      onEdit: () {
        context.pushNamed(
          UpdateReserveView.name,
          pathParameters: {'page': '${widget.pageIndex}', 'id': '${appt.id}'},
        );
      },
      onCancel: () async => _cancelFromCalendar(appt.id as int),
      onCheckIn: () async => _checkInFromCalendar(appt.id as int),
    );
  }

  Future<void> _cancelFromCalendar(int id) async {
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
      if (!mounted) return;
      _showSnack('No se pudo cancelar la reserva.');
      return;
    }
    if (!mounted) return;
    await showCancelledSheet(context);
    await reserveCtrl.cargarReservasHoy(silent: true);
    await reserveCtrl.cargarReservasTodas(silent: true);
  }

  Future<void> _checkInFromCalendar(int id) async {
    final reserveCtrl = Get.isRegistered<ReserveController>()
        ? Get.find<ReserveController>()
        : Get.put(ReserveController());

    final confirm = await showConfirmCheckInSheet(context);
    if (confirm != true) return;

    final ok = await reserveCtrl.checkInReserva(id: id);
    if (!ok) {
      if (!mounted) return;
      _showSnack('No se pudo confirmar la reserva.');
      return;
    }
    if (!mounted) return;
    await showCheckInSheet(context);
    await reserveCtrl.cargarReservasHoy(silent: true);
    await reserveCtrl.cargarReservasTodas(silent: true);
  }

  // ─────────────────────────── Utilidades ───────────────────────────
  void _applyOrientationPolicy(CalendarView v) {
    if (v == CalendarView.month) {
      SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    } else {
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.portraitUp,
        DeviceOrientation.portraitDown,
        DeviceOrientation.landscapeLeft,
        DeviceOrientation.landscapeRight,
      ]);
    }
  }

  bool _isPastDate(DateTime dt) {
    final now = DateTime.now();
    final today0 = DateTime(now.year, now.month, now.day);
    final d0 = DateTime(dt.year, dt.month, dt.day);
    return d0.isBefore(today0);
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }
}
