import 'package:rupu/domain/entities/role.dart';
import 'package:rupu/domain/infrastructure/models/roles_list_response_model.dart';

import 'permisos_roles_mapper.dart';

class RolesMapper {
  static RolesCatalog listToEntity(RolesListResponseModel model) => RolesCatalog(
        roles: model.data.map(PermisosRolesMapper.roleFromModel).toList(),
        count: model.count,
      );
}
