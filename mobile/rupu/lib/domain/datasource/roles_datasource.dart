import 'package:rupu/domain/entities/role.dart';

abstract class RolesDatasource {
  Future<RolesCatalog> obtenerRoles();
}
