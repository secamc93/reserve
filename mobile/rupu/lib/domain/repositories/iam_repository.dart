import 'package:rupu/domain/entities/iam_business.dart';
import 'package:rupu/domain/entities/iam_business_type.dart';
import 'package:rupu/domain/entities/iam_resource.dart';
import 'package:rupu/domain/entities/iam_user.dart';

abstract class IamRepository {
  Future<IamUsersPage> getUsers({
    int page,
    int perPage,
    String? search,
  });

  Future<IamResourcesPage> getResources({
    int page,
    int pageSize,
    String? name,
  });

  Future<IamBusinessTypesResult> getBusinessTypes();

  Future<IamBusinessesPage> getBusinesses({
    int page,
    int perPage,
    String? name,
    int? businessTypeId,
    bool? isActive,
  });
}
