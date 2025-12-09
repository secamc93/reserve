/**
 * Puerto de dominio: Repositorio de Permissions
 */

import {
  PermissionsList,
  GetPermissionsParams,
  CreatePermissionParams,
  CreatePermissionResponse,
  UpdatePermissionParams,
  UpdatePermissionResponse,
  DeletePermissionParams,
  DeletePermissionResponse,
  GetPermissionByIdParams,
  GetPermissionByIdResponse,
} from '../entities/permission.entity';
import {
  UserPermissions,
  GetUserPermissionsParams,
} from '../entities/user-permissions.entity';

export interface IPermissionsRepository {
  getPermissions(params: GetPermissionsParams): Promise<PermissionsList>;
  getUserPermissions(params: GetUserPermissionsParams): Promise<UserPermissions>;
  getPermissionById(params: GetPermissionByIdParams): Promise<GetPermissionByIdResponse>;
  createPermission(params: CreatePermissionParams): Promise<CreatePermissionResponse>;
  updatePermission(params: UpdatePermissionParams): Promise<UpdatePermissionResponse>;
  deletePermission(params: DeletePermissionParams): Promise<DeletePermissionResponse>;
}
