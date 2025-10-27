/**
 * Server Action: Remover Permiso de un Rol
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { RemoveRolePermissionUseCase } from '../../../application/roles/remove-role-permission.use-case';
import { RemoveRolePermissionRepository } from '../../../infrastructure/repositories/roles/remove-role-permission.repository';
import { RemoveRolePermissionInput, RemoveRolePermissionResult } from '../../../domain/entities';

export async function removeRolePermissionAction(
  input: RemoveRolePermissionInput,
  token: string
): Promise<RemoveRolePermissionResult> {
  try {
    const removeRolePermissionRepository = new RemoveRolePermissionRepository();
    const removeRolePermissionUseCase = new RemoveRolePermissionUseCase(removeRolePermissionRepository);
    
    return await removeRolePermissionUseCase.execute(input, token);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

