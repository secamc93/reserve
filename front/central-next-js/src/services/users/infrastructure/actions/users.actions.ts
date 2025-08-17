'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/server/config/env';

export interface UserData {
  name: string;
  email: string;
  password?: string;
  role_id: number;
  business_id: number;
  is_active?: boolean;
  phone?: string;
  avatar_url?: string;
}

export interface UserFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  business_id?: number;
  role_id?: number;
  is_active?: boolean;
}

export async function getUsersAction(filters: UserFilters = {}): Promise<{ success: boolean; data?: any[]; total?: number; message?: string }> {
  try {
    console.log('🔍 [SERVER] getUsersAction iniciado...');
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    // Construir query params
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('page_size', filters.pageSize.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.business_id) params.append('business_id', filters.business_id.toString());
    if (filters.role_id) params.append('role_id', filters.role_id.toString());
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());

    console.log('🌐 [SERVER] Llamando al backend para usuarios:', `${getApiBaseUrl()}/api/v1/users?${params.toString()}`);

    const response = await fetch(`${getApiBaseUrl()}/api/v1/users?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    console.log('📡 [SERVER] Respuesta del backend (usuarios):', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ [SERVER] Error del backend al obtener usuarios:', errorData);
      return {
        success: false,
        message: errorData.message || 'Error al obtener usuarios'
      };
    }

    const data = await response.json();
    console.log('✅ [SERVER] Usuarios obtenidos exitosamente del backend');
    console.log('📊 [SERVER] Estructura de datos recibida:', {
      hasData: !!data,
      hasUsers: !!(data && data.data),
      usersCount: data?.data?.length || 0
    });
    
    return {
      success: true,
      data: data.data || [],
      total: data.total || 0
    };
  } catch (error) {
    console.error('💥 [SERVER] Error en getUsersAction:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
}

export async function getUserByIdAction(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al obtener usuario'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Get user by ID action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function createUserAction(userData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    console.log('🔍 [SERVER] createUserAction iniciado...');
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const dataToSend = Object.fromEntries(userData);
    console.log('📤 [SERVER] Datos a enviar:', dataToSend);
    console.log('🌐 [SERVER] Llamando al backend para crear usuario:', `${getApiBaseUrl()}/api/v1/users`);

    const response = await fetch(`${getApiBaseUrl()}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    console.log('📡 [SERVER] Respuesta del backend (create):', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ [SERVER] Error del backend al crear usuario:', errorData);
      return {
        success: false,
        message: errorData.message || 'Error al crear usuario'
      };
    }

    const data = await response.json();
    console.log('✅ [SERVER] Usuario creado exitosamente del backend');
    console.log('📊 [SERVER] Datos de respuesta:', data);
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('💥 [SERVER] Error en createUserAction:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function updateUserAction(id: number, userData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    console.log('🔍 [SERVER] updateUserAction iniciado para ID:', id);
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const dataToSend = Object.fromEntries(userData);
    console.log('📤 [SERVER] Datos a enviar:', dataToSend);
    console.log('🌐 [SERVER] Llamando al backend para actualizar usuario:', `${getApiBaseUrl()}/api/v1/users/${id}`);

    const response = await fetch(`${getApiBaseUrl()}/api/v1/users/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    console.log('📡 [SERVER] Respuesta del backend (update):', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ [SERVER] Error del backend al actualizar usuario:', errorData);
      return {
        success: false,
        message: errorData.message || 'Error al actualizar usuario'
      };
    }

    const data = await response.json();
    console.log('✅ [SERVER] Usuario actualizado exitosamente del backend');
    console.log('📊 [SERVER] Datos de respuesta:', data);
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('💥 [SERVER] Error en updateUserAction:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function deleteUserAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al eliminar usuario'
      };
    }

    return {
      success: true,
      message: 'Usuario eliminado exitosamente'
    };
  } catch (error) {
    console.error('Delete user action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function getRolesAction(): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/roles`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al obtener roles'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data || []
    };
  } catch (error) {
    console.error('Get roles action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function changeUserPasswordAction(id: number, passwordData: FormData): Promise<{ success: boolean; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const newPassword = passwordData.get('newPassword') as string;

    const response = await fetch(`${getApiBaseUrl()}/api/v1/users/${id}/change-password`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al cambiar contraseña'
      };
    }

    return {
      success: true,
      message: 'Contraseña cambiada exitosamente'
    };
  } catch (error) {
    console.error('Change user password action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
} 