'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/server/config/env';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: any;
  message?: string;
}

export async function loginAction(formData: FormData): Promise<LoginResponse> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error de autenticación'
      };
    }

    const data = await response.json();
    
    // Guardar token en cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    // Guardar información del usuario en cookie
    const userWithBusinesses = {
      ...data.data.user,
      businesses: data.data.businesses
    };
    
    cookieStore.set('user-info', JSON.stringify(userWithBusinesses), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    return {
      success: true,
      user: userWithBusinesses
    };
  } catch (error) {
    console.error('Login action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function logoutAction(): Promise<{ success: boolean; message?: string }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
    cookieStore.delete('user-info');
    
    return {
      success: true,
      message: 'Logout exitoso'
    };
  } catch (error) {
    console.error('Logout action error:', error);
    return {
      success: false,
      message: 'Error al hacer logout'
    };
  }
}

export async function checkAuthAction(): Promise<{ isAuthenticated: boolean; user?: any }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    const userInfo = cookieStore.get('user-info');

    if (!token || !userInfo) {
      return { isAuthenticated: false };
    }

    // Verificar token con el backend
    const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      // Token inválido, limpiar cookies
      cookieStore.delete('auth-token');
      cookieStore.delete('user-info');
      return { isAuthenticated: false };
    }

    const user = JSON.parse(userInfo.value);
    return {
      isAuthenticated: true,
      user
    };
  } catch (error) {
    console.error('Check auth action error:', error);
    return { isAuthenticated: false };
  }
}

export async function getUserRolesPermissionsAction(): Promise<{ success: boolean; data?: any; message?: string }> {
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

export async function changePasswordAction(formData: FormData): Promise<{ success: boolean; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;

    const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
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
    console.error('Change password action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
} 