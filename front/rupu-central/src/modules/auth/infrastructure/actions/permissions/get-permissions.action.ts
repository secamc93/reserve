/**
 * Server Action: Obtener Roles y Permisos
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { GetPermissionsUseCase } from '../../../application/permissions/get-permissions.use-case';
import { PermissionsRepository } from '../../../infrastructure/repositories/permissions';

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
    console.log('🔑 getPermissionsAction - BusinessId:', input.businessId, 'Token:', input.token ? 'Sí' : 'No');
    
    // Crear instancia del caso de uso con su repositorio
    const permissionsRepository = new PermissionsRepository();
    const getPermissionsUseCase = new GetPermissionsUseCase(permissionsRepository);
    
    // Ejecutar caso de uso
    const result = await getPermissionsUseCase.execute(input);

    return {
      success: true,
      data: {
        isSuperAdmin: result.permissions.isSuperAdmin,
        roles: result.permissions.roles,
        resources: result.permissions.resources,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

