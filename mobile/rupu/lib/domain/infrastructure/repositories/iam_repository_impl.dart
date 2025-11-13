import 'package:rupu/domain/datasource/iam_datasource.dart';
import 'package:rupu/domain/entities/iam_business.dart';
import 'package:rupu/domain/entities/iam_business_type.dart';
import 'package:rupu/domain/entities/iam_resource.dart';
import 'package:rupu/domain/entities/iam_user.dart';
import 'package:rupu/domain/infrastructure/datasources/iam_datasource_impl.dart';
import 'package:rupu/domain/infrastructure/mappers/iam_mapper.dart';
import 'package:rupu/domain/repositories/iam_repository.dart';

class IamRepositoryImpl extends IamRepository {
  final IamDatasource datasource;

  IamRepositoryImpl({IamDatasource? datasource})
      : datasource = datasource ?? IamDatasourceImpl();

  @override
  Future<IamUsersPage> getUsers({
    int page = 1,
    int perPage = 10,
    String? search,
  }) async {
    final response = await datasource.getIamUsers(
      query: {
        'page': page,
        'per_page': perPage,
        if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
      },
    );
    return IamMapper.usersResponseToEntity(response);
  }

  @override
  Future<IamResourcesPage> getResources({
    int page = 1,
    int pageSize = 10,
    String? name,
  }) async {
    final response = await datasource.getResources(
      query: {
        'page': page,
        'page_size': pageSize,
        if (name != null && name.trim().isNotEmpty) 'name': name.trim(),
      },
    );
    return IamMapper.resourcesResponseToEntity(response);
  }

  @override
  Future<IamBusinessTypesResult> getBusinessTypes() async {
    final response = await datasource.getBusinessTypes();
    return IamMapper.businessTypesToEntity(response);
  }

  @override
  Future<IamBusinessesPage> getBusinesses({
    int page = 1,
    int perPage = 10,
    String? name,
    int? businessTypeId,
    bool? isActive,
  }) async {
    final response = await datasource.getBusinesses(
      query: {
        'page': page,
        'per_page': perPage,
        if (name != null && name.trim().isNotEmpty) 'name': name.trim(),
        if (businessTypeId != null && businessTypeId > 0)
          'business_type_id': businessTypeId,
        if (isActive != null) 'is_active': isActive,
      },
    );
    return IamMapper.businessesResponseToEntity(response);
  }
}
