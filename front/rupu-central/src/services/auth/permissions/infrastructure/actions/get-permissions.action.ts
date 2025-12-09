/**
 * Server Action: Obtener Roles y Permisos del Usuario
 * IMPORTANTE: Este archivo es server-only
 */

'use server';

import { GetPermissionsUseCase } from '../../application';
import { PermissionsRepository } from '../repositories';

interface GetPermissionsInput {
  businessId: number;
  token: string;
}

interface ResourcePermission {
  resource: string;
  actions: string[];
  active: boolean;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

export interface GetPermissionsResult {
  success: boolean;
  data?: {
    isSuperAdmin: boolean;
    roles: Role[];
    resources: ResourcePermission[];
  };
  error?: string;
}

export async function getPermissionsAction(input: GetPermissionsInput): Promise<GetPermissionsResult> {
  try {
    const permissionsRepository = new PermissionsRepository();
    const getPermissionsUseCase = new GetPermissionsUseCase(permissionsRepository);

    const result = await getPermissionsUseCase.execute(input);

    return {
      success: true,
      data: {
        isSuperAdmin: result.isSuperAdmin,
        roles: result.roles,
        resources: result.resources,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
