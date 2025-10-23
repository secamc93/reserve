/**
 * Puerto para el repositorio de permisos
 */

import { UserPermissions } from '../../entities/permissions.entity';
import { PermissionsList } from '../../entities/permission.entity';
import { GetPermissionByIdParams, GetPermissionByIdResponse } from '../../entities/get-permission-by-id.entity';
import { DeletePermissionParams, DeletePermissionResponse } from '../../entities/delete-permission.entity';
import { UpdatePermissionParams, UpdatePermissionResponse } from '../../entities/update-permission.entity';

export interface IPermissionsRepository {
  getRolesAndPermissions(businessId: number, token: string): Promise<UserPermissions>;
  getPermissions(token: string): Promise<PermissionsList>;
  getPermissionById(params: GetPermissionByIdParams): Promise<GetPermissionByIdResponse>;
  deletePermission(params: DeletePermissionParams): Promise<DeletePermissionResponse>;
  updatePermission(params: UpdatePermissionParams): Promise<UpdatePermissionResponse>;
}

