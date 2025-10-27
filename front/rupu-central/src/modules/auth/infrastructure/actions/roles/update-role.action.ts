/**
 * Server Action: Actualizar Rol
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { UpdateRoleUseCase } from '../../../application/roles/update-role.use-case';
import { UpdateRoleRepository } from '../../../infrastructure/repositories/roles/update-role.repository';
import { UpdateRoleInput, UpdateRoleResult } from '../../../domain/entities';

export async function updateRoleAction(
  input: UpdateRoleInput,
  token: string
): Promise<UpdateRoleResult> {
  try {
    const updateRoleRepository = new UpdateRoleRepository();
    const updateRoleUseCase = new UpdateRoleUseCase(updateRoleRepository);
    
    return await updateRoleUseCase.execute(input, token);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

