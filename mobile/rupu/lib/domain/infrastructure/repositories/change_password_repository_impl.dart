import 'package:rupu/domain/infrastructure/datasources/change_password_datasource_impl.dart';
import 'package:rupu/domain/repositories/change_password_repository.dart';

class ChangePasswordRepositoryImpl extends ChangePasswordRepository {
  final ChangePasswordDatasourceImpl datasource;
  ChangePasswordRepositoryImpl(this.datasource);

  @override
  Future changePassword({String? currentPassword, String? newPassword}) {
    return datasource.changePassword(
      currentPassword: currentPassword ?? "",
      newPassword: newPassword ?? "",
    );
  }
}
