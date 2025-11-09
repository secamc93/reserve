/**
 * Server Action: Obtener lista de Permisos
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { GetPermissionsListUseCase } from '../../../application/permissions/get-permissions-list.use-case';
import { PermissionsRepository } from '../../../infrastructure/repositories/permissions';

interface PermissionData {
  id: number;
  name: string;
  description: string;
  resource: string;
  resourceId: number;
  action: string;
  actionId: number;
  scopeId: number;
  scopeName: string;
  scopeCode: string;
  businessTypeId?: number;
  businessTypeName?: string;
}

export interface GetPermissionsListResult {
  success: boolean;
  data?: {
    permissions: PermissionData[];
    total: number;
  };
  error?: string;
}

export async function getPermissionsListAction(
  token: string,
  params?: { business_type_id?: number }
): Promise<GetPermissionsListResult> {
  try {
    console.log('🔑 getPermissionsListAction - Token recibido:', token ? 'Sí' : 'No');
    console.log('🔍 getPermissionsListAction - Params:', params);
    
    const permissionsRepository = new PermissionsRepository();
    const getPermissionsListUseCase = new GetPermissionsListUseCase(permissionsRepository);
    
    const result = await getPermissionsListUseCase.execute({ token, params });

    console.log('✅ Permisos obtenidos del backend:', result.permissions.total);

    return {
      success: true,
      data: {
        permissions: result.permissions.permissions,
        total: result.permissions.total,
      },
    };
  } catch (error) {
    console.error('❌ Error en getPermissionsListAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

