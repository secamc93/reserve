/**
 * Server Action: Eliminar Permiso
 * IMPORTANTE: Este archivo es server-only
 */

'use server';

import { DeletePermissionUseCase } from '../../application';
import { PermissionsRepository } from '../repositories';
import { DeletePermissionParams } from '../../domain/entities';

export interface DeletePermissionResult {
  success: boolean;
  error?: string;
  message?: string;
}

export async function deletePermissionAction(
  params: DeletePermissionParams
): Promise<DeletePermissionResult> {
  try {
    const permissionsRepository = new PermissionsRepository();
    const deletePermissionUseCase = new DeletePermissionUseCase(permissionsRepository);

    await deletePermissionUseCase.execute(params);

    return {
      success: true,
      message: 'Permiso eliminado exitosamente',
    };
  } catch (error) {
    console.error('Error en deletePermissionAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
