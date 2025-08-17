'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '../config/env';

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  requirePasswordChange?: boolean;
  user?: any;
  redirectTo?: string;
}

export interface UserRolesPermissionsResult {
  success: boolean;
  data?: {
    resources?: any[];
    permissions?: any[];
    roles?: any[];
  };
  message?: string;
}

export async function loginAction(formData: FormData): Promise<LoginResult> {
  try {
    console.log('🚀 [SERVER] Login Action iniciado');
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('🔍 [SERVER] Datos recibidos:', { email, hasPassword: !!password });

    // Validación básica en servidor
    if (email.length < 3 || password.length < 6) {
      console.log('❌ [SERVER] Validación fallida: credenciales inválidas');
      return {
        success: false,
        message: 'Credenciales inválidas'
      };
    }

    console.log('🌐 [SERVER] Llamando al backend:', `${getApiBaseUrl()}/api/v1/auth/login`);

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });

    console.log('📡 [SERVER] Respuesta del backend:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ [SERVER] Error del backend:', errorData);
      return {
        success: false,
        message: errorData.message || 'Error de autenticación'
      };
    }

    const data = await response.json();
    console.log('✅ [SERVER] Login exitoso, procesando respuesta...');
    
    if (data.success) {
      console.log('🍪 [SERVER] Configurando cookies...');
      
      // Guardar token en cookie segura (httpOnly)
      const cookieStore = await cookies();
      
      // Configurar cookie del token
      cookieStore.set('auth-token', data.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 días
        path: '/',
      });

      // Guardar información del usuario en cookie
      cookieStore.set('user-info', JSON.stringify(data.data.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 días
        path: '/',
      });

      console.log('🍪 [SERVER] Cookies configuradas para usuario:', data.data.user.email);
      console.log('🔍 [SERVER] Verificando cookies después de configurar...');
      
      // Verificar que las cookies se guardaron
      const verifyToken = cookieStore.get('auth-token');
      const verifyUser = cookieStore.get('user-info');
      console.log('🔍 [SERVER] Verificación de cookies:', {
        hasToken: !!verifyToken,
        hasUser: !!verifyUser,
        tokenValue: verifyToken?.value ? 'presente' : 'ausente',
        userValue: verifyUser?.value ? 'presente' : 'ausente'
      });

      if (data.requirePasswordChange) {
        return {
          success: true,
          requirePasswordChange: true,
          user: data.data.user,
          redirectTo: '/change-password'
        };
      }

      return {
        success: true,
        user: data.data.user,
        redirectTo: '/calendar'
      };
    }

    return {
      success: false,
      message: data.message || 'Error de autenticación'
    };

  } catch (error) {
    console.error('💥 [SERVER] Error en login action:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function logoutAction(): Promise<{ redirectTo: string }> {
  try {
    const cookieStore = await cookies();
    
    // Eliminar cookies de autenticación
    cookieStore.delete('auth-token');
    cookieStore.delete('user-info');
    
    // Retornar URL de redirección
    return { redirectTo: '/login' };
  } catch (error) {
    console.error('Logout action error:', error);
    return { redirectTo: '/login' };
  }
}

export async function checkAuthAction(): Promise<{ isAuthenticated: boolean; user?: any }> {
  try {
    console.log('🔍 [SERVER] checkAuthAction iniciado...');
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    const userInfo = cookieStore.get('user-info');

    console.log('🍪 [SERVER] Cookies encontradas:', {
      hasToken: !!token,
      hasUserInfo: !!userInfo,
      tokenValue: token?.value ? `${token.value.substring(0, 20)}...` : 'ausente',
      userInfoValue: userInfo?.value ? 'presente' : 'ausente'
    });

    if (!token || !userInfo) {
      console.log('❌ [SERVER] Faltan cookies de autenticación');
      console.log('🔍 [SERVER] Todas las cookies disponibles:', cookieStore.getAll().map(c => c.name));
      return { isAuthenticated: false };
    }

    // Solo verificar que las cookies existan, sin llamar al backend por ahora
    try {
      const user = JSON.parse(userInfo.value);
      console.log('✅ [SERVER] Usuario autenticado correctamente (solo cookies):', user.email);
      return { isAuthenticated: true, user };
    } catch (parseError) {
      console.error('❌ [SERVER] Error parseando información del usuario:', parseError);
      // Limpiar cookies corruptas
      cookieStore.delete('auth-token');
      cookieStore.delete('user-info');
      return { isAuthenticated: false };
    }

  } catch (error) {
    console.error('💥 [SERVER] Error en checkAuthAction:', error);
    return { isAuthenticated: false };
  }
}

export async function getUserRolesPermissionsAction(): Promise<UserRolesPermissionsResult> {
  try {
    console.log('🔐 [SERVER] getUserRolesPermissionsAction iniciado...');
    
    const cookieStore = await cookies();
    console.log('🍪 [SERVER] Cookies obtenidas del servidor');
    
    const token = cookieStore.get('auth-token');
    console.log('🔑 [SERVER] Token encontrado:', !!token);

    if (!token) {
      console.log('❌ [SERVER] No hay token, retornando error de autorización');
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    console.log('🌐 [SERVER] Llamando al backend para permisos:', `${getApiBaseUrl()}/api/v1/auth/roles-permissions`);
    
    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/roles-permissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 [SERVER] Respuesta del backend (permisos):', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ [SERVER] Error del backend al obtener permisos:', errorData);
      return {
        success: false,
        message: errorData.message || 'Error al obtener roles y permisos'
      };
    }

    const data = await response.json();
    console.log('✅ [SERVER] Permisos obtenidos exitosamente del backend');
    console.log('📊 [SERVER] Estructura de datos recibida:', {
      hasData: !!data.data,
      hasResources: !!(data.data && data.data.resources),
      hasPermissions: !!(data.data && data.data.permissions),
      hasRoles: !!(data.data && data.data.roles)
    });
    
    return {
      success: true,
      data: data.data || {}
    };

  } catch (error) {
    console.error('💥 [SERVER] Error en getUserRolesPermissionsAction:', error);
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
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        success: false,
        message: 'Todos los campos son requeridos'
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        message: 'Las contraseñas no coinciden'
      };
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      };
    }

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al cambiar contraseña'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      message: data.message || 'Contraseña cambiada exitosamente'
    };

  } catch (error) {
    console.error('Change password action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
} 