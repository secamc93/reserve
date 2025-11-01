import 'attendance_records_response_model.dart';

class AttendanceRecordActionResponseModel {
  final bool success;
  final String message;
  final AttendanceRecordModel? data;

  AttendanceRecordActionResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory AttendanceRecordActionResponseModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final data = json['data'];
    return AttendanceRecordActionResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: data is Map<String, dynamic>
          ? AttendanceRecordModel.fromJson(data)
          : null,
    );
  }
}
