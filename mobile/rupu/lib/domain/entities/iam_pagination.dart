class IamPagination {
  final int currentPage;
  final int perPage;
  final int total;
  final int lastPage;
  final bool hasNext;
  final bool hasPrev;

  const IamPagination({
    required this.currentPage,
    required this.perPage,
    required this.total,
    required this.lastPage,
    required this.hasNext,
    required this.hasPrev,
  });

  IamPagination copyWith({
    int? currentPage,
    int? perPage,
    int? total,
    int? lastPage,
    bool? hasNext,
    bool? hasPrev,
  }) {
    return IamPagination(
      currentPage: currentPage ?? this.currentPage,
      perPage: perPage ?? this.perPage,
      total: total ?? this.total,
      lastPage: lastPage ?? this.lastPage,
      hasNext: hasNext ?? this.hasNext,
      hasPrev: hasPrev ?? this.hasPrev,
    );
  }
}
