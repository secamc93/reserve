class HorizontalPropertyVotingListResult {
  final bool success;
  final String? message;
  final List<HorizontalPropertyVoting> votings;

  const HorizontalPropertyVotingListResult({
    required this.success,
    this.message,
    required this.votings,
  });
}

class HorizontalPropertyVotingActionResult {
  final bool success;
  final String? message;
  final HorizontalPropertyVoting? voting;

  const HorizontalPropertyVotingActionResult({
    required this.success,
    this.message,
    this.voting,
  });
}

class HorizontalPropertyVoting {
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

  const HorizontalPropertyVoting({
    required this.id,
    required this.votingGroupId,
    required this.title,
    this.description,
    required this.votingType,
    required this.isSecret,
    required this.allowAbstention,
    required this.isActive,
    required this.displayOrder,
    this.requiredPercentage,
    this.createdAt,
    this.updatedAt,
  });
}

class HorizontalPropertyVotingOptionListResult {
  final bool success;
  final String? message;
  final List<HorizontalPropertyVotingOption> options;

  const HorizontalPropertyVotingOptionListResult({
    required this.success,
    this.message,
    required this.options,
  });
}

class HorizontalPropertyVotingOptionActionResult {
  final bool success;
  final String? message;
  final HorizontalPropertyVotingOption? option;

  const HorizontalPropertyVotingOptionActionResult({
    required this.success,
    this.message,
    this.option,
  });
}

class HorizontalPropertyVotingOption {
  final int id;
  final int votingId;
  final String optionText;
  final String optionCode;
  final String? color;
  final int displayOrder;
  final bool isActive;

  const HorizontalPropertyVotingOption({
    required this.id,
    required this.votingId,
    required this.optionText,
    required this.optionCode,
    this.color,
    required this.displayOrder,
    required this.isActive,
  });
}

class HorizontalPropertyVotingVotesResult {
  final bool success;
  final String? message;
  final List<HorizontalPropertyVotingVote> votes;

  const HorizontalPropertyVotingVotesResult({
    required this.success,
    this.message,
    required this.votes,
  });
}

class HorizontalPropertyVotingVote {
  final int id;
  final int votingId;
  final int propertyUnitId;
  final int votingOptionId;
  final DateTime? votedAt;
  final String? ipAddress;
  final String? userAgent;

  const HorizontalPropertyVotingVote({
    required this.id,
    required this.votingId,
    required this.propertyUnitId,
    required this.votingOptionId,
    this.votedAt,
    this.ipAddress,
    this.userAgent,
  });
}

class HorizontalPropertyVotingGroupActionResult {
  final bool success;
  final String? message;
  final HorizontalPropertyVotingGroup? group;

  const HorizontalPropertyVotingGroupActionResult({
    required this.success,
    this.message,
    this.group,
  });
}

class HorizontalPropertyVotingGroup {
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

  const HorizontalPropertyVotingGroup({
    required this.id,
    required this.businessId,
    required this.name,
    this.description,
    this.votingStartDate,
    this.votingEndDate,
    required this.isActive,
    required this.requiresQuorum,
    this.quorumPercentage,
    this.createdByUserId,
    this.createdAt,
    this.updatedAt,
  });
}

class HorizontalPropertyVotingDetailsResult {
  final bool success;
  final String? message;
  final int totalUnits;
  final int unitsPending;
  final int unitsVoted;
  final List<HorizontalPropertyVotingLiveUnit> units;

  const HorizontalPropertyVotingDetailsResult({
    required this.success,
    this.message,
    required this.totalUnits,
    required this.unitsPending,
    required this.unitsVoted,
    required this.units,
  });
}

class HorizontalPropertyVotingLiveResult {
  final int votingOptionId;
  final String optionText;
  final String optionCode;
  final String? color;
  final int voteCount;
  final double percentage;

  const HorizontalPropertyVotingLiveResult({
    required this.votingOptionId,
    required this.optionText,
    required this.optionCode,
    this.color,
    required this.voteCount,
    required this.percentage,
  });
}

class HorizontalPropertyVotingGroupLiveData {
  final int totalUnits;
  final int unitsPending;
  final int unitsVoted;
  final List<HorizontalPropertyVotingLiveUnit> units;
  final List<HorizontalPropertyVotingLiveResult> results;
  final List<HorizontalPropertyVotingVote> votes;
  final bool hasResultsSnapshot;
  final bool hasVotesSnapshot;
  final DateTime? timestamp;

  const HorizontalPropertyVotingGroupLiveData({
    required this.totalUnits,
    required this.unitsPending,
    required this.unitsVoted,
    required this.units,
    this.results = const [],
    this.votes = const [],
    this.hasResultsSnapshot = false,
    this.hasVotesSnapshot = false,
    this.timestamp,
  });
}

class HorizontalPropertyVotingLiveUnit {
  final int propertyUnitId;
  final String unitNumber;
  final double? participationCoefficient;
  final int? residentId;
  final String? residentName;
  final bool hasVoted;
  final int? votingOptionId;
  final String? optionText;
  final String? optionCode;
  final String? optionColor;
  final DateTime? votedAt;

  const HorizontalPropertyVotingLiveUnit({
    required this.propertyUnitId,
    required this.unitNumber,
    this.participationCoefficient,
    this.residentId,
    this.residentName,
    required this.hasVoted,
    this.votingOptionId,
    this.optionText,
    this.optionCode,
    this.optionColor,
    this.votedAt,
  });
}
