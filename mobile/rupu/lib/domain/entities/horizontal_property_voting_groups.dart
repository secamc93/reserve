import 'horizontal_property_voting.dart' show HorizontalPropertyVotingGroup;

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
