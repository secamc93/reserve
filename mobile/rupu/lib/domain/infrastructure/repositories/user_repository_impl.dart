import 'package:rupu/domain/infrastructure/datasources/user_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/models/login_response_model.dart';
import 'package:rupu/domain/repositories/user_repository.dart';

class UserRepositoryImpl extends UserRepository {
  final UserDatasource datasource;
  UserRepositoryImpl(this.datasource);

  @override
  Future<LoginResponseModel> getUser({
    required String email,
    required String password,
  }) {
    return datasource.getUser(email: email, password: password);
  }

  @override
  Future<String> getBusinessToken({
    required String token,
    required int businessId,
  }) {
    return datasource.getBusinessToken(token: token, businessId: businessId);
  }
}
