import 'package:rupu/domain/infrastructure/models/permisos_roles_response_model.dart';

class RolesListResponseModel {
  final bool success;
  final List<RoleModel> data;
  final int count;

  RolesListResponseModel({
    required this.success,
    required this.data,
    required this.count,
  });

  factory RolesListResponseModel.fromJson(Map<String, dynamic> json) {
    final dataJson = json['data'];
    final roles = <RoleModel>[];

    if (dataJson is List) {
      for (final item in dataJson) {
        if (item is Map<String, dynamic>) {
          roles.add(RoleModel.fromJson(item));
        } else if (item is Map) {
          roles.add(RoleModel.fromJson(item.cast<String, dynamic>()));
        }
      }
    }

    return RolesListResponseModel(
      success: json['success'] as bool? ?? false,
      data: roles,
      count: (json['count'] as num?)?.toInt() ?? roles.length,
    );
  }
}
