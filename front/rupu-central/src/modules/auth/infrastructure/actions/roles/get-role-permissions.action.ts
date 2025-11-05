/**
 * Server Action: Obtener Permisos de un Rol
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { GetRolePermissionsUseCase } from '../../../application/roles/get-role-permissions.use-case';
import { GetRolePermissionsRepository } from '../../../infrastructure/repositories/roles/get-role-permissions.repository';
import { GetRolePermissionsInput, GetRolePermissionsResult } from '../../../domain/entities';

export async function getRolePermissionsAction(
  input: GetRolePermissionsInput,
  token: string
): Promise<GetRolePermissionsResult> {
  try {
    const getRolePermissionsRepository = new GetRolePermissionsRepository();
    const getRolePermissionsUseCase = new GetRolePermissionsUseCase(getRolePermissionsRepository);
    
    return await getRolePermissionsUseCase.execute(input, token);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

