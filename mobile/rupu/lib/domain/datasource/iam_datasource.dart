import 'package:rupu/domain/infrastructure/models/iam/iam_actions_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_business_types_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_businesses_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_configured_resources_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_resources_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_users_response_model.dart';

abstract class IamDatasource {
  Future<IamUsersResponseModel> getUsers({Map<String, dynamic>? query});

  Future<IamResourcesResponseModel> getResources({Map<String, dynamic>? query});

  Future<IamBusinessTypesResponseModel> getBusinessTypes({
    Map<String, dynamic>? query,
  });

  Future<Map<String, dynamic>> createBusinessType(Map<String, dynamic> data);

  Future<Map<String, dynamic>> updateBusinessType(
    int id,
    Map<String, dynamic> data,
  );

  Future<Map<String, dynamic>> deleteBusinessType(int id);

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

  Future<IamConfiguredResourcesResponseModel> getBusinessConfiguredResources({
    required int businessId,
  });

  Future<Map<String, dynamic>> activateBusinessConfiguredResource(
    int resourceId, {
    int? businessId,
  });

  Future<Map<String, dynamic>> deactivateBusinessConfiguredResource(
    int resourceId, {
    int? businessId,
  });

  Future<Map<String, dynamic>> getRoles({Map<String, dynamic>? query});

  Future<Map<String, dynamic>> generatePassword(int userId);
}
