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
}
