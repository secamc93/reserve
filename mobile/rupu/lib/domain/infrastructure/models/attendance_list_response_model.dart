DateTime? _tryParseDate(String? value) {
  if (value == null || value.isEmpty) return null;
  return DateTime.tryParse(value);
}

class AttendanceListResponseModel {
  final bool success;
  final String message;
  final List<AttendanceListModel> data;

  AttendanceListResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory AttendanceListResponseModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'];
    return AttendanceListResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: data is List
          ? data
              .whereType<Map<String, dynamic>>()
              .map(AttendanceListModel.fromJson)
              .toList()
          : const [],
    );
  }
}

class AttendanceListModel {
  final int id;
  final int votingGroupId;
  final int businessId;
  final String title;
  final String? description;
  final bool isActive;
  final String? notes;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  AttendanceListModel({
    required this.id,
    required this.votingGroupId,
    required this.businessId,
    required this.title,
    required this.description,
    required this.isActive,
    required this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory AttendanceListModel.fromJson(Map<String, dynamic> json) {
    return AttendanceListModel(
      id: json['id'] as int? ?? 0,
      votingGroupId: json['voting_group_id'] as int? ?? 0,
      businessId: json['business_id'] as int? ?? 0,
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      isActive: json['is_active'] as bool? ?? false,
      notes: json['notes'] as String?,
      createdAt: _tryParseDate(json['created_at'] as String?),
      updatedAt: _tryParseDate(json['updated_at'] as String?),
    );
  }
}
