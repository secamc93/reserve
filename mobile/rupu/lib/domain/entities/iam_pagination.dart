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
}
