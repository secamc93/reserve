import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/domain/entities/attendance.dart';
import 'package:rupu/domain/entities/horizontal_property_voting_groups.dart';
import 'package:rupu/domain/infrastructure/repositories/attendance_repository_impl.dart';
import 'package:rupu/domain/repositories/attendance_repository.dart';

class AttendanceManagementController extends GetxController {
  final int propertyId;
  final int votingGroupId;
  final int businessId;
  final HorizontalPropertyVotingGroup? group;
  final AttendanceRepository repository;

  AttendanceManagementController({
    required this.propertyId,
    required this.votingGroupId,
    required this.businessId,
    this.group,
    AttendanceRepository? repository,
  }) : repository = repository ?? AttendanceRepositoryImpl();

  static String tagFor({required int propertyId, required int votingGroupId}) =>
      'attendance-$propertyId-$votingGroupId';

  final lists = <AttendanceList>[].obs;
  final isLoadingLists = false.obs;
  final listsError = RxnString();
  final selectedList = Rxn<AttendanceList>();

  final summary = Rxn<AttendanceSummary>();
  final isLoadingSummary = false.obs;
  final summaryError = RxnString();
  final isRefreshingSummary = false.obs;

  final records = <AttendanceRecord>[].obs;
  final isLoadingRecords = false.obs;
  final recordsError = RxnString();
  final currentPage = 1.obs;
  final totalRecords = 0.obs;
  final pageSize = 50;

  final unitFilterCtrl = TextEditingController();
  final attendanceFilter = RxnString();
  final markingRecordIds = <int>{}.obs;

  Timer? _summaryTimer;

  String get groupName => group?.name ?? 'Gestión de asistencia';
  String? get groupDescription => group?.description;

  @override
  void onReady() {
    super.onReady();
    fetchLists();
  }

  @override
  void onClose() {
    _summaryTimer?.cancel();
    unitFilterCtrl.dispose();
    super.onClose();
  }

  Future<void> fetchLists() async {
    isLoadingLists.value = true;
    listsError.value = null;
    try {
      final response = await repository.getAttendanceLists(
        businessId: businessId,
      );
      final filtered = response.lists
          .where((list) => list.votingGroupId == votingGroupId)
          .toList();
      lists.assignAll(filtered);
      if (!response.success && response.message?.isNotEmpty == true) {
        listsError.value = response.message;
      }
      if (filtered.isEmpty) {
        selectedList.value = null;
        summary.value = null;
        records.clear();
        _summaryTimer?.cancel();
      } else {
        final current = selectedList.value;
        if (current == null ||
            !filtered.any((element) => element.id == current.id)) {
          selectList(filtered.first);
        } else {
          selectList(current);
        }
      }
    } catch (_) {
      lists.clear();
      selectedList.value = null;
      summary.value = null;
      records.clear();
      _summaryTimer?.cancel();
      listsError.value =
          'No se pudieron cargar las listas de asistencia. Intenta nuevamente.';
    } finally {
      isLoadingLists.value = false;
    }
  }

  void selectList(AttendanceList? list) {
    selectedList.value = list;
    if (list == null) {
      summary.value = null;
      records.clear();
      _summaryTimer?.cancel();
      return;
    }
    _startSummaryPolling();
    fetchSummary(showLoader: true);
    fetchRecords(page: 1);
  }

  void _startSummaryPolling() {
    _summaryTimer?.cancel();
    final list = selectedList.value;
    if (list == null) return;
    _summaryTimer = Timer.periodic(
      const Duration(seconds: 3),
      (_) => fetchSummary(showLoader: false),
    );
  }

  Future<void> fetchSummary({required bool showLoader}) async {
    final list = selectedList.value;
    if (list == null) return;
    if (isLoadingSummary.value && showLoader) return;

    if (showLoader) {
      isLoadingSummary.value = true;
    }
    try {
      summaryError.value = null;
      final result = await repository.getAttendanceSummary(listId: list.id);
      summary.value = result;
    } catch (_) {
      summaryError.value =
          'No se pudo obtener el resumen de asistencia. Intenta nuevamente.';
    } finally {
      if (showLoader) {
        isLoadingSummary.value = false;
      }
    }
  }

