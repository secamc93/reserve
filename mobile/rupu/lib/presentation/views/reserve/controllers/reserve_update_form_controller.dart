import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/domain/entities/reserve.dart';
import 'package:rupu/domain/entities/reserve_status.dart';

class ReserveUpdateFormController extends GetxController {
  final formKey = GlobalKey<FormState>();
  final guestsCtrl = TextEditingController();
  final statusCtrl = TextEditingController();

  final start = Rxn<DateTime>();
  final end = Rxn<DateTime>();
  final selectedStatus = Rxn<ReserveStatus>();
  final saving = false.obs;

  ReserveStatus? _fallbackStatus;
  bool _initialized = false;

  void hydrateFromReserve(Reserve reserva) {
    if (_initialized) return;
    start.value = reserva.startAt.toLocal();
    end.value = reserva.endAt.toLocal();
    guestsCtrl.text = reserva.numberOfGuests.toString();

    if (reserva.statusHistory.isNotEmpty) {
      final latest = reserva.statusHistory.last;
      _fallbackStatus = ReserveStatus(
        id: latest.statusId,
        code: latest.statusCode,
        name: latest.statusName,
      );
      selectedStatus.value = _fallbackStatus;
      statusCtrl.text = latest.statusName;
    }

    _initialized = true;
  }

  void selectStatus(ReserveStatus status) {
    selectedStatus.value = status;
    statusCtrl.text = status.name;
  }

  void setStart(DateTime value) {
    start.value = value;
    if (end.value != null && !end.value!.isAfter(value)) {
      end.value = value.add(const Duration(hours: 1));
    }
  }

  bool setEnd(DateTime value) {
    if (start.value == null || !value.isAfter(start.value!)) {
      return false;
    }
    end.value = value;
    return true;
  }

  int? get selectedStatusId =>
      selectedStatus.value?.id ?? _fallbackStatus?.id;

  @override
  void onClose() {
    guestsCtrl.dispose();
    statusCtrl.dispose();
    super.onClose();
  }
}
