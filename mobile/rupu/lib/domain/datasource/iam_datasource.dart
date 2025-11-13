import 'package:rupu/domain/infrastructure/models/iam/iam_business_types_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_businesses_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_resources_response_model.dart';
import 'package:rupu/domain/infrastructure/models/iam/iam_users_response_model.dart';

abstract class IamDatasource {
  Future<IamUsersResponseModel> getIamUsers({Map<String, dynamic>? query});

  Future<IamResourcesResponseModel> getResources({
    Map<String, dynamic>? query,
  });

  Future<IamBusinessTypesResponseModel> getBusinessTypes({
    Map<String, dynamic>? query,
  });

  Future<IamBusinessesResponseModel> getBusinesses({
    Map<String, dynamic>? query,
  });
}
