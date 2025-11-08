import 'package:collection/collection.dart';
import 'package:get/get.dart';
import 'package:rupu/domain/entities/horizontal_property_action_result.dart';
import 'package:rupu/domain/entities/horizontal_property_voting.dart';
import 'package:rupu/domain/entities/horizontal_property_voting_groups.dart';
import 'package:rupu/domain/infrastructure/repositories/horizontal_properties_repository_impl.dart';
import 'package:rupu/domain/repositories/horizontal_properties_repository.dart';

import '../horizontal_property_detail_controller.dart';

class HorizontalPropertyVotingController extends GetxController {
  final int propertyId;
  final HorizontalPropertiesRepository repository;

  HorizontalPropertyVotingController({
    required this.propertyId,
    HorizontalPropertiesRepository? repository,
  }) : repository = repository ?? HorizontalPropertiesRepositoryImpl();

  static String tagFor(int id) =>
      '${HorizontalPropertyDetailController.tagFor(id)}-voting';

  final groups = <HorizontalPropertyVotingGroup>[].obs;
  final isLoading = false.obs;
  final errorMessage = RxnString();

  final RxSet<int> expandedGroupIds = <int>{}.obs;
  final RxSet<int> deletingGroupIds = <int>{}.obs;
  final RxSet<int> deletingVotingIds = <int>{}.obs;
  final RxSet<int> togglingVotingIds = <int>{}.obs;
  final isSavingGroup = false.obs;
  final isSavingVoting = false.obs;

  int? get firstVotingGroupId =>
      groups.isNotEmpty ? groups.first.id : null;

  final Map<int, _VotingGroupState> _groupStates = {};

  _VotingGroupState _ensureGroupState(int groupId) {
    return _groupStates.putIfAbsent(groupId, _VotingGroupState.new);
  }

  _VotingDetailState _ensureVotingState(int groupId, int votingId) {
    final groupState = _ensureGroupState(groupId);
    return groupState.details.putIfAbsent(votingId, _VotingDetailState.new);
  }

  List<HorizontalPropertyVoting> votingsForGroup(int groupId) =>
      List<HorizontalPropertyVoting>.of(
        _groupStates[groupId]?.votings ?? const [],
      );

  bool groupIsLoading(int groupId) =>
      _ensureGroupState(groupId).isLoading.value;

  String? groupErrorMessage(int groupId) =>
      _ensureGroupState(groupId).errorMessage.value;

  bool isGroupExpanded(int groupId) => expandedGroupIds.contains(groupId);

  bool isVotingExpanded(int groupId, int votingId) =>
      _groupStates[groupId]?.expandedVotingIds.contains(votingId) ?? false;

  _VotingDetailState? votingDetailState(int groupId, int votingId) {
    return _groupStates[groupId]?.details[votingId];
  }

  List<HorizontalPropertyVotingOption> optionsForVoting(
    int groupId,
    int votingId,
  ) =>
      List<HorizontalPropertyVotingOption>.of(
        votingDetailState(groupId, votingId)?.options ?? const [],
      );

  List<HorizontalPropertyVotingVote> votesForVoting(
    int groupId,
    int votingId,
  ) =>
      List<HorizontalPropertyVotingVote>.of(
        votingDetailState(groupId, votingId)?.votes ?? const [],
      );

  bool optionsAreLoading(int groupId, int votingId) =>
      _ensureVotingState(groupId, votingId).optionsLoading.value;

  String? optionsErrorMessage(int groupId, int votingId) =>
      _ensureVotingState(groupId, votingId).optionsError.value;

  bool votesAreLoading(int groupId, int votingId) =>
      _ensureVotingState(groupId, votingId).votesLoading.value;

  String? votesErrorMessage(int groupId, int votingId) =>
      _ensureVotingState(groupId, votingId).votesError.value;

  bool isDeletingOption(int groupId, int votingId, int optionId) =>
      _ensureVotingState(groupId, votingId)
          .deletingOptionIds
          .contains(optionId);

  bool isDeletingVote(int groupId, int votingId, int voteId) =>
      _ensureVotingState(groupId, votingId)
          .deletingVoteIds
          .contains(voteId);

  @override
  void onReady() {
    super.onReady();
    refresh();
  }

