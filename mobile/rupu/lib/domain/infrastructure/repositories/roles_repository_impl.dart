import 'package:rupu/domain/datasource/roles_datasource.dart';
import 'package:rupu/domain/entities/role.dart';
import 'package:rupu/domain/repositories/roles_repository.dart';

class RolesRepositoryImpl extends RolesRepository {
  final RolesDatasource datasource;

  RolesRepositoryImpl(this.datasource);

  @override
  Future<RolesCatalog> obtenerRoles() {
    return datasource.obtenerRoles();
  }
}
