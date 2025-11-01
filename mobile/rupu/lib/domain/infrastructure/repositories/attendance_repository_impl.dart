import 'package:rupu/domain/datasource/attendance_datasource.dart';
import 'package:rupu/domain/entities/attendance.dart';
import 'package:rupu/domain/infrastructure/datasources/attendance_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/mappers/attendance_mapper.dart';
import 'package:rupu/domain/infrastructure/models/attendance_record_action_response_model.dart';

import '../../repositories/attendance_repository.dart';

class AttendanceRepositoryImpl extends AttendanceRepository {
  final AttendanceDatasource datasource;

  AttendanceRepositoryImpl({AttendanceDatasource? datasource})
      : datasource = datasource ?? AttendanceDatasourceImpl();

  @override
  Future<AttendanceListsResult> getAttendanceLists({
    required int businessId,
    String? title,
    bool? isActive,
  }) async {
    final response = await datasource.getAttendanceLists(
      businessId: businessId,
      title: title,
      isActive: isActive,
    );
    return AttendanceMapper.listsResponseToEntity(response);
  }

  @override
  Future<AttendanceSummary> getAttendanceSummary({required int listId}) async {
    final response = await datasource.getAttendanceSummary(listId: listId);
    return AttendanceMapper.summaryResponseToEntity(response);
  }

  @override
  Future<AttendanceRecordsPage> getAttendanceRecords({
    required int listId,
    int page = 1,
    int pageSize = 50,
    String? unitNumber,
    String? attended,
  }) async {
    final response = await datasource.getAttendanceRecords(
      listId: listId,
      page: page,
      pageSize: pageSize,
      unitNumber: unitNumber,
      attended: attended,
    );
    return AttendanceMapper.recordsResponseToEntity(response);
  }

  AttendanceRecord _actionToEntity(
    AttendanceRecordActionResponseModel response,
  ) {
    return AttendanceMapper.actionResponseToEntity(response);
  }

  @override
  Future<AttendanceRecord> markAttendance({required int recordId}) async {
    final response = await datasource.markAttendance(recordId: recordId);
    return _actionToEntity(response);
  }

  @override
  Future<AttendanceRecord> unmarkAttendance({required int recordId}) async {
    final response = await datasource.unmarkAttendance(recordId: recordId);
    return _actionToEntity(response);
  }
}
