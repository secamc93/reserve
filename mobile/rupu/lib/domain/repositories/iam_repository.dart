import 'package:rupu/domain/entities/iam_action.dart';
import 'package:rupu/domain/entities/iam_business.dart';
import 'package:rupu/domain/entities/iam_business_type.dart';
import 'package:rupu/domain/entities/iam_resource.dart';
import 'package:rupu/domain/entities/iam_user.dart';

abstract class IamRepository {
  Future<IamUsersPage> getUsers({
    int page,
    int pageSize,
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
  });

  Future<IamResourcesPage> getResources({
    int page,
    int pageSize,
    String? name,
  });

  Future<IamBusinessTypesResult> getBusinessTypes();

  Future<IamBusinessTypeMutationResult> createBusinessType({
    required String name,
    required String code,
    String? description,
    required String icon,
    bool isActive,
  });

  Future<IamBusinessTypeMutationResult> updateBusinessType({
    required int id,
    required String name,
    required String code,
    String? description,
    required String icon,
    bool isActive,
  });

  Future<IamMessageResult> deleteBusinessType(int id);

  Future<IamBusinessesPage> getBusinesses({
    int page,
    int perPage,
    String? name,
    int? businessTypeId,
    bool? isActive,
  });

  Future<IamActionsPage> getActions({
    int page,
    int pageSize,
    String? name,
  });

  Future<IamResourceMutationResult> createResource({
    required String name,
    int? businessTypeId,
    String? description,
  });

  Future<IamResourceMutationResult> updateResource({
    required int id,
    required String name,
    int? businessTypeId,
    String? description,
  });

  Future<IamMessageResult> deleteResource(int id);

  Future<List<IamBusinessConfiguredResource>> getBusinessConfiguredResources(
    int businessId,
  );

  Future<IamMessageResult> activateBusinessConfiguredResource(
    int resourceId, {
    int? businessId,
  });

  Future<IamMessageResult> deactivateBusinessConfiguredResource(
    int resourceId, {
    int? businessId,
  });
}
