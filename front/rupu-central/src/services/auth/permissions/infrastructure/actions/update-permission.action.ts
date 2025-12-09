/**
 * Server Action: Actualizar Permiso
 * IMPORTANTE: Este archivo es server-only
 */

'use server';

import { UpdatePermissionUseCase } from '../../application';
import { PermissionsRepository } from '../repositories';
import { UpdatePermissionParams } from '../../domain/entities';

export interface UpdatePermissionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function updatePermissionAction(
  params: UpdatePermissionParams
): Promise<UpdatePermissionResult> {
  try {
    const permissionsRepository = new PermissionsRepository();
    const updatePermissionUseCase = new UpdatePermissionUseCase(permissionsRepository);

    const result = await updatePermissionUseCase.execute(params);

    return result;
  } catch (error) {
    console.error('Error en updatePermissionAction:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido al actualizar permiso',
    };
  }
}
