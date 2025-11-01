class AttendanceSummaryResponseModel {
  final bool success;
  final String message;
  final AttendanceSummaryModel? data;

  AttendanceSummaryResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory AttendanceSummaryResponseModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'];
    return AttendanceSummaryResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: data is Map<String, dynamic>
          ? AttendanceSummaryModel.fromJson(data)
          : null,
    );
  }
}

class AttendanceSummaryModel {
  final int totalUnits;
  final int attendedUnits;
  final int absentUnits;
  final int attendedAsOwner;
  final int attendedAsProxy;
  final double attendanceRate;
  final double absenceRate;
  final double attendanceRateByCoef;
  final double absenceRateByCoef;

  AttendanceSummaryModel({
    required this.totalUnits,
    required this.attendedUnits,
    required this.absentUnits,
    required this.attendedAsOwner,
    required this.attendedAsProxy,
    required this.attendanceRate,
    required this.absenceRate,
    required this.attendanceRateByCoef,
    required this.absenceRateByCoef,
  });

  factory AttendanceSummaryModel.fromJson(Map<String, dynamic> json) {
    double _parseDouble(dynamic value) {
      if (value is num) return value.toDouble();
      if (value is String) return double.tryParse(value) ?? 0;
      return 0;
    }

    return AttendanceSummaryModel(
      totalUnits: json['total_units'] as int? ?? 0,
      attendedUnits: json['attended_units'] as int? ?? 0,
      absentUnits: json['absent_units'] as int? ?? 0,
      attendedAsOwner: json['attended_as_owner'] as int? ?? 0,
      attendedAsProxy: json['attended_as_proxy'] as int? ?? 0,
      attendanceRate: _parseDouble(json['attendance_rate']),
      absenceRate: _parseDouble(json['absence_rate']),
      attendanceRateByCoef: _parseDouble(json['attendance_rate_by_coef']),
      absenceRateByCoef: _parseDouble(json['absence_rate_by_coef']),
    );
  }
}
