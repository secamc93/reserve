/**
 * Server Action: Asignar Permisos a Rol
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { AssignRolePermissionsUseCase } from '../../../application/roles/assign-role-permissions.use-case';
import { AssignRolePermissionsRepository } from '../../../infrastructure/repositories/roles/assign-role-permissions.repository';
import { AssignRolePermissionsInput, AssignRolePermissionsResult } from '../../../domain/entities';

export async function assignRolePermissionsAction(
  input: AssignRolePermissionsInput,
  token: string
): Promise<AssignRolePermissionsResult> {
  try {
    const assignRolePermissionsRepository = new AssignRolePermissionsRepository();
    const assignRolePermissionsUseCase = new AssignRolePermissionsUseCase(assignRolePermissionsRepository);
    
    return await assignRolePermissionsUseCase.execute(input, token);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

