import '../infrastructure/models/attendance_list_response_model.dart';
import '../infrastructure/models/attendance_record_action_response_model.dart';
import '../infrastructure/models/attendance_records_response_model.dart';
import '../infrastructure/models/attendance_summary_response_model.dart';

abstract class AttendanceDatasource {
  Future<AttendanceListResponseModel> getAttendanceLists({
    required int businessId,
    String? title,
    bool? isActive,
  });

  Future<AttendanceSummaryResponseModel> getAttendanceSummary({
    required int listId,
  });

  Future<AttendanceRecordsResponseModel> getAttendanceRecords({
    required int listId,
    int page = 1,
    int pageSize = 50,
    String? unitNumber,
    String? attended,
  });

  Future<AttendanceRecordActionResponseModel> markAttendance({
    required int recordId,
  });

  Future<AttendanceRecordActionResponseModel> unmarkAttendance({
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
