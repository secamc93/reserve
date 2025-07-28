import 'package:rupu/domain/infrastructure/datasources/cambiar_contrasena_datasource_impl.dart';
import 'package:rupu/domain/repositories/cambiar_contrasena_repository.dart';

class CambiarContrasenaRepositoryImpl extends CambiarContrasenaRepository {
  final CambiarContrasenaDatasourceImpl datasource;
  CambiarContrasenaRepositoryImpl(this.datasource);

  @override
  Future cambiarContrasena({String? currentPassword, String? newPassword}) {
    return datasource.cambiarContrasena(
      currentPassword: currentPassword ?? "",
      newPassword: newPassword ?? "",
    );
  }
}
