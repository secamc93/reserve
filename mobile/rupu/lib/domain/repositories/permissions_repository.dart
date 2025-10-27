import 'package:rupu/domain/entities/permission.dart';

abstract class PermissionsRepository {
  Future<PermissionsCatalog> obtenerPermisos();
}
