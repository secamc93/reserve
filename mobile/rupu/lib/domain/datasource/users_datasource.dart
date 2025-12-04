import 'package:rupu/domain/infrastructure/models/login_response_model.dart';
import 'package:rupu/domain/infrastructure/models/simple_response_model.dart';

abstract class UsersDatasource {
  Future<LoginResponseModel> getUser({
    required String email,
    required String password,
  });
  Future<String> getBusinessToken({
    required String token,
    required int businessId,
  });
  Future<SimpleResponseModel> assignRole({
    required int userId,
    required Map<String, dynamic> request,
  });
}
