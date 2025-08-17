'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/server/config/env';

export interface GetUserRolesPermissionsResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export async function getUserRolesPermissionsAction(): Promise<GetUserRolesPermissionsResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/roles-permissions`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al obtener permisos'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data || {}
    };
  } catch (error) {
    console.error('Get user roles permissions action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
} 