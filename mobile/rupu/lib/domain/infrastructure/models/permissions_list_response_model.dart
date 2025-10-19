import 'package:rupu/domain/infrastructure/models/permisos_roles_response_model.dart';

class PermissionsListResponseModel {
  final bool success;
  final List<PermissionModel> data;
  final int count;

  PermissionsListResponseModel({
    required this.success,
    required this.data,
    required this.count,
  });

  factory PermissionsListResponseModel.fromJson(Map<String, dynamic> json) {
    final dataJson = json['data'];
    final permissions = <PermissionModel>[];

    if (dataJson is List) {
      for (final item in dataJson) {
        if (item is Map<String, dynamic>) {
          permissions.add(PermissionModel.fromJson(item));
        } else if (item is Map) {
          permissions.add(PermissionModel.fromJson(item.cast<String, dynamic>()));
        }
      }
    }

    final total = json['total'] ?? json['count'];

    return PermissionsListResponseModel(
      success: json['success'] as bool? ?? false,
      data: permissions,
      count: (total as num?)?.toInt() ?? permissions.length,
    );
  }
}
