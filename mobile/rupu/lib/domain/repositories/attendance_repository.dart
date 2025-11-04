import 'package:rupu/domain/entities/attendance.dart';

abstract class AttendanceRepository {
  Future<AttendanceListsResult> getAttendanceLists({
    required int businessId,
    String? title,
    bool? isActive,
  });

  Future<AttendanceSummary> getAttendanceSummary({
    required int listId,
  });

  Future<AttendanceRecordsPage> getAttendanceRecords({
    required int listId,
    int page,
    int pageSize,
    String? unitNumber,
    String? attended,
  });

  Future<AttendanceRecord> markAttendance({
    required int recordId,
  });

  Future<AttendanceRecord> unmarkAttendance({
    required int recordId,
  });

  Future<void> createAttendanceProxy({
    required int businessId,
    required int propertyUnitId,
    required String proxyName,
  });

  Future<void> updateAttendanceProxy({
    required int proxyId,
    required String proxyName,
  });

  Future<void> deleteAttendanceProxy({
    required int proxyId,
  });
}
