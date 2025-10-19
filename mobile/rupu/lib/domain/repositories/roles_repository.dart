import 'package:rupu/domain/entities/role.dart';

abstract class RolesRepository {
  Future<RolesCatalog> obtenerRoles();
}
