import 'horizontal_property_voting_groups_response_model.dart'
    show HorizontalPropertyVotingGroupModel;

DateTime? _parseDate(String? value) {
  if (value == null || value.isEmpty) return null;
  return DateTime.tryParse(value);
}

class HorizontalPropertyVotingsResponseModel {
  final bool success;
  final String message;
  final List<HorizontalPropertyVotingModel> data;

  HorizontalPropertyVotingsResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory HorizontalPropertyVotingsResponseModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final data = json['data'];
    return HorizontalPropertyVotingsResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: data is List
          ? data
              .whereType<Map<String, dynamic>>()
              .map(HorizontalPropertyVotingModel.fromJson)
              .toList()
          : const [],
    );
  }
}

class HorizontalPropertyVotingModel {
  final int id;
  final int votingGroupId;
  final String title;
  final String? description;
  final String votingType;
  final bool isSecret;
  final bool allowAbstention;
  final bool isActive;
  final int displayOrder;
  final int? requiredPercentage;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  HorizontalPropertyVotingModel({
    required this.id,
    required this.votingGroupId,
    required this.title,
    required this.description,
    required this.votingType,
    required this.isSecret,
    required this.allowAbstention,
    required this.isActive,
    required this.displayOrder,
    required this.requiredPercentage,
    required this.createdAt,
    required this.updatedAt,
  });

  factory HorizontalPropertyVotingModel.fromJson(Map<String, dynamic> json) {
    return HorizontalPropertyVotingModel(
      id: json['id'] as int? ?? 0,
      votingGroupId: json['voting_group_id'] as int? ?? 0,
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      votingType: json['voting_type'] as String? ?? 'simple',
      isSecret: json['is_secret'] as bool? ?? false,
      allowAbstention: json['allow_abstention'] as bool? ?? false,
      isActive: json['is_active'] as bool? ?? false,
      displayOrder: json['display_order'] as int? ?? 0,
      requiredPercentage: json['required_percentage'] as int?,
      createdAt: _parseDate(json['created_at'] as String?),
      updatedAt: _parseDate(json['updated_at'] as String?),
    );
  }
}

class HorizontalPropertyVotingActionResponseModel {
  final bool success;
  final String message;
  final HorizontalPropertyVotingModel? data;

  HorizontalPropertyVotingActionResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory HorizontalPropertyVotingActionResponseModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final data = json['data'];
    return HorizontalPropertyVotingActionResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: data is Map<String, dynamic>
          ? HorizontalPropertyVotingModel.fromJson(data)
          : null,
    );
  }
}

class HorizontalPropertyVotingGroupActionResponseModel {
  final bool success;
  final String message;
  final HorizontalPropertyVotingGroupModel? data;

  HorizontalPropertyVotingGroupActionResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory HorizontalPropertyVotingGroupActionResponseModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final data = json['data'];
    return HorizontalPropertyVotingGroupActionResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: data is Map<String, dynamic>
          ? HorizontalPropertyVotingGroupModel.fromJson(data)
          : null,
    );
  }
}

class HorizontalPropertyVotingOptionsResponseModel {
  final bool success;
  final String message;
  final List<HorizontalPropertyVotingOptionModel> data;

  HorizontalPropertyVotingOptionsResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory HorizontalPropertyVotingOptionsResponseModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final data = json['data'];
    return HorizontalPropertyVotingOptionsResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: data is List
          ? data
              .whereType<Map<String, dynamic>>()
              .map(HorizontalPropertyVotingOptionModel.fromJson)
              .toList()
          : const [],
    );
  }
}

class HorizontalPropertyVotingOptionModel {
  final int id;
  final int votingId;
  final String optionText;
  final String optionCode;
  final String? color;
  final int displayOrder;
  final bool isActive;

  HorizontalPropertyVotingOptionModel({
    required this.id,
    required this.votingId,
    required this.optionText,
    required this.optionCode,
    required this.color,
    required this.displayOrder,
    required this.isActive,
  });

  factory HorizontalPropertyVotingOptionModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return HorizontalPropertyVotingOptionModel(
      id: json['id'] as int? ?? 0,
      votingId: json['voting_id'] as int? ?? 0,
      optionText: json['option_text'] as String? ?? '',
      optionCode: json['option_code'] as String? ?? '',
      color: json['color'] as String?,
      displayOrder: json['display_order'] as int? ?? 0,
      isActive: json['is_active'] as bool? ?? false,
    );
  }
}

class HorizontalPropertyVotingOptionActionResponseModel {
  final bool success;
  final String message;
  final HorizontalPropertyVotingOptionModel? data;

  HorizontalPropertyVotingOptionActionResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory HorizontalPropertyVotingOptionActionResponseModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final data = json['data'];
    return HorizontalPropertyVotingOptionActionResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: data is Map<String, dynamic>
          ? HorizontalPropertyVotingOptionModel.fromJson(data)
          : null,
    );
  }
}

class HorizontalPropertyVotingVotesResponseModel {
  final bool success;
  final String message;
  final List<HorizontalPropertyVotingVoteModel> data;

  HorizontalPropertyVotingVotesResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory HorizontalPropertyVotingVotesResponseModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final data = json['data'];
    return HorizontalPropertyVotingVotesResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: data is List
          ? data
              .whereType<Map<String, dynamic>>()
              .map(HorizontalPropertyVotingVoteModel.fromJson)
              .toList()
          : const [],
    );
  }
}

class HorizontalPropertyVotingVoteModel {
  final int id;
  final int votingId;
  final int propertyUnitId;
  final int votingOptionId;
  final DateTime? votedAt;
  final String? ipAddress;
  final String? userAgent;

  HorizontalPropertyVotingVoteModel({
    required this.id,
    required this.votingId,
    required this.propertyUnitId,
    required this.votingOptionId,
    required this.votedAt,
    required this.ipAddress,
    required this.userAgent,
  });

  factory HorizontalPropertyVotingVoteModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return HorizontalPropertyVotingVoteModel(
      id: json['id'] as int? ?? 0,
      votingId: json['voting_id'] as int? ?? 0,
      propertyUnitId: json['property_unit_id'] as int? ?? 0,
      votingOptionId: json['voting_option_id'] as int? ?? 0,
      votedAt: _parseDate(json['voted_at'] as String?),
      ipAddress: json['ip_address'] as String?,
      userAgent: json['user_agent'] as String?,
    );
  }
}
