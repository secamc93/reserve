DateTime? _tryParseDate(String? value) {
  if (value == null || value.isEmpty) return null;
  return DateTime.tryParse(value);
}

class HorizontalPropertyVotingGroupsResponseModel {
  final bool success;
  final String message;
  final List<HorizontalPropertyVotingGroupModel> data;

  HorizontalPropertyVotingGroupsResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory HorizontalPropertyVotingGroupsResponseModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final data = json['data'];
    return HorizontalPropertyVotingGroupsResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: data is List
          ? data
              .whereType<Map<String, dynamic>>()
              .map(HorizontalPropertyVotingGroupModel.fromJson)
              .toList()
          : const [],
    );
  }
}

class HorizontalPropertyVotingGroupModel {
  final int id;
  final int businessId;
  final String name;
  final String? description;
  final DateTime? votingStartDate;
  final DateTime? votingEndDate;
  final bool isActive;
  final bool requiresQuorum;
  final int? quorumPercentage;
  final int? createdByUserId;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  HorizontalPropertyVotingGroupModel({
    required this.id,
    required this.businessId,
    required this.name,
    required this.description,
    required this.votingStartDate,
    required this.votingEndDate,
    required this.isActive,
    required this.requiresQuorum,
    required this.quorumPercentage,
    required this.createdByUserId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory HorizontalPropertyVotingGroupModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return HorizontalPropertyVotingGroupModel(
      id: json['id'] as int? ?? 0,
      businessId: json['business_id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      description: json['description'] as String?,
      votingStartDate: _tryParseDate(json['voting_start_date'] as String?),
      votingEndDate: _tryParseDate(json['voting_end_date'] as String?),
      isActive: json['is_active'] as bool? ?? false,
      requiresQuorum: json['requires_quorum'] as bool? ?? false,
      quorumPercentage: json['quorum_percentage'] as int?,
      createdByUserId: json['created_by_user_id'] as int?,
      createdAt: _tryParseDate(json['created_at'] as String?),
      updatedAt: _tryParseDate(json['updated_at'] as String?),
    );
  }
}
