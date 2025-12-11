/**
 * Server Action: Obtener Roles
 * IMPORTANTE: Este archivo es server-only
 * No importar directamente en Client Components
 */

'use server';

import { GetRolesUseCase } from '../../application/get-roles.use-case';
import { RolesRepository } from '../repositories/roles.repository';

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

export interface GetRolesActionParams {
  page?: number;
  page_size?: number;
  business_type_id?: number;
  scope_id?: number;
  is_system?: boolean;
  name?: string;
  level?: number;
  sort_by?: string;
  sort_order?: string;
}

export interface GetRolesResult {
  success: boolean;
  data?: {
    roles: RoleData[];
    count: number;
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  error?: string;
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

    console.log('✅ Roles obtenidos del backend:', result.roles.count, 'Total:', result.roles.count);

    // El repositorio ahora maneja la paginación y devuelve el total
    const pageSize = params?.page_size || 10;
    const currentPage = params?.page || 1;
    const totalPages = Math.ceil(result.roles.count / pageSize);

    return {
      success: true,
      data: {
        roles: result.roles.roles,
        count: result.roles.roles.length,
        total: result.roles.count,
        page: currentPage,
        page_size: pageSize,
        total_pages: totalPages,
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

