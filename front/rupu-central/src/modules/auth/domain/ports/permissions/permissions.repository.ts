/**
 * Puerto para el repositorio de permisos
 */

import { UserPermissions } from '../../entities/permissions.entity';
import { PermissionsList } from '../../entities/permission.entity';
import { GetPermissionByIdParams, GetPermissionByIdResponse } from '../../entities/get-permission-by-id.entity';
import { DeletePermissionParams, DeletePermissionResponse } from '../../entities/delete-permission.entity';
import { UpdatePermissionParams, UpdatePermissionResponse } from '../../entities/update-permission.entity';
import { CreatePermissionInput, CreatePermissionResult } from '../../entities/create-permission.entity';

export interface GetPermissionsParams {
  business_type_id?: number;
}

export interface IPermissionsRepository {
  getRolesAndPermissions(businessId: number, token: string): Promise<UserPermissions>;
  getPermissions(token: string, params?: GetPermissionsParams): Promise<PermissionsList>;
  getPermissionById(params: GetPermissionByIdParams): Promise<GetPermissionByIdResponse>;
  deletePermission(params: DeletePermissionParams): Promise<DeletePermissionResponse>;
  updatePermission(params: UpdatePermissionParams): Promise<UpdatePermissionResponse>;
  createPermission(input: CreatePermissionInput, token: string): Promise<CreatePermissionResult>;
}

