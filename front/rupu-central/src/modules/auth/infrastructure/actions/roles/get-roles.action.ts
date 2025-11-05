/**
 * Server Action: Obtener Roles
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { GetRolesUseCase } from '../../../application/roles/get-roles.use-case';
import { RolesRepository } from '../../repositories/roles/roles.repository';

interface RoleData {
  id: number;
  name: string;
  code: string;
  description: string;
  level: number;
  isSystem: boolean;
  scopeId: number;
  scopeName: string;
  scopeCode: string;
}

export interface GetRolesResult {
  success: boolean;
  data?: {
    roles: RoleData[];
    count: number;
  };
  error?: string;
}

export interface GetRolesActionParams {
  business_type_id?: number;
  scope_id?: number;
  is_system?: boolean;
  name?: string;
  level?: number;
}

export async function getRolesAction(
  token: string,
  params?: GetRolesActionParams
): Promise<GetRolesResult> {
  try {
    console.log('🔑 getRolesAction - Token recibido:', token ? 'Sí' : 'No');
    console.log('🔍 getRolesAction - Params:', params);
    
    const rolesRepository = new RolesRepository();
    const getRolesUseCase = new GetRolesUseCase(rolesRepository);
    
    const result = await getRolesUseCase.execute({ token, params });

    console.log('✅ Roles obtenidos del backend:', result.roles.count);

    return {
      success: true,
      data: {
        roles: result.roles.roles,
        count: result.roles.count,
      },
    };
  } catch (error) {
    console.error('❌ Error en getRolesAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

