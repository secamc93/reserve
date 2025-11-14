import 'package:rupu/domain/infrastructure/models/iam/iam_actions_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_business_types_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_businesses_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_resources_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_users_response_model.dart';

abstract class IamDatasource {
  Future<IamUsersResponseModel> getUsers({Map<String, dynamic>? query});

  Future<IamResourcesResponseModel> getResources({
    Map<String, dynamic>? query,
  });

  Future<IamBusinessTypesResponseModel> getBusinessTypes({
    Map<String, dynamic>? query,
  });

  Future<IamBusinessesResponseModel> getBusinesses({
    Map<String, dynamic>? query,
  });

  Future<IamActionsResponseModel> getActions({Map<String, dynamic>? query});

  Future<Map<String, dynamic>> createResource(Map<String, dynamic> data);

  Future<Map<String, dynamic>> updateResource(
    int id,
    Map<String, dynamic> data,
  );

  Future<Map<String, dynamic>> deleteResource(int id);
}