  Future<void> refresh() async {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      final result = await repository.getHorizontalPropertyVotingGroups(
        id: propertyId,
      );
      groups.assignAll(result.groups);
      if (!result.success) {
        errorMessage.value = result.message ??
            'No se pudieron cargar los grupos de votación.';
      }
      _cleanupStates();
      await Future.wait(expandedGroupIds.map(
        (groupId) => loadGroupVotings(groupId, force: true),
      ));
    } catch (_) {
      groups.clear();
      errorMessage.value =
          'No se pudo cargar la información de votaciones de la propiedad.';
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> toggleGroup(int groupId) async {
    if (expandedGroupIds.contains(groupId)) {
      expandedGroupIds.remove(groupId);
      return;
    }
    expandedGroupIds.add(groupId);
    await loadGroupVotings(groupId);
  }

  Future<void> loadGroupVotings(int groupId, {bool force = false}) async {
    final state = _ensureGroupState(groupId);
    if (state.isLoading.value) return;
    if (!force && state.votings.isNotEmpty) return;

    state.isLoading.value = true;
    state.errorMessage.value = null;
    try {
      final result = await repository.getHorizontalPropertyVotings(
        businessId: propertyId,
        groupId: groupId,
      );
      state.votings.assignAll(result.votings);
      if (!result.success) {
        state.errorMessage.value = result.message ??
            'No se pudieron obtener las votaciones del grupo.';
      }
    } catch (_) {
      state.votings.clear();
      state.errorMessage.value =
          'Ocurrió un error al cargar las votaciones del grupo.';
    } finally {
      state.isLoading.value = false;
    }
  }

  Future<HorizontalPropertyVotingGroupActionResult> createGroup(
    Map<String, dynamic> data,
  ) async {
    if (isSavingGroup.value) {
      return const HorizontalPropertyVotingGroupActionResult(success: false);
    }
    isSavingGroup.value = true;
    try {
      final result = await repository.createHorizontalPropertyVotingGroup(
        businessId: propertyId,
        data: data,
      );
      if (result.success && result.group != null) {
        final existingIndex = groups.indexWhere((g) => g.id == result.group!.id);
        if (existingIndex >= 0) {
          groups[existingIndex] = result.group!;
        } else {
          groups.insert(0, result.group!);
        }
        groups.refresh();
      }
      return result;
    } finally {
      isSavingGroup.value = false;
    }
  }

  Future<HorizontalPropertyVotingGroupActionResult> updateGroup(
    int groupId,
    Map<String, dynamic> data,
  ) async {
    final result = await repository.updateHorizontalPropertyVotingGroup(
      businessId: propertyId,
      groupId: groupId,
      data: data,
    );
    if (result.success && result.group != null) {
      final index = groups.indexWhere((g) => g.id == groupId);
      if (index >= 0) {
        groups[index] = result.group!;
        groups.refresh();
      }
    }
    return result;
  }

  Future<HorizontalPropertyActionResult> deleteGroup(int groupId) async {
    if (deletingGroupIds.contains(groupId)) {
      return const HorizontalPropertyActionResult(success: false);
    }
    deletingGroupIds.add(groupId);
    try {
      final result = await repository.deleteHorizontalPropertyVotingGroup(
        businessId: propertyId,
        groupId: groupId,
      );
      if (result.success) {
        groups.removeWhere((g) => g.id == groupId);
        expandedGroupIds.remove(groupId);
        _groupStates.remove(groupId);
      }
      return result;
    } finally {
      deletingGroupIds.remove(groupId);
    }
  }

  Future<HorizontalPropertyVotingActionResult> createVoting({
    required int groupId,
    required Map<String, dynamic> data,
  }) async {
    if (isSavingVoting.value) {
      return const HorizontalPropertyVotingActionResult(success: false);
    }
    isSavingVoting.value = true;
    try {
      final result = await repository.createHorizontalPropertyVoting(
        businessId: propertyId,
        groupId: groupId,
        data: data,
      );
      if (result.success && result.voting != null) {
        final state = _ensureGroupState(groupId);
        final index = state.votings.indexWhere((v) => v.id == result.voting!.id);
        if (index >= 0) {
          state.votings[index] = result.voting!;
        } else {
          state.votings.insert(0, result.voting!);
        }
        state.votings.refresh();
      }
      return result;
    } finally {
      isSavingVoting.value = false;
    }
  }

  Future<HorizontalPropertyVotingActionResult> updateVoting({
    required int groupId,
    required int votingId,
    required Map<String, dynamic> data,
  }) async {
    final result = await repository.updateHorizontalPropertyVoting(
      businessId: propertyId,
      groupId: groupId,
      votingId: votingId,
      data: data,
    );
    if (result.success && result.voting != null) {
      final state = _ensureGroupState(groupId);
      final index = state.votings.indexWhere((v) => v.id == votingId);
      if (index >= 0) {
        state.votings[index] = result.voting!;
        state.votings.refresh();
      }
    }
    return result;
  }

  Future<HorizontalPropertyActionResult> deleteVoting({
    required int groupId,
    required int votingId,
  }) async {
    if (deletingVotingIds.contains(votingId)) {
      return const HorizontalPropertyActionResult(success: false);
    }
    deletingVotingIds.add(votingId);
    try {
      final result = await repository.deleteHorizontalPropertyVoting(
        businessId: propertyId,
        groupId: groupId,
        votingId: votingId,
      );
      if (result.success) {
        final state = _ensureGroupState(groupId);
        state.votings.removeWhere((v) => v.id == votingId);
        state.expandedVotingIds.remove(votingId);
        state.details.remove(votingId);
      }
      return result;
    } finally {
      deletingVotingIds.remove(votingId);
    }
  }

  Future<HorizontalPropertyActionResult> toggleVotingStatus({
    required int groupId,
    required int votingId,
    required bool activate,
  }) async {
    if (togglingVotingIds.contains(votingId)) {
      return const HorizontalPropertyActionResult(success: false);
    }
    togglingVotingIds.add(votingId);
    try {
      final result = activate
          ? await repository.activateHorizontalPropertyVoting(
              businessId: propertyId,
              groupId: groupId,
              votingId: votingId,
            )
          : await repository.deactivateHorizontalPropertyVoting(
              businessId: propertyId,
              groupId: groupId,
              votingId: votingId,
            );
      if (result.success) {
        final state = _ensureGroupState(groupId);
        final index = state.votings.indexWhere((v) => v.id == votingId);
        if (index >= 0) {
          final voting = state.votings[index];
          state.votings[index] = HorizontalPropertyVoting(
            id: voting.id,
            votingGroupId: voting.votingGroupId,
            title: voting.title,
            description: voting.description,
            votingType: voting.votingType,
            isSecret: voting.isSecret,
            allowAbstention: voting.allowAbstention,
            isActive: activate,
            displayOrder: voting.displayOrder,
            requiredPercentage: voting.requiredPercentage,
            createdAt: voting.createdAt,
            updatedAt: DateTime.now(),
          );
          state.votings.refresh();
        }
      }
      return result;
    } finally {
      togglingVotingIds.remove(votingId);
    }
  }

  Future<void> toggleVotingExpanded(int groupId, int votingId) async {
    final state = _ensureGroupState(groupId);
    if (state.expandedVotingIds.contains(votingId)) {
      state.expandedVotingIds.remove(votingId);
      return;
    }
    state.expandedVotingIds.add(votingId);
    await Future.wait([
      loadVotingOptions(groupId: groupId, votingId: votingId),
      loadVotingVotes(groupId: groupId, votingId: votingId),
    ]);
  }

  Future<void> loadVotingOptions({
    required int groupId,
    required int votingId,
    bool force = false,
  }) async {
    final detailState = _ensureVotingState(groupId, votingId);
    if (detailState.optionsLoading.value) return;
    if (!force && detailState.options.isNotEmpty) return;

    detailState.optionsLoading.value = true;
    detailState.optionsError.value = null;
    try {
      final result = await repository.getHorizontalPropertyVotingOptions(
        businessId: propertyId,
        groupId: groupId,
        votingId: votingId,
      );
      detailState.options.assignAll(result.options);
      if (!result.success) {
        detailState.optionsError.value = result.message ??
            'No se pudieron obtener las opciones de votación.';
      }
    } catch (_) {
      detailState.options.clear();
      detailState.optionsError.value =
          'Ocurrió un error al cargar las opciones de votación.';
    } finally {
      detailState.optionsLoading.value = false;
    }
  }

  Future<void> loadVotingVotes({
    required int groupId,
    required int votingId,
    bool force = false,
  }) async {
    final detailState = _ensureVotingState(groupId, votingId);
    if (detailState.votesLoading.value) return;
    if (!force && detailState.votes.isNotEmpty) return;

    detailState.votesLoading.value = true;
    detailState.votesError.value = null;
    try {
      final result = await repository.getHorizontalPropertyVotingVotes(
        businessId: propertyId,
        groupId: groupId,
        votingId: votingId,
      );
      detailState.votes.assignAll(result.votes);
      if (!result.success) {
        detailState.votesError.value = result.message ??
            'No se pudieron obtener los votos registrados.';
      }
    } catch (_) {
      detailState.votes.clear();
      detailState.votesError.value =
          'Ocurrió un error al cargar los votos de la votación.';
    } finally {
      detailState.votesLoading.value = false;
    }
  }

  Future<HorizontalPropertyVotingOptionActionResult> createVotingOption({
    required int groupId,
    required int votingId,
    required Map<String, dynamic> data,
  }) async {
    final detailState = _ensureVotingState(groupId, votingId);
    final result = await repository.createHorizontalPropertyVotingOption(
      businessId: propertyId,
      groupId: groupId,
      votingId: votingId,
      data: data,
    );
    if (result.success && result.option != null) {
      final index = detailState.options.indexWhere(
        (option) => option.id == result.option!.id,
      );
      if (index >= 0) {
        detailState.options[index] = result.option!;
      } else {
        detailState.options.add(result.option!);
      }
      detailState.options.sort(
        (a, b) => a.displayOrder.compareTo(b.displayOrder),
      );
    }
    return result;
  }

  Future<HorizontalPropertyActionResult> deleteVotingOption({
    required int groupId,
    required int votingId,
    required int optionId,
  }) async {
    final detailState = _ensureVotingState(groupId, votingId);
    if (detailState.deletingOptionIds.contains(optionId)) {
      return const HorizontalPropertyActionResult(success: false);
    }
    detailState.deletingOptionIds.add(optionId);
    try {
      final result = await repository.deleteHorizontalPropertyVotingOption(
        businessId: propertyId,
        groupId: groupId,
        votingId: votingId,
        optionId: optionId,
      );
      if (result.success) {
        detailState.options.removeWhere((option) => option.id == optionId);
      }
      return result;
    } finally {
      detailState.deletingOptionIds.remove(optionId);
    }
  }

  Future<HorizontalPropertyActionResult> createVote({
    required int groupId,
    required int votingId,
    required Map<String, dynamic> data,
  }) async {
    final result = await repository.createHorizontalPropertyVote(
      businessId: propertyId,
      groupId: groupId,
      votingId: votingId,
      data: data,
    );
    if (result.success) {
      await loadVotingVotes(groupId: groupId, votingId: votingId, force: true);
    }
    return result;
  }

  Future<HorizontalPropertyActionResult> deleteVote({
    required int groupId,
    required int votingId,
    required int voteId,
  }) async {
    final detailState = _ensureVotingState(groupId, votingId);
    if (detailState.deletingVoteIds.contains(voteId)) {
      return const HorizontalPropertyActionResult(success: false);
    }
    detailState.deletingVoteIds.add(voteId);
    try {
      final result = await repository.deleteHorizontalPropertyVote(
        businessId: propertyId,
        groupId: groupId,
        votingId: votingId,
        voteId: voteId,
      );
      if (result.success) {
        detailState.votes.removeWhere((vote) => vote.id == voteId);
      }
      return result;
    } finally {
      detailState.deletingVoteIds.remove(voteId);
    }
  }

  int totalVotesFor(int groupId, int votingId) {
    final detail = votingDetailState(groupId, votingId);
    return detail?.votes.length ?? 0;
  }

  void syncVotesFromLive({
    required int groupId,
    required int votingId,
    required List<HorizontalPropertyVotingVote> votes,
  }) {
    final detailState = _ensureVotingState(groupId, votingId);
    detailState.votes.assignAll(votes);
    detailState.votesLoading.value = false;
    detailState.votesError.value = null;
  }

  Map<int, int> voteSummary(int groupId, int votingId) {
    final detail = votingDetailState(groupId, votingId);
    if (detail == null) return const {};
    final counts = <int, int>{};
    for (final vote in detail.votes) {
      counts.update(vote.votingOptionId, (value) => value + 1,
          ifAbsent: () => 1);
    }
    return counts;
  }

  HorizontalPropertyVotingOption? optionById({
    required int groupId,
    required int votingId,
    required int optionId,
  }) {
    return votingDetailState(groupId, votingId)?.options
        .firstWhereOrNull((option) => option.id == optionId);
  }

  HorizontalPropertyVotingVote? voteForUnit({
    required int groupId,
    required int votingId,
    required int propertyUnitId,
  }) {
    return votingDetailState(groupId, votingId)?.votes
        .firstWhereOrNull((vote) => vote.propertyUnitId == propertyUnitId);
  }

  void _cleanupStates() {
    final validIds = groups.map((g) => g.id).toSet();
    _groupStates.removeWhere((key, _) => !validIds.contains(key));
    expandedGroupIds.removeWhere((id) => !validIds.contains(id));
  }
}

class _VotingGroupState {
  final votings = <HorizontalPropertyVoting>[].obs;
  final isLoading = false.obs;
  final errorMessage = RxnString();
  final RxSet<int> expandedVotingIds = <int>{}.obs;
  final Map<int, _VotingDetailState> details = {};
}

class _VotingDetailState {
  final options = <HorizontalPropertyVotingOption>[].obs;
  final votes = <HorizontalPropertyVotingVote>[].obs;
  final optionsLoading = false.obs;
  final votesLoading = false.obs;
  final optionsError = RxnString();
  final votesError = RxnString();
  final RxSet<int> deletingOptionIds = <int>{}.obs;
  final RxSet<int> deletingVoteIds = <int>{}.obs;
}
