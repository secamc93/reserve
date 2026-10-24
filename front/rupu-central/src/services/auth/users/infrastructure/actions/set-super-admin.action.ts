/**
 * Server Action: Dar o quitar el rol de super admin a un usuario
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { UsersUseCases } from '../../application';
import { SetSuperAdminParams } from '../../domain/entities/set-super-admin.entity';
import { UsersRepository } from '../repositories';

export interface SetSuperAdminResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function setSuperAdminAction(params: SetSuperAdminParams, authUseCases?: UsersUseCases): Promise<SetSuperAdminResult> {
  try {
    const useCases = authUseCases || new UsersUseCases(new UsersRepository());
    const result = await useCases.UseCaseSetSuperAdmin.execute(params);
    return { success: true, message: result.message };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
