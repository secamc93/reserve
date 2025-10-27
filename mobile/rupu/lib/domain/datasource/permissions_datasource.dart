import 'package:rupu/domain/entities/permission.dart';

abstract class PermissionsDatasource {
  Future<PermissionsCatalog> obtenerPermisos();
}
