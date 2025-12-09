/**
 * Server Action: Eliminar Permiso
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { DeletePermissionUseCase } from '../../../application/permissions/delete-permission.use-case';
import { PermissionsRepository } from '../../repositories/permissions';

export interface DeletePermissionInput {
  id: number;
  token: string;
}

export interface DeletePermissionResult {
  success: boolean;
  error?: string;
}

export async function deletePermissionAction(input: DeletePermissionInput): Promise<DeletePermissionResult> {
  try {
    console.log('🗑️  deletePermissionAction - ID:', input.id);
    
    const permissionsRepository = new PermissionsRepository();
    const deletePermissionUseCase = new DeletePermissionUseCase(permissionsRepository);
    
    await deletePermissionUseCase.execute(input);

    console.log('✅ Permiso eliminado:', input.id);

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Error en deletePermissionAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

