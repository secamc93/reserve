class IamAction {
  final int id;
  final String name;
  final String description;

  const IamAction({
    required this.id,
    required this.name,
    required this.description,
  });
}

class IamActionsPage {
  final bool success;
  final List<IamAction> actions;
  final int total;
  final int page;
  final int pageSize;
  final int totalPages;

  const IamActionsPage({
    required this.success,
    required this.actions,
    required this.total,
    required this.page,
    required this.pageSize,
    required this.totalPages,
  });
}