  Future<void> refreshSummaryManually() async {
    if (isRefreshingSummary.value) return;
    isRefreshingSummary.value = true;
    await fetchSummary(showLoader: true);
    isRefreshingSummary.value = false;
  }

  Future<void> fetchRecords({int page = 1}) async {
    final list = selectedList.value;
    if (list == null) return;
    isLoadingRecords.value = true;
    recordsError.value = null;
    try {
      final result = await repository.getAttendanceRecords(
        listId: list.id,
        page: page,
        pageSize: pageSize,
        unitNumber: unitFilterCtrl.text.trim().isEmpty
            ? null
            : unitFilterCtrl.text.trim(),
        attended: attendanceFilter.value,
      );
      records.assignAll(result.records);
      currentPage.value = result.currentPage ?? page;
      totalRecords.value = result.total ?? result.records.length;
      if (!result.success && result.message?.isNotEmpty == true) {
        recordsError.value = result.message;
      }
    } catch (_) {
      records.clear();
      recordsError.value =
          'No se pudieron obtener los registros de asistencia.';
    } finally {
      isLoadingRecords.value = false;
    }
  }

  void applyFilters() {
    fetchRecords(page: 1);
  }

  void clearFilters() {
    unitFilterCtrl.clear();
    attendanceFilter.value = null;
    fetchRecords(page: 1);
  }

  bool isRecordMarked(int id) => markingRecordIds.contains(id);

  Future<void> toggleAttendance(AttendanceRecord record) async {
    if (isRecordMarked(record.id)) return;
    final isAttended = record.attendedAsOwner || record.attendedAsProxy;
    markingRecordIds.add(record.id);
    markingRecordIds.refresh();
    try {
      final updated = isAttended
          ? await repository.unmarkAttendance(recordId: record.id)
          : await repository.markAttendance(recordId: record.id);
      _replaceRecord(updated);
      await fetchSummary(showLoader: false);
    } catch (_) {
      Get.snackbar(
        'Gestión de asistencia',
        'No se pudo actualizar la asistencia. Intenta nuevamente.',
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 3),
        margin: const EdgeInsets.all(16),
      );
    } finally {
      markingRecordIds.remove(record.id);
      markingRecordIds.refresh();
    }
  }

  void _replaceRecord(AttendanceRecord updated) {
    final idx = records.indexWhere((e) => e.id == updated.id);
    if (idx >= 0) {
      final current = records[idx];
      records[idx] = _mergeRecords(current, updated);
      records.refresh();
    } else {
      // opcional: agrega o ignora
      // records.insert(0, updated);
      // records.refresh();
    }
  }

  AttendanceRecord _mergeRecords(
    AttendanceRecord current,
    AttendanceRecord updated,
  ) {
    String? _mergeText(String? existing, String? incoming) {
      final hasText = incoming?.trim().isNotEmpty ?? false;
      return hasText ? incoming!.trim() : existing;
    }

    return AttendanceRecord(
      id: updated.id == 0 ? current.id : updated.id,
      attendanceListId: updated.attendanceListId == 0
          ? current.attendanceListId
          : updated.attendanceListId,
      propertyUnitId:
          updated.propertyUnitId == 0 ? current.propertyUnitId : updated.propertyUnitId,
      attendedAsOwner: updated.attendedAsOwner,
      attendedAsProxy: updated.attendedAsProxy,
      signature: updated.signature ?? current.signature,
      signatureMethod: updated.signatureMethod ?? current.signatureMethod,
      verificationNotes:
          updated.verificationNotes ?? current.verificationNotes,
      notes: updated.notes ?? current.notes,
      isValid: updated.isValid,
      createdAt: updated.createdAt ?? current.createdAt,
      updatedAt: updated.updatedAt ?? current.updatedAt,
      residentName: _mergeText(current.residentName, updated.residentName),
      proxyName: _mergeText(current.proxyName, updated.proxyName),
      unitNumber: _mergeText(current.unitNumber, updated.unitNumber),
    );
  }
}
