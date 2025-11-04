import 'package:dio/dio.dart';
import 'package:rupu/config/dio/authenticated_dio.dart';
import 'package:rupu/domain/datasource/attendance_datasource.dart';
import 'package:rupu/domain/infrastructure/models/attendance_list_response_model.dart';
import 'package:rupu/domain/infrastructure/models/attendance_record_action_response_model.dart';
import 'package:rupu/domain/infrastructure/models/attendance_records_response_model.dart';
import 'package:rupu/domain/infrastructure/models/attendance_summary_response_model.dart';

class AttendanceDatasourceImpl extends AttendanceDatasource {
  final Dio _dio;

  AttendanceDatasourceImpl({String? baseUrl})
      : _dio = AuthenticatedDio(
          baseUrl: baseUrl ?? 'https://www.xn--rup-joa.com/api/v1',
        ).dio;

  @override
  Future<AttendanceListResponseModel> getAttendanceLists({
    required int businessId,
    String? title,
    bool? isActive,
  }) async {
    final query = <String, dynamic>{'business_id': businessId};
    if (title != null && title.isNotEmpty) {
      query['title'] = title;
    }
    if (isActive != null) {
      query['is_active'] = isActive;
    }

    final response = await _dio.get(
      '/attendance/lists',
      queryParameters: query,
    );
    return AttendanceListResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<AttendanceSummaryResponseModel> getAttendanceSummary({
    required int listId,
  }) async {
    final response = await _dio.get('/attendance/lists/$listId/summary');
    return AttendanceSummaryResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<AttendanceRecordsResponseModel> getAttendanceRecords({
    required int listId,
    int page = 1,
    int pageSize = 50,
    String? unitNumber,
    String? attended,
  }) async {
    final query = <String, dynamic>{
      'page': page,
      'page_size': pageSize,
    };
    if (unitNumber != null && unitNumber.isNotEmpty) {
      query['unit_number'] = unitNumber;
    }
    if (attended != null && attended.isNotEmpty) {
      query['attended'] = attended;
    }

    final response = await _dio.get(
      '/attendance/lists/$listId/records',
      queryParameters: query,
    );
    return AttendanceRecordsResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<AttendanceRecordActionResponseModel> markAttendance({
    required int recordId,
  }) async {
    final response = await _dio.post('/attendance/records/$recordId/mark');
    return AttendanceRecordActionResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<AttendanceRecordActionResponseModel> unmarkAttendance({
    required int recordId,
  }) async {
    final response = await _dio.post('/attendance/records/$recordId/unmark');
    return AttendanceRecordActionResponseModel.fromJson(
      response.data as Map<String, dynamic>,
    );
  }

  @override
  Future<void> createAttendanceProxy({
    required int businessId,
    required int propertyUnitId,
    required String proxyName,
  }) async {
    await _dio.post(
      '/attendance/proxies',
      data: {
        'business_id': businessId,
        'property_unit_id': propertyUnitId,
        'proxy_name': proxyName,
      },
    );
  }

  @override
  Future<void> updateAttendanceProxy({
    required int proxyId,
    required String proxyName,
  }) async {
    await _dio.put(
      '/attendance/proxies/$proxyId',
      data: {
        'proxy_name': proxyName,
      },
    );
  }

  @override
  Future<void> deleteAttendanceProxy({required int proxyId}) async {
    await _dio.delete('/attendance/proxies/$proxyId');
  }
}
