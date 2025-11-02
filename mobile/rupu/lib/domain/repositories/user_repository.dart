import 'package:rupu/domain/infrastructure/models/login_response_model.dart';

abstract class UserRepository {
  Future<LoginResponseModel> getUser({required String email, required String password});
  Future<String> getBusinessToken({required String token, required int businessId});
}
