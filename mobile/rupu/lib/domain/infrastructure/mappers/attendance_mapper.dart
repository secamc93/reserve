import 'package:rupu/domain/entities/attendance.dart';

import '../models/attendance_list_response_model.dart';
import '../models/attendance_record_action_response_model.dart';
import '../models/attendance_records_response_model.dart';
import '../models/attendance_summary_response_model.dart';

class AttendanceMapper {
  static AttendanceListsResult listsResponseToEntity(
    AttendanceListResponseModel model,
  ) {
    return AttendanceListsResult(
      success: model.success,
      message: model.message.isEmpty ? null : model.message,
      lists: model.data.map(listModelToEntity).toList(),
    );
  }

  static AttendanceList listModelToEntity(AttendanceListModel model) {
    return AttendanceList(
      id: model.id,
      votingGroupId: model.votingGroupId,
      businessId: model.businessId,
      title: model.title,
      description: model.description,
      isActive: model.isActive,
      notes: model.notes,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    );
  }

  static AttendanceSummary summaryResponseToEntity(
    AttendanceSummaryResponseModel model,
  ) {
    final data = model.data;
    if (data == null) {
      return const AttendanceSummary(
        totalUnits: 0,
        attendedUnits: 0,
        absentUnits: 0,
        attendedAsOwner: 0,
        attendedAsProxy: 0,
        attendanceRate: 0,
        absenceRate: 0,
        attendanceRateByCoef: 0,
        absenceRateByCoef: 0,
      );
    }

    return AttendanceSummary(
      totalUnits: data.totalUnits,
      attendedUnits: data.attendedUnits,
      absentUnits: data.absentUnits,
      attendedAsOwner: data.attendedAsOwner,
      attendedAsProxy: data.attendedAsProxy,
      attendanceRate: data.attendanceRate,
      absenceRate: data.absenceRate,
      attendanceRateByCoef: data.attendanceRateByCoef,
      absenceRateByCoef: data.absenceRateByCoef,
    );
  }

  static AttendanceRecordsPage recordsResponseToEntity(
    AttendanceRecordsResponseModel model,
  ) {
    return AttendanceRecordsPage(
      success: model.success,
      message: model.message.isEmpty ? null : model.message,
      records: model.data.map(recordModelToEntity).toList(),
      currentPage: model.meta?.currentPage,
      total: model.meta?.total,
      pageSize: model.meta?.perPage,
    );
  }

  static AttendanceRecord recordModelToEntity(AttendanceRecordModel model) {
    return AttendanceRecord(
      id: model.id,
      attendanceListId: model.attendanceListId,
      propertyUnitId: model.propertyUnitId,
      attendedAsOwner: model.attendedAsOwner,
      attendedAsProxy: model.attendedAsProxy,
      proxyId: model.proxyId,
      signature: model.signature,
      signatureMethod: model.signatureMethod,
      verificationNotes: model.verificationNotes,
      notes: model.notes,
      isValid: model.isValid,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      residentName: model.residentName,
      proxyName: model.proxyName,
      unitNumber: model.unitNumber,
    );
  }

  static AttendanceRecord actionResponseToEntity(
    AttendanceRecordActionResponseModel model,
  ) {
    final data = model.data;
    if (data == null) {
      return const AttendanceRecord(
        id: 0,
        attendanceListId: 0,
        propertyUnitId: 0,
        attendedAsOwner: false,
        attendedAsProxy: false,
        proxyId: null,
        signature: null,
        signatureMethod: null,
        verificationNotes: null,
        notes: null,
        isValid: false,
        createdAt: null,
        updatedAt: null,
        residentName: null,
        proxyName: null,
        unitNumber: null,
      );
    }
    return recordModelToEntity(data);
  }
}
