/**
 * Puerto para crear permisos
 */

import { CreatePermissionInput, CreatePermissionResult } from '../../entities/create-permission.entity';

export interface ICreatePermissionRepository {
  createPermission(input: CreatePermissionInput, token: string): Promise<CreatePermissionResult>;
}

