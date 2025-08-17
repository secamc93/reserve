'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/server/config/env';

export interface TableData {
  number: number;
  capacity: number;
  business_id: number;
  is_active?: boolean;
}

export async function getTablesAction(): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    console.log('🔍 [SERVER] getTablesAction iniciado...');
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    console.log('🌐 [SERVER] Llamando al backend para mesas:', `${getApiBaseUrl()}/api/v1/tables`);

    const response = await fetch(`${getApiBaseUrl()}/api/v1/tables`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    console.log('📡 [SERVER] Respuesta del backend (mesas):', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ [SERVER] Error del backend al obtener mesas:', errorData);
      return {
        success: false,
        message: errorData.message || 'Error al obtener mesas'
      };
    }

    const data = await response.json();
    console.log('✅ [SERVER] Mesas obtenidas exitosamente del backend');
    console.log('📊 [SERVER] Estructura de datos recibida:', {
      hasData: !!data,
      hasTables: !!(data && data.data),
      tablesCount: data?.data?.length || 0
    });
    
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error('💥 [SERVER] Error en getTablesAction:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
}

export async function getTableByIdAction(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/tables/${id}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al obtener mesa'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Get table by ID action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function createTableAction(tableData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/tables`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(tableData)),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al crear mesa'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Create table action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function updateTableAction(id: number, tableData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/tables/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(tableData)),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al actualizar mesa'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Update table action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function deleteTableAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/tables/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al eliminar mesa'
      };
    }

    return {
      success: true,
      message: 'Mesa eliminada exitosamente'
    };
  } catch (error) {
    console.error('Delete table action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
} 