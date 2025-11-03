DateTime? _tryParseDate(String? value) {
  if (value == null || value.isEmpty) return null;
  return DateTime.tryParse(value);
}

class AttendanceRecordsResponseModel {
  final bool success;
  final String message;
  final List<AttendanceRecordModel> data;
  final AttendanceRecordsMetaModel? meta;

  AttendanceRecordsResponseModel({
    required this.success,
    required this.message,
    required this.data,
    required this.meta,
  });

  factory AttendanceRecordsResponseModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'];
    final meta = json['meta'];
    return AttendanceRecordsResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: data is List
          ? data
              .whereType<Map<String, dynamic>>()
              .map(AttendanceRecordModel.fromJson)
              .toList()
          : const [],
      meta: meta is Map<String, dynamic>
          ? AttendanceRecordsMetaModel.fromJson(meta)
          : null,
    );
  }
}

class AttendanceRecordsMetaModel {
  final int? currentPage;
  final int? total;
  final int? perPage;

  AttendanceRecordsMetaModel({this.currentPage, this.total, this.perPage});

  factory AttendanceRecordsMetaModel.fromJson(Map<String, dynamic> json) {
    return AttendanceRecordsMetaModel(
      currentPage: json['current_page'] as int?,
      total: json['total'] as int?,
      perPage: json['per_page'] as int?,
    );
  }
}

class AttendanceRecordModel {
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

  AttendanceRecordModel({
    required this.id,
    required this.attendanceListId,
    required this.propertyUnitId,
    required this.attendedAsOwner,
    required this.attendedAsProxy,
    required this.proxyId,
    required this.signature,
    required this.signatureMethod,
    required this.verificationNotes,
    required this.notes,
    required this.isValid,
    required this.createdAt,
    required this.updatedAt,
    required this.residentName,
    required this.proxyName,
    required this.unitNumber,
  });

  factory AttendanceRecordModel.fromJson(Map<String, dynamic> json) {
    return AttendanceRecordModel(
      id: json['id'] as int? ?? 0,
      attendanceListId: json['attendance_list_id'] as int? ?? 0,
      propertyUnitId: json['property_unit_id'] as int? ?? 0,
      attendedAsOwner: json['attended_as_owner'] as bool? ?? false,
      attendedAsProxy: json['attended_as_proxy'] as bool? ?? false,
      proxyId: json['proxy_id'] as int?,
      signature: json['signature'] as String?,
      signatureMethod: json['signature_method'] as String?,
      verificationNotes: json['verification_notes'] as String?,
      notes: json['notes'] as String?,
      isValid: json['is_valid'] as bool? ?? false,
      createdAt: _tryParseDate(json['created_at'] as String?),
      updatedAt: _tryParseDate(json['updated_at'] as String?),
      residentName: json['resident_name'] as String?,
      proxyName: json['proxy_name'] as String?,
      unitNumber: json['unit_number'] as String?,
    );
  }
}
