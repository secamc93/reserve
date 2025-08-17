'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '../config/env';

export interface UserFilters {
  page?: number;
  pageSize?: number;
  name?: string;
  email?: string;
  isActive?: boolean;
}

export interface UserListResult {
  success: boolean;
  data?: any[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  message?: string;
}

export async function getUsersAction(filters: UserFilters = {}): Promise<UserListResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    // Construir query string
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.name) params.append('name', filters.name);
    if (filters.email) params.append('email', filters.email);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/users?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al obtener usuarios'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data || [],
      total: data.total || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 10,
      totalPages: data.totalPages || 1
    };

  } catch (error) {
    console.error('Get users action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function createUserAction(userData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(userData)),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al crear usuario'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Create user action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function updateUserAction(id: number, userData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/users/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(userData)),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al actualizar usuario'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Update user action error:', error);
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

    // Llamada a la API desde el servidor
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
      success: true
    };

  } catch (error) {
    console.error('Delete user action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
} 