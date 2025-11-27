import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:rupu/domain/entities/horizontal_property_voting.dart';

import 'package:rupu/domain/entities/horizontal_property_action_result.dart';
import 'package:rupu/domain/repositories/horizontal_properties_repository.dart';

import 'horizontal_property_voting_controller.dart';

class VotingLiveController extends GetxController {
  final HorizontalPropertyVotingController parent;
  final int groupId;
  final int votingId;

  VotingLiveController({
    required this.parent,
    required this.groupId,
    required this.votingId,
  }) : _repository = parent.repository;

  final HorizontalPropertiesRepository _repository;
  StreamSubscription<HorizontalPropertyVotingGroupLiveData>? _subscription;

  final isConnecting = false.obs;
  final isPriming = true.obs;
  final errorMessage = RxnString();
  final liveData = Rxn<HorizontalPropertyVotingGroupLiveData>();
  final filter = ''.obs;
  final RxSet<int> _processingUnitIds = <int>{}.obs;
  final votingUnitSuggestions = <HorizontalPropertyVotingLiveUnit>[].obs;
  final votingUnitSuggestionsLoading = false.obs;
  final totalUnitsAllowed = RxnInt();
  final allowedUnitsLoading = false.obs;
  final selectedChartType = VotingChartType.doughnut.obs;

  late final TextEditingController searchCtrl;
  late final FocusNode searchFocus;

  HorizontalPropertiesRepository get repository => _repository;

  @override
  void onInit() {
    super.onInit();
    searchCtrl = TextEditingController();
    searchFocus = FocusNode();
    searchFocus.addListener(() {
      if (!searchFocus.hasFocus) {
        clearVotingUnitSuggestions();
      }
    });

    Future.microtask(() async {
      if (isClosed) return;
      try {
        await Future.wait([
          _loadAllowedUnitsCount(),
          parent.loadVotingOptions(
            groupId: groupId,
            votingId: votingId,
            force: true,
          ),
          parent.loadVotingVotes(
            groupId: groupId,
            votingId: votingId,
            force: true,
          ),
          _loadInitialDetails(),
        ]);
      } catch (error, stackTrace) {
        debugPrint('Error preparando datos de votación en vivo: $error');
        debugPrint('Stack: $stackTrace');
      } finally {
        if (!isClosed) {
          isPriming.value = false;
        }
      }
      if (isClosed) return;
      _subscribe();
    });
  }

  List<HorizontalPropertyVotingLiveUnit> get liveUnits =>
      liveData.value?.units ?? const [];

  List<HorizontalPropertyVotingLiveResult> get liveResults =>
      liveData.value?.results ?? const [];

  int get totalUnits {
    final allowed = totalUnitsAllowed.value;
    if (allowed != null && allowed > 0) {
      return allowed;
    }
    final provided = liveData.value?.totalUnits;
    if (provided != null && provided > 0) {
      return provided;
    }
    final units = liveUnits;
    if (units.isNotEmpty) {
      return units.length;
    }
    final pending = liveData.value?.unitsPending;
    if (pending != null && pending >= 0) {
      final fromResults = liveResults.fold<int>(
        0,
        (sum, item) => sum + item.voteCount,
      );
      return fromResults + pending;
    }
    return 0;
  }

  int get allowedVotingUnits {
    final allowed = totalUnitsAllowed.value;
    if (allowed != null && allowed > 0) {
      return allowed;
    }
    return totalUnits;
  }

  List<HorizontalPropertyVotingLiveUnit> get pendingUnits {
    final units = liveUnits
        .where((unit) => !unit.hasVoted)
        .toList(growable: false);
    units.sort((a, b) => a.unitNumber.compareTo(b.unitNumber));
    return units;
  }

  int get unitsVoted {
    final provided = liveData.value?.unitsVoted;
    if (provided != null && provided >= 0) {
      return provided;
    }
    final votes = liveData.value?.votes;
    if (votes != null && votes.isNotEmpty) {
      return votes.length;
    }
    if (liveResults.isNotEmpty) {
      return liveResults.fold<int>(0, (sum, item) => sum + item.voteCount);
    }
    return liveUnits.where((unit) => unit.hasVoted).length;
  }

  int get unitsPending {
    final total = totalUnits;
    if (total > 0) {
      return math.max(0, total - unitsVoted);
    }

    final pendingFromData = liveData.value?.unitsPending;
    if (pendingFromData != null && pendingFromData >= 0) {
      return pendingFromData;
    }
    return 0;
  }

  List<HorizontalPropertyVotingLiveUnit> get filteredUnits {
    final query = filter.value.trim().toLowerCase();
    final units = liveUnits;
    Iterable<HorizontalPropertyVotingLiveUnit> filtered;
    if (query.isEmpty) {
      filtered = units;
    } else {
      filtered = units.where((unit) {
        final unitNumber = unit.unitNumber.toLowerCase();
        final resident = unit.residentName?.toLowerCase() ?? '';
        return unitNumber.contains(query) || resident.contains(query);
      });
    }
    final list = filtered.toList(growable: false);
    list.sort((a, b) {
      final pendingComparison = (a.hasVoted ? 1 : 0).compareTo(
        b.hasVoted ? 1 : 0,
      );
      if (pendingComparison != 0) {
        return pendingComparison;
      }
      return a.unitNumber.compareTo(b.unitNumber);
    });
    return list;
  }

  List<HorizontalPropertyVotingOption> get options =>
      parent.optionsForVoting(groupId, votingId);

  Map<int, int> get voteSummary => parent.voteSummary(groupId, votingId);

  int get totalVotes => parent.totalVotesFor(groupId, votingId);

  int get totalVotesFromUnits {
    final votes = liveData.value?.votes;
    if (votes != null && votes.isNotEmpty) {
      return votes.length;
    }
    if (liveResults.isNotEmpty) {
      return liveResults.fold<int>(0, (sum, item) => sum + item.voteCount);
    }
    final units = liveUnits;
    if (units.isNotEmpty) {
      return units.where((unit) => unit.hasVoted).length;
    }
    return parent.totalVotesFor(groupId, votingId);
  }

  int countForOption(int optionId) {
    final units = liveUnits;
    if (units.isNotEmpty) {
      return units.where((unit) => unit.votingOptionId == optionId).length;
    }

    final votes =
        liveData.value?.votes ?? const <HorizontalPropertyVotingVote>[];
    if (votes.isNotEmpty) {
      return votes.where((vote) => vote.votingOptionId == optionId).length;
    }

    for (final result in liveResults) {
      if (result.votingOptionId == optionId) {
        return result.voteCount;
      }
    }
    return voteSummary[optionId] ?? 0;
  }

  HorizontalPropertyVotingOption? optionByCode(String code) {
    if (code.isEmpty) return null;
    final normalized = code.trim().toLowerCase();
    return options.firstWhereOrNull(
      (option) =>
          option.optionCode.toLowerCase() == normalized ||
          option.optionText.trim().toLowerCase() == normalized,
    );
  }

  int countForOptionCode(String code) {
    final option = optionByCode(code);
    if (option == null) return 0;
    return countForOption(option.id);
  }

  double get totalCoefficient => liveUnits.fold<double>(
    0,
    (value, unit) => value + (unit.participationCoefficient ?? 0.0),
  );

  double coefficientForOption(int optionId) {
    final units = liveUnits;
    if (units.isEmpty) return 0;
    return units
        .where((unit) => unit.votingOptionId == optionId)
        .fold<double>(
          0,
          (value, unit) => value + (unit.participationCoefficient ?? 0.0),
        );
  }

  double get votedCoefficient => liveUnits.fold<double>(
    0,
    (value, unit) =>
        unit.hasVoted ? value + (unit.participationCoefficient ?? 0.0) : value,
  );

  double get pendingCoefficient => totalCoefficient - votedCoefficient;

  HorizontalPropertyVotingLiveResult? resultForOption(int optionId) {
    for (final result in liveResults) {
      if (result.votingOptionId == optionId) {
        return result;
      }
    }
    return null;
  }

  void _subscribe() {
    isConnecting.value = true;
    errorMessage.value = null;

    _subscription?.cancel();

    final stream = _repository.subscribeToVotingLiveData(
      businessId: parent.propertyId,
      groupId: groupId,
      votingId: votingId,
    );

    _subscription = stream.listen(
      (event) {
        Future.microtask(() {
          if (isClosed) return;
          _ingestLiveEvent(event);
          isConnecting.value = false;
          errorMessage.value = null;
          if (event.hasVotesSnapshot) {
            parent.syncVotesFromLive(
              groupId: groupId,
              votingId: votingId,
              votes: event.votes,
            );
          }
        });
      },
      onError: (Object error, StackTrace stackTrace) {
        debugPrint('SSE error: $error');
        debugPrint('SSE stack: $stackTrace');

        Future.microtask(() {
          if (isClosed) return;
          isConnecting.value = false;
          errorMessage.value = _describeStreamError(error);
        });
      },
      onDone: () {
        Future.microtask(() {
          if (isClosed) return;
          isConnecting.value = false;
        });
      },
      cancelOnError: false,
    );
  }

  void _ingestLiveEvent(HorizontalPropertyVotingGroupLiveData event) {
    final previous = liveData.value;

    final eventName = event.eventName?.toLowerCase();
    final isDeleteEvent = eventName == 'vote_deleted';

    final previousResultsById = {
      for (final result
          in previous?.results ?? const <HorizontalPropertyVotingLiveResult>[])
        result.votingOptionId: result,
    };

    final previousVotes =
        previous?.votes ?? const <HorizontalPropertyVotingVote>[];
    final previousVotesByUnit = {
      for (final vote in previousVotes) vote.propertyUnitId: vote,
    };
    final previousVotesById = {for (final vote in previousVotes) vote.id: vote};

    var mergedUnits = event.hasUnitsSnapshot
        ? event.units
        : _mergeUnits(previous?.units ?? const [], event.units);

    var mergedResults = event.hasResultsSnapshot
        ? event.results
        : _mergeResults(previous?.results ?? const [], event.results);

    final List<HorizontalPropertyVotingVote> incomingVotes =
        isDeleteEvent && !event.hasVotesSnapshot
        ? const <HorizontalPropertyVotingVote>[]
        : event.votes;

    var mergedVotes = event.hasVotesSnapshot
        ? incomingVotes
        : _mergeVotes(previousVotes, incomingVotes);

    HorizontalPropertyVotingVote? deletedVote;
    if (isDeleteEvent) {
      if (event.votes.isNotEmpty) {
        deletedVote = event.votes.last;
      } else if (event.removedVoteId != null) {
        deletedVote = previousVotesById[event.removedVoteId!];
      } else if (event.removedVoteVotingId != null) {
        for (var i = mergedVotes.length - 1; i >= 0; i--) {
          final candidate = mergedVotes[i];
          if (candidate.votingOptionId == event.removedVoteVotingId) {
            deletedVote = candidate;
            break;
          }
        }
      }
    }

    if (event.removedVoteId != null) {
      mergedVotes = mergedVotes
          .where((vote) => vote.id != event.removedVoteId)
          .toList(growable: false);
    } else if (deletedVote != null) {
      final removedUnitId = deletedVote.propertyUnitId;
      mergedVotes = mergedVotes
          .where((vote) => vote.propertyUnitId != removedUnitId)
          .toList(growable: false);
    }

    final incomingResultsById = {
      for (final result in event.results) result.votingOptionId: result,
    };

    final bool shouldAdjustResults =
        !event.hasResultsSnapshot && event.results.isEmpty;

    if (!isDeleteEvent && !event.hasVotesSnapshot && incomingVotes.isNotEmpty) {
      final removedUnitIds = <int>{};
      for (final vote in incomingVotes) {
        final previousVote = previousVotesByUnit[vote.propertyUnitId];
        if (previousVote == null) continue;
        if (previousVote.id == vote.id) continue;

        final sameOption = previousVote.votingOptionId == vote.votingOptionId;
        final previousCount =
            previousResultsById[previousVote.votingOptionId]?.voteCount;
        final newCount = incomingResultsById[vote.votingOptionId]?.voteCount;
        final countsDecreased =
            previousCount != null &&
            newCount != null &&
            newCount < previousCount;
        final pendingIncreased = () {
          final previousPending = previous?.unitsPending;
          final nextPending = event.unitsPending;
          if (previousPending == null ||
              previousPending < 0 ||
              nextPending < 0) {
            return false;
          }
          return nextPending > previousPending;
        }();

        if ((sameOption && (countsDecreased || pendingIncreased)) ||
            (!sameOption && countsDecreased)) {
          removedUnitIds.add(vote.propertyUnitId);
        }
      }
      if (removedUnitIds.isNotEmpty) {
        mergedVotes = mergedVotes
            .where((vote) => !removedUnitIds.contains(vote.propertyUnitId))
            .toList(growable: false);
      }
    }

    if (shouldAdjustResults) {
      if (!isDeleteEvent &&
          !event.hasVotesSnapshot &&
          incomingVotes.isNotEmpty) {
        for (final vote in incomingVotes) {
          mergedResults = _applyVoteDeltaToResults(
            mergedResults,
            vote.votingOptionId,
            1,
          );
        }
      } else if (isDeleteEvent && deletedVote != null) {
        mergedResults = _applyVoteDeltaToResults(
          mergedResults,
          deletedVote.votingOptionId,
          -1,
        );
      }
    }

    final votesByUnit = <int, HorizontalPropertyVotingVote>{};
    for (final vote in mergedVotes) {
      votesByUnit[vote.propertyUnitId] = vote;
    }

    final optionsById = {
      for (final option in parent.optionsForVoting(groupId, votingId))
        option.id: option,
    };

    mergedUnits = mergedUnits
        .map((unit) {
          final vote = votesByUnit[unit.propertyUnitId];
          if (vote != null) {
            final option = optionsById[vote.votingOptionId];
            return unit.copyWith(
              hasVoted: true,
              votingOptionId: vote.votingOptionId,
              optionText: option?.optionText ?? unit.optionText,
              optionCode: option?.optionCode ?? unit.optionCode,
              optionColor: option?.color ?? unit.optionColor,
              votedAt: vote.votedAt ?? unit.votedAt,
            );
          }
          return unit.copyWith(
            hasVoted: false,
            votingOptionId: null,
            optionText: null,
            optionCode: null,
            optionColor: null,
            votedAt: null,
          );
        })
        .toList(growable: false);

    final providedUnits = event.hasUnitsSnapshot || event.units.isNotEmpty;

    var computedUnitsVoted = () {
      if (votesByUnit.isNotEmpty) {
        return votesByUnit.length;
      }
      if (event.unitsVoted >= 0) {
        return event.unitsVoted;
      }
      return previous?.unitsVoted ?? 0;
    }();

    if (event.unitsVoted < 0) {
      if (!isDeleteEvent &&
          !event.hasVotesSnapshot &&
          incomingVotes.isNotEmpty) {
        computedUnitsVoted += incomingVotes.length;
      } else if (isDeleteEvent && deletedVote != null) {
        computedUnitsVoted = math.max(0, computedUnitsVoted - 1);
      }
    }

    final computedTotalUnits = () {
      if (providedUnits) {
        if (event.totalUnits >= 0) {
          return event.totalUnits;
        }
        if (mergedUnits.isNotEmpty) {
          return mergedUnits.length;
        }
      }
      if (event.totalUnits >= 0) {
        return event.totalUnits;
      }
      return previous?.totalUnits ?? mergedUnits.length;
    }();

    final computedPending = () {
      if (event.unitsPending >= 0) {
        return event.unitsPending;
      }
      final pending = computedTotalUnits - computedUnitsVoted;
      return pending < 0 ? 0 : pending;
    }();

    final timestamp = event.timestamp ?? DateTime.now();

    liveData.value = HorizontalPropertyVotingGroupLiveData(
      totalUnits: computedTotalUnits,
      unitsPending: computedPending,
      unitsVoted: computedUnitsVoted,
      units: mergedUnits,
      results: mergedResults,
      votes: mergedVotes,
      hasResultsSnapshot: event.hasResultsSnapshot,
      hasVotesSnapshot: event.hasVotesSnapshot,
      hasUnitsSnapshot: event.hasUnitsSnapshot,
      timestamp: timestamp,
      eventName: event.eventName,
    );

    if (totalUnitsAllowed.value == null && computedTotalUnits > 0) {
      totalUnitsAllowed.value = computedTotalUnits;
    }

    parent.syncVotesFromLive(
      groupId: groupId,
      votingId: votingId,
      votes: mergedVotes,
    );
  }

  List<HorizontalPropertyVotingLiveUnit> _mergeUnits(
    List<HorizontalPropertyVotingLiveUnit> base,
    List<HorizontalPropertyVotingLiveUnit> updates,
  ) {
    if (updates.isEmpty) {
      return List<HorizontalPropertyVotingLiveUnit>.of(base);
    }
    if (base.isEmpty) {
      return updates;
    }

    final map = {for (final unit in base) unit.propertyUnitId: unit};
    final order = List<int>.of(map.keys);

    for (final unit in updates) {
      if (!map.containsKey(unit.propertyUnitId)) {
        order.add(unit.propertyUnitId);
      }
      map[unit.propertyUnitId] = unit;
    }

    return [for (final id in order) map[id]!];
  }

  List<HorizontalPropertyVotingLiveResult> _mergeResults(
    List<HorizontalPropertyVotingLiveResult> base,
    List<HorizontalPropertyVotingLiveResult> updates,
  ) {
    if (updates.isEmpty) {
      return List<HorizontalPropertyVotingLiveResult>.of(base);
    }
    if (base.isEmpty) {
      return updates;
    }

    final map = {for (final result in base) result.votingOptionId: result};
    for (final result in updates) {
      map[result.votingOptionId] = result;
    }
    return map.values.toList(growable: false);
  }

  List<HorizontalPropertyVotingLiveResult> _applyVoteDeltaToResults(
    List<HorizontalPropertyVotingLiveResult> base,
    int optionId,
    int delta,
  ) {
    if (delta == 0) return base;

    final map = {for (final result in base) result.votingOptionId: result};
    final existing = map[optionId];
    final option = parent.optionById(
      groupId: groupId,
      votingId: votingId,
      optionId: optionId,
    );

    final nextCount = math.max(0, (existing?.voteCount ?? 0) + delta);

    map[optionId] = HorizontalPropertyVotingLiveResult(
      votingOptionId: optionId,
      optionText: existing?.optionText ?? option?.optionText ?? '',
      optionCode: existing?.optionCode ?? option?.optionCode ?? '',
      color: existing?.color ?? option?.color,
      voteCount: nextCount,
      percentage: existing?.percentage ?? 0,
    );

    return map.values.toList(growable: false);
  }

  List<HorizontalPropertyVotingVote> _mergeVotes(
    List<HorizontalPropertyVotingVote> base,
    List<HorizontalPropertyVotingVote> updates,
  ) {
    if (updates.isEmpty) {
      return List<HorizontalPropertyVotingVote>.of(base);
    }
    if (base.isEmpty) {
      return updates;
    }

    final map = {for (final vote in base) vote.id: vote};
    for (final vote in updates) {
      map[vote.id] = vote;
    }
    final merged = map.values.toList(growable: false);
    merged.sort((a, b) => a.id.compareTo(b.id));
    return merged;
  }

  Future<void> _loadAllowedUnitsCount() async {
    if (allowedUnitsLoading.value) return;
    allowedUnitsLoading.value = true;
    try {
      final result = await _repository.getHorizontalPropertyUnits(
        id: parent.propertyId,
        query: {
          'page_size': 1,
          if (parent.propertyId > 0) 'business_id': parent.propertyId,
        },
      );
      if (result.totalUnits > 0) {
        totalUnitsAllowed.value = result.totalUnits;
      }
    } catch (_) {
      // no-op
    } finally {
      allowedUnitsLoading.value = false;
    }
  }

  Future<void> _loadInitialDetails() async {
    try {
      final result = await _repository.getHorizontalPropertyVotingDetails(
        businessId: parent.propertyId,
        groupId: groupId,
        votingId: votingId,
      );
      if (isClosed) return;
      if (!result.success && result.units.isEmpty) {
        return;
      }
      final current = liveData.value;
      liveData.value = HorizontalPropertyVotingGroupLiveData(
        totalUnits: result.totalUnits,
        unitsPending: result.unitsPending,
        unitsVoted: result.unitsVoted,
        units: result.units,
        results: current?.results ?? const [],
        votes: current?.votes ?? const [],
        hasResultsSnapshot: current?.hasResultsSnapshot ?? false,
        hasVotesSnapshot: current?.hasVotesSnapshot ?? false,
        hasUnitsSnapshot: true,
        timestamp: DateTime.now(),
        eventName: current?.eventName,
      );
    } catch (error, stackTrace) {
      debugPrint('Error obteniendo detalles de votación: $error');
      debugPrint('Stack: $stackTrace');
    }
  }

