class AssignRoleRequest {
  final Map<String, dynamic> request;

  AssignRoleRequest({required this.request});

  Map<String, dynamic> toJson() {
    return {'request': request};
  }
}
