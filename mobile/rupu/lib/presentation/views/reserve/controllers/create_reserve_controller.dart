import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:rupu/presentation/views/profile/perfil_controller.dart';
import 'package:rupu/presentation/views/reserve/controllers/reserves_controller.dart';

class CreateReserveController extends GetxController {
  final formKey = GlobalKey<FormState>();

  final nameCtrl = TextEditingController();
  final dniCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  final guestsCtrl = TextEditingController(text: '1');
  final notesCtrl = TextEditingController();

  final start = _todayAt(hour: 9).obs;
  final end = _todayAt(hour: 10).obs;
  final saving = false.obs;

  static DateTime _todayAt({required int hour, int minute = 0}) {
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day, hour, minute);
  }

  bool isPastDate(DateTime dt) {
    final today0 = DateTime(
      DateTime.now().year,
      DateTime.now().month,
      DateTime.now().day,
    );
    final d0 = DateTime(dt.year, dt.month, dt.day);
    return d0.isBefore(today0);
  }

  bool updateStart(DateTime value) {
    if (isPastDate(value)) return false;
    start.value = value;
    if (!end.value.isAfter(start.value)) {
      end.value = start.value.add(const Duration(hours: 1));
    }
    return true;
  }

  bool updateEnd(DateTime value) {
    if (isPastDate(value) || !value.isAfter(start.value)) return false;
    end.value = value;
    return true;
  }

  bool isValidEmail(String email) {
    final re = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
    return re.hasMatch(email);
  }

  String formatRange() {
    final df = DateFormat('EEE d MMM, HH:mm', 'es');
    return '${df.format(start.value)} – ${df.format(end.value)}';
  }

  bool validateInputs({required void Function(String) onError}) {
    nameCtrl.text.trim();
    dniCtrl.text.trim();
    final email = emailCtrl.text.trim();
    final phone = phoneCtrl.text.trim();
    final guests =
        int.tryParse(
          guestsCtrl.text.trim().isEmpty ? '0' : guestsCtrl.text.trim(),
        ) ??
        0;

    if (!formKey.currentState!.validate()) return false;
    if (isPastDate(start.value)) {
      onError('La fecha debe ser hoy o futura.');
      return false;
    }
    if (!end.value.isAfter(start.value)) {
      onError('La hora de fin debe ser mayor a la de inicio.');
      return false;
    }
    if (guests <= 0) {
      onError('El número de personas debe ser mayor a 0.');
      return false;
    }
    if (email.isEmpty && phone.isEmpty) {
      onError('Proporciona al menos email o teléfono.');
      return false;
    }
    if (email.isNotEmpty && !isValidEmail(email)) {
      onError('Email inválido.');
      return false;
    }

    final perfil = Get.find<PerfilController>();
    final businessId = perfil.businessId;
    if (businessId <= 0) {
      onError('No hay negocio seleccionado.');
      return false;
    }

    return true;
  }

  Future<bool> persistReservation() async {
    final name = nameCtrl.text.trim();
    final dni = dniCtrl.text.trim();
    final email = emailCtrl.text.trim();
    final phone = phoneCtrl.text.trim();
    final guests =
        int.tryParse(
          guestsCtrl.text.trim().isEmpty ? '0' : guestsCtrl.text.trim(),
        ) ??
        0;

    final perfil = Get.find<PerfilController>();
    final businessId = perfil.businessId;

    final reserveCtrl = Get.isRegistered<ReserveController>()
        ? Get.find<ReserveController>()
        : Get.put(ReserveController());

    saving.value = true;
    final ok = await reserveCtrl.crearReserva(
      businessId: businessId,
      name: name,
      startAt: start.value,
      endAt: end.value,
      numberOfGuests: guests,
      dni: dni.isEmpty ? null : dni,
      email: email.isEmpty ? null : email,
      phone: phone.isEmpty ? null : phone,
    );
    saving.value = false;

    try {
      await reserveCtrl.cargarReservasHoy(silent: true);
    } catch (_) {}
    try {
      await reserveCtrl.cargarReservasTodas(silent: true);
    } catch (_) {}

    return ok;
  }

  @override
  void onClose() {
    nameCtrl.dispose();
    dniCtrl.dispose();
    emailCtrl.dispose();
    phoneCtrl.dispose();
    guestsCtrl.dispose();
    notesCtrl.dispose();
    super.onClose();
  }
}
