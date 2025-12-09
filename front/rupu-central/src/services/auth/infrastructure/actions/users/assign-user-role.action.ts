/**
 * Server Action: Asignar Roles a Usuario
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { AuthUseCasesInput } from '../../../application';
import { AssignUserRoleParams } from '../../../domain/entities/assign-user-role.entity';

export interface AssignUserRoleResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function assignUserRoleAction(
  params: AssignUserRoleParams,
  authUseCases?: AuthUseCasesInput
): Promise<AssignUserRoleResult> {
  try {
    console.log('👤 assignUserRoleAction - Asignando roles:', {
      userId: params.user_id,
      assignmentsCount: params.assignments.length,
    });
    
    // Usar interfaz inyectada o crear nueva instancia
    const useCases = authUseCases || new (await import('../../../application')).AuthUseCases();
    const result = await useCases.users.UseCaseAssignUserRole.execute(params);

    console.log('✅ Roles asignados exitosamente');

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('❌ Error en assignUserRoleAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