  Future<void> refreshUnitsSnapshot({bool refreshVotes = false}) async {
    await _loadInitialDetails();
    if (!refreshVotes || isClosed) return;
    try {
      await parent.loadVotingVotes(
        groupId: groupId,
        votingId: votingId,
        force: true,
      );
    } catch (error, stackTrace) {
      debugPrint('Error refrescando votos en vivo: $error');
      debugPrint('Stack: $stackTrace');
    }
  }

  String _describeStreamError(Object error) {
    if (error is StateError && error.message.isNotEmpty) {
      return error.message;
    }
    return 'No se pudo conectar con la transmisión en vivo.';
  }

  void setFilter(String value) {
    filter.value = value;
  }

  void clearFilter() {
    filter.value = '';
  }

  bool isProcessing(int unitId) => _processingUnitIds.contains(unitId);

  Future<void> reconnect() async {
    await _subscription?.cancel();
    if (liveData.value == null) {
      isPriming.value = true;
    }
    _subscribe();
  }

  void searchUnits(String query) {
    final trimmed = query.trim().toLowerCase();
    if (trimmed.isEmpty) {
      votingUnitSuggestions.clear();
      votingUnitSuggestionsLoading.value = false;
      return;
    }

    votingUnitSuggestionsLoading.value = true;
    try {
      // Search only in pending units (not voted yet)
      final matches = pendingUnits.where((unit) {
        final number = unit.unitNumber.toLowerCase();
        final resident = unit.residentName?.toLowerCase() ?? '';
        return number.contains(trimmed) || resident.contains(trimmed);
      }).toList();

      votingUnitSuggestions.assignAll(matches);
    } finally {
      votingUnitSuggestionsLoading.value = false;
    }
  }

  void clearVotingUnitSuggestions() {
    votingUnitSuggestions.clear();
    votingUnitSuggestionsLoading.value = false;
  }

  Future<HorizontalPropertyActionResult> castVote({
    required int propertyUnitId,
    required int optionId,
  }) async {
    if (_processingUnitIds.contains(propertyUnitId)) {
      return const HorizontalPropertyActionResult(success: false);
    }
    _processingUnitIds.add(propertyUnitId);
    try {
      final result = await parent.createVote(
        groupId: groupId,
        votingId: votingId,
        data: {
          'property_unit_id': propertyUnitId,
          'voting_option_id': optionId,
          'ip_address': 'mobile-app',
          'user_agent': 'mobile-app',
        },
      );
      return result;
    } finally {
      _processingUnitIds.remove(propertyUnitId);
    }
  }

  Future<HorizontalPropertyActionResult> removeVote({
    required int propertyUnitId,
  }) async {
    final vote = parent.voteForUnit(
      groupId: groupId,
      votingId: votingId,
      propertyUnitId: propertyUnitId,
    );
    if (vote == null) {
      return const HorizontalPropertyActionResult(
        success: false,
        message: 'No se encontró un voto registrado para la unidad.',
      );
    }
    if (_processingUnitIds.contains(propertyUnitId)) {
      return const HorizontalPropertyActionResult(success: false);
    }
    _processingUnitIds.add(propertyUnitId);
    try {
      final result = await parent.deleteVote(
        groupId: groupId,
        votingId: votingId,
        voteId: vote.id,
      );
      return result;
    } finally {
      _processingUnitIds.remove(propertyUnitId);
    }
  }

  @override
  void onClose() {
    closeLiveStream();
    searchCtrl.dispose();
    searchFocus.dispose();
    _subscription?.cancel();
    super.onClose();
  }

  void closeLiveStream() {
    _subscription?.cancel();
    _subscription = null;
  }
}

enum VotingChartType { doughnut, pie, bar, column, radialBar }
