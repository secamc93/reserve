import 'package:rupu/domain/entities/permission.dart';
import 'package:rupu/domain/infrastructure/models/permissions_list_response_model.dart';

import 'permisos_roles_mapper.dart';

class PermissionsMapper {
  static PermissionsCatalog listToEntity(PermissionsListResponseModel model) =>
      PermissionsCatalog(
        permissions:
            model.data.map(PermisosRolesMapper.permissionFromModel).toList(),
        count: model.count,
      );
}
