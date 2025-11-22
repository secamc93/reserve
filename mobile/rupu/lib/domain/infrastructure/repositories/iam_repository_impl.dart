import 'package:rupu/domain/datasource/iam_datasource.dart';
import 'package:rupu/domain/entities/iam_action.dart';
import 'package:rupu/domain/entities/iam_business.dart';
import 'package:rupu/domain/entities/iam_business_type.dart';
import 'package:rupu/domain/entities/iam_resource.dart';
import 'package:rupu/domain/entities/iam_user.dart';
import 'package:rupu/domain/entities/role.dart';
import 'package:rupu/domain/entities/iam_generate_password_result.dart';
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
        if (sortBy != null && sortBy.trim().isNotEmpty)
          'sort_by': sortBy.trim(),
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
  Future<IamBusinessTypeMutationResult> createBusinessType({
    required String name,
    required String code,
    String? description,
    required String icon,
    bool isActive = true,
  }) async {
    final payload = {
      'name': name,
      'code': code.trim().toLowerCase(),
      if (description != null && description.trim().isNotEmpty)
        'description': description.trim(),
      'icon': icon,
      'is_active': isActive,
    };
    final response = await datasource.createBusinessType(payload);
    final typeJson = response['data'] as Map<String, dynamic>?;
    final message =
        response['message']?.toString() ??
        'Tipo de negocio creado correctamente.';
    final success = response['success'] as bool? ?? true;
    return IamBusinessTypeMutationResult(
      success: success,
      message: message,
      type: typeJson == null ? null : IamMapper.businessTypeFromJson(typeJson),
    );
  }

  @override
  Future<IamBusinessTypeMutationResult> updateBusinessType({
    required int id,
    required String name,
    required String code,
    String? description,
    required String icon,
    bool isActive = true,
  }) async {
    final payload = {
      'name': name,
      'code': code.trim().toLowerCase(),
      if (description != null && description.trim().isNotEmpty)
        'description': description.trim(),
      'icon': icon,
      'is_active': isActive,
    };
    final response = await datasource.updateBusinessType(id, payload);
    final typeJson = response['data'] as Map<String, dynamic>?;
    final message =
        response['message']?.toString() ??
        'Tipo de negocio actualizado correctamente.';
    final success = response['success'] as bool? ?? true;
    return IamBusinessTypeMutationResult(
      success: success,
      message: message,
      type: typeJson == null ? null : IamMapper.businessTypeFromJson(typeJson),
    );
  }

  @override
  Future<IamMessageResult> deleteBusinessType(int id) async {
    final response = await datasource.deleteBusinessType(id);
    final success = response['success'] as bool? ?? true;
    final message =
        response['message']?.toString() ?? 'Tipo de negocio eliminado.';
    return IamMessageResult(success: success, message: message);
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

  @override
  Future<List<IamBusinessConfiguredResource>> getBusinessConfiguredResources(
    int businessId,
  ) async {
    final response = await datasource.getBusinessConfiguredResources(
      businessId: businessId,
    );
    return response.resources
        .map(IamMapper.configuredResourceFromModel)
        .toList();
  }

  @override
  Future<IamMessageResult> activateBusinessConfiguredResource(
    int resourceId, {
    int? businessId,
  }) async {
    final response = await datasource.activateBusinessConfiguredResource(
      resourceId,
      businessId: businessId,
    );
    final success = response['success'] as bool? ?? true;
    final message = response['message']?.toString() ?? 'Recurso activado';
    return IamMessageResult(success: success, message: message);
  }

  @override
  Future<IamMessageResult> deactivateBusinessConfiguredResource(
    int resourceId, {
    int? businessId,
  }) async {
    final response = await datasource.deactivateBusinessConfiguredResource(
      resourceId,
      businessId: businessId,
    );
    final success = response['success'] as bool? ?? true;
    final message = response['message']?.toString() ?? 'Recurso desactivado';
    return IamMessageResult(success: success, message: message);
  }

  @override
  Future<RolesCatalog> getRoles({
    int? businessTypeId,
    int? scopeId,
    bool? isSystem,
    String? name,
    int? level,
  }) async {
    final response = await datasource.getRoles(
      query: {
        if (businessTypeId != null) 'business_type_id': businessTypeId,
        if (scopeId != null) 'scope_id': scopeId,
        if (isSystem != null) 'is_system': isSystem,
        if (name != null && name.trim().isNotEmpty) 'name': name.trim(),
        if (level != null) 'level': level,
      },
    );

    final List<dynamic> data = response['data'] ?? [];
    final int count = response['count'] ?? 0;

    final roles = data
        .map(
          (json) => Role(
            id: json['id'],
            name: json['name'],
            code: json['code'] ?? '',
            description: json['description'] ?? '',
            level: json['level'],
            scopeId: json['scope_id'],
            scopeName: json['scope_name'],
            scopeCode: json['scope_code'],
            isSystem: json['is_system'] ?? false,
            businessTypeId: json['business_type_id'],
            businessTypeName: json['business_type_name'],
          ),
        )
        .toList();

    return RolesCatalog(roles: roles, count: count);
  }

  @override
  Future<IamGeneratePasswordResult> generatePassword(int userId) async {
    final response = await datasource.generatePassword(userId);
    return IamGeneratePasswordResult.fromJson(response);
  }
}
