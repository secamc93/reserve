import 'package:rupu/domain/infrastructure/datasources/user_datasource.dart';
import 'package:rupu/domain/repositories/user_repository.dart';

class UserRepositoryImpl extends UserRepository {
  final UserDatasource datasource;
  UserRepositoryImpl(this.datasource);

  @override
  Future getUser({String? email, String? password}) {
    return datasource.getUser(email: email, password: password);
  }
}
