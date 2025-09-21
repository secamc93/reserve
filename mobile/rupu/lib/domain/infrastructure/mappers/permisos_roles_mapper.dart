import 'package:rupu/domain/entities/roles_permisos.dart';
import 'package:rupu/domain/infrastructure/models/permisos_roles_response_model.dart';

class PermisosRolesMapper {
  /// Mapea la respuesta completa a la entidad de dominio [RolesPermisos].
  static RolesPermisos responseToEntity(PermisosRolesResponseModel model) =>
      _fromDataModel(model.data);

  static RolesPermisos _fromDataModel(AccessControlDataModel m) =>
      RolesPermisos(
        isSuper: m.isSuper,
        roles: m.roles.map(_roleFromModel).toList(),
        resources: m.resources.map(_resourceFromModel).toList(),
      );

  static Role _roleFromModel(RoleModel m) =>
      Role(id: m.id, name: m.name, description: m.description);

  static Resource _resourceFromModel(ResourceModel m) =>
      Resource(resource: m.resource, actions: m.actions, isActive: m.active);
}
