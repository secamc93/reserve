/**
 * Infrastructure Layer - Permissions Repositories
 */

import { IPermissionsRepository } from '../../../domain/ports/permissions/permissions.repository';
import { UserPermissions } from '../../../domain/entities/permissions.entity';
import { PermissionsList } from '../../../domain/entities/permission.entity';
import { GetPermissionByIdParams, GetPermissionByIdResponse } from '../../../domain/entities/get-permission-by-id.entity';
import { DeletePermissionParams, DeletePermissionResponse } from '../../../domain/entities/delete-permission.entity';
import { UpdatePermissionParams, UpdatePermissionResponse } from '../../../domain/entities/update-permission.entity';
import { GetRolesAndPermissionsRepository } from './get-roles-and-permissions.repository';
import { GetPermissionsListRepository } from './get-permissions-list.repository';
import { GetPermissionByIdRepository } from './get-permission-by-id.repository';
import { DeletePermissionRepository } from './delete-permission.repository';
import { UpdatePermissionRepository } from './update-permission.repository';

// Repositorio Principal de Permisos con delegación
export class PermissionsRepository implements IPermissionsRepository {
  private getRolesAndPermissionsRepository: GetRolesAndPermissionsRepository;
  private getPermissionsListRepository: GetPermissionsListRepository;
  private getPermissionByIdRepository: GetPermissionByIdRepository;
  private deletePermissionRepository: DeletePermissionRepository;
  private updatePermissionRepository: UpdatePermissionRepository;

  constructor() {
    this.getRolesAndPermissionsRepository = new GetRolesAndPermissionsRepository();
    this.getPermissionsListRepository = new GetPermissionsListRepository();
    this.getPermissionByIdRepository = new GetPermissionByIdRepository();
    this.deletePermissionRepository = new DeletePermissionRepository();
    this.updatePermissionRepository = new UpdatePermissionRepository();
  }

  async getRolesAndPermissions(businessId: number, token: string): Promise<UserPermissions> {
    return this.getRolesAndPermissionsRepository.getRolesAndPermissions(businessId, token);
  }

  async getPermissions(token: string): Promise<PermissionsList> {
    return this.getPermissionsListRepository.getPermissions(token);
  }

  async getPermissionById(params: GetPermissionByIdParams): Promise<GetPermissionByIdResponse> {
    return this.getPermissionByIdRepository.getPermissionById(params);
  }

  async deletePermission(params: DeletePermissionParams): Promise<DeletePermissionResponse> {
    return this.deletePermissionRepository.deletePermission(params);
  }

  async updatePermission(params: UpdatePermissionParams): Promise<UpdatePermissionResponse> {
    return this.updatePermissionRepository.updatePermission(params);
  }
}

// Exportar repositorios específicos
export * from './get-roles-and-permissions.repository';
export * from './get-permissions-list.repository';
export * from './get-permission-by-id.repository';
export * from './delete-permission.repository';
export * from './update-permission.repository';

// Exportar interfaces de response y request
export * from './response';
export * from './request';
