class AttendanceListsResult {
  final bool success;
  final String? message;
  final List<AttendanceList> lists;

  const AttendanceListsResult({
    required this.success,
    this.message,
    required this.lists,
  });
}

class AttendanceList {
  final int id;
  final int votingGroupId;
  final int businessId;
  final String title;
  final String? description;
  final bool isActive;
  final String? notes;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const AttendanceList({
    required this.id,
    required this.votingGroupId,
    required this.businessId,
    required this.title,
    this.description,
    required this.isActive,
    this.notes,
    this.createdAt,
    this.updatedAt,
  });
}

class AttendanceSummary {
  final int totalUnits;
  final int attendedUnits;
  final int absentUnits;
  final int attendedAsOwner;
  final int attendedAsProxy;
  final double attendanceRate;
  final double absenceRate;
  final double attendanceRateByCoef;
  final double absenceRateByCoef;

  const AttendanceSummary({
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
}

class AttendanceRecordsPage {
  final bool success;
  final String? message;
  final List<AttendanceRecord> records;
  final int? currentPage;
  final int? total;
  final int? pageSize;

  const AttendanceRecordsPage({
    required this.success,
    this.message,
    required this.records,
    this.currentPage,
    this.total,
    this.pageSize,
  });
}

class AttendanceRecord {
  final int id;
  final int attendanceListId;
  final int propertyUnitId;
  final bool attendedAsOwner;
  final bool attendedAsProxy;
  final int? proxyId;
  final String? signature;
  final String? signatureMethod;
  final String? verificationNotes;
  final String? notes;
  final bool isValid;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String? residentName;
  final String? proxyName;
  final String? unitNumber;

  const AttendanceRecord({
    required this.id,
    required this.attendanceListId,
    required this.propertyUnitId,
    required this.attendedAsOwner,
    required this.attendedAsProxy,
    this.proxyId,
    this.signature,
    this.signatureMethod,
    this.verificationNotes,
    this.notes,
    required this.isValid,
    this.createdAt,
    this.updatedAt,
    this.residentName,
    this.proxyName,
    this.unitNumber,
  });
}
