DateTime? _tryParseDateTime(String? value) {
  if (value == null || value.isEmpty) return null;
  return DateTime.tryParse(value);
}

class HorizontalPropertyVotingDetailsResponseModel {
  final bool success;
  final String message;
  final HorizontalPropertyVotingDetailsDataModel? data;

  HorizontalPropertyVotingDetailsResponseModel({
    required this.success,
    required this.message,
    required this.data,
  });

  factory HorizontalPropertyVotingDetailsResponseModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final data = json['data'];
    return HorizontalPropertyVotingDetailsResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String? ?? '',
      data: data is Map<String, dynamic>
          ? HorizontalPropertyVotingDetailsDataModel.fromJson(data)
          : null,
    );
  }
}

class HorizontalPropertyVotingDetailsDataModel {
  final int totalUnits;
  final int? unitsPending;
  final int? unitsVoted;
  final List<HorizontalPropertyVotingDetailUnitModel> units;

  HorizontalPropertyVotingDetailsDataModel({
    required this.totalUnits,
    required this.unitsPending,
    required this.unitsVoted,
    required this.units,
  });

  factory HorizontalPropertyVotingDetailsDataModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final units = json['units'];
    return HorizontalPropertyVotingDetailsDataModel(
      totalUnits: json['total_units'] as int? ?? 0,
      unitsPending: json['units_pending'] as int?,
      unitsVoted: json['units_voted'] as int?,
      units: units is List
          ? units
              .whereType<Map<String, dynamic>>()
              .map(HorizontalPropertyVotingDetailUnitModel.fromJson)
              .toList(growable: false)
          : const <HorizontalPropertyVotingDetailUnitModel>[],
    );
  }
}

class HorizontalPropertyVotingDetailUnitModel {
  final int propertyUnitId;
  final String propertyUnitNumber;
  final double? participationCoefficient;
  final int? residentId;
  final String? residentName;
  final bool hasVoted;
  final int? votingOptionId;
  final String? optionText;
  final String? optionCode;
  final String? optionColor;
  final DateTime? votedAt;

  HorizontalPropertyVotingDetailUnitModel({
    required this.propertyUnitId,
    required this.propertyUnitNumber,
    required this.participationCoefficient,
    required this.residentId,
    required this.residentName,
    required this.hasVoted,
    required this.votingOptionId,
    required this.optionText,
    required this.optionCode,
    required this.optionColor,
    required this.votedAt,
  });

  factory HorizontalPropertyVotingDetailUnitModel.fromJson(
    Map<String, dynamic> json,
  ) {
    return HorizontalPropertyVotingDetailUnitModel(
      propertyUnitId: json['property_unit_id'] as int? ?? 0,
      propertyUnitNumber: json['property_unit_number'] as String? ?? '',
      participationCoefficient:
          (json['participation_coefficient'] as num?)?.toDouble(),
      residentId: json['resident_id'] as int?,
      residentName: json['resident_name'] as String?,
      hasVoted: json['has_voted'] as bool? ?? false,
      votingOptionId: json['voting_option_id'] as int?,
      optionText: json['option_text'] as String?,
      optionCode: json['option_code'] as String?,
      optionColor: json['option_color'] as String?,
      votedAt: _tryParseDateTime(json['voted_at'] as String?),
    );
  }
}
