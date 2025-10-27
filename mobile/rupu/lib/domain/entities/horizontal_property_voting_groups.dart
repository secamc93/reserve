class HorizontalPropertyVotingGroupsResult {
  final bool success;
  final String? message;
  final List<HorizontalPropertyVotingGroup> groups;

  const HorizontalPropertyVotingGroupsResult({
    required this.success,
    this.message,
    required this.groups,
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
