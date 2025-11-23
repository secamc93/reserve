import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:rupu/config/helpers/calendar_helper.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

import 'package:rupu/presentation/views/reserve/controllers/reserves_controller.dart';

class ReserveCalendarController extends GetxController {
  final calendar = CalendarController();
  final view = CalendarView.month.obs;
  final localEvents = <Appointment>[].obs;

  @override
  void onReady() {
    super.onReady();
    _applyOrientationPolicy(view.value);

    final reserve = Get.isRegistered<ReserveController>()
        ? Get.find<ReserveController>()
        : Get.put(ReserveController());
    if (reserve.reservasTodas.isEmpty) {
      reserve.cargarReservasTodas(silent: true);
    }
  }

  void changeView(CalendarView v) {
    view.value = v;
    calendar.view = v;
    _applyOrientationPolicy(v);
  }

  void goToday() {
    final now = DateTime.now();
    calendar.displayDate = DateTime(now.year, now.month, now.day);
  }

  void goPrev() {
    final d = calendar.displayDate ?? DateTime.now();
    calendar.displayDate = stepBack(d, view.value);
  }

  void goNext() {
    final d = calendar.displayDate ?? DateTime.now();
    calendar.displayDate = stepForward(d, view.value);
  }

  void addLocal(Appointment appt) {
    localEvents.add(appt);
  }

  @override
  void onClose() {
    calendar.dispose();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    super.onClose();
  }

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
}
