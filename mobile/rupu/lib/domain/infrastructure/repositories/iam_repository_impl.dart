import 'package:rupu/domain/datasource/iam_datasource.dart';
import 'package:rupu/domain/entities/iam_action.dart';
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
    int pageSize = 10,
    String? name,
    String? email,
    String? phone,
    String? userIds,
    bool? isActive,
    int? roleId,
    int? businessId,
    String? createdAt,
    String? sortBy,
    String? sortOrder,
  }) async {
    final response = await datasource.getUsers(
      query: {
        'page': page,
        'page_size': pageSize,
        if (name != null && name.trim().isNotEmpty) 'name': name.trim(),
        if (email != null && email.trim().isNotEmpty) 'email': email.trim(),
        if (phone != null && phone.trim().isNotEmpty) 'phone': phone.trim(),
        if (userIds != null && userIds.trim().isNotEmpty)
          'user_ids': userIds.trim(),
        if (isActive != null) 'is_active': isActive,
        if (roleId != null) 'role_id': roleId,
        if (businessId != null) 'business_id': businessId,
        if (createdAt != null && createdAt.trim().isNotEmpty)
          'created_at': createdAt.trim(),
        if (sortBy != null && sortBy.trim().isNotEmpty) 'sort_by': sortBy.trim(),
        if (sortOrder != null && sortOrder.trim().isNotEmpty)
          'sort_order': sortOrder.trim(),
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

  @override
  Future<IamActionsPage> getActions({
    int page = 1,
    int pageSize = 10,
    String? name,
  }) async {
    final response = await datasource.getActions(
      query: {
        'page': page,
        'page_size': pageSize,
        if (name != null && name.trim().isNotEmpty) 'name': name.trim(),
      },
    );
    return IamMapper.actionsResponseToEntity(response);
  }

  @override
  Future<IamResourceMutationResult> createResource({
    required String name,
    int? businessTypeId,
    String? description,
  }) async {
    final payload = {
      'name': name,
      if (businessTypeId != null) 'business_type_id': businessTypeId,
      if (description != null && description.trim().isNotEmpty)
        'description': description.trim(),
    };
    final response = await datasource.createResource(payload);
    final resourceJson = response['data'] as Map<String, dynamic>? ?? const {};
    final resource = IamMapper.resourceFromJson(resourceJson);
    final message = response['message']?.toString() ?? 'Recurso creado';
    final success = response['success'] as bool? ?? true;
    return IamResourceMutationResult(
      success: success,
      message: message,
      resource: resource,
    );
  }

  @override
  Future<IamResourceMutationResult> updateResource({
    required int id,
    required String name,
    int? businessTypeId,
    String? description,
  }) async {
    final payload = {
      'name': name,
      if (businessTypeId != null) 'business_type_id': businessTypeId,
      if (description != null && description.trim().isNotEmpty)
        'description': description.trim(),
    };
    final response = await datasource.updateResource(id, payload);
    final resourceJson = response['data'] as Map<String, dynamic>? ?? const {};
    final resource = IamMapper.resourceFromJson(resourceJson);
    final message = response['message']?.toString() ?? 'Recurso actualizado';
    final success = response['success'] as bool? ?? true;
    return IamResourceMutationResult(
      success: success,
      message: message,
      resource: resource,
    );
  }

  @override
  Future<IamMessageResult> deleteResource(int id) async {
    final response = await datasource.deleteResource(id);
    final success = response['success'] as bool? ?? true;
    final message = response['message']?.toString() ?? 'Recurso eliminado';
    return IamMessageResult(success: success, message: message);
  }
}
