'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/server/config/env';

export interface CheckAuthResponse {
  isAuthenticated: boolean;
  user?: any;
}

export async function checkAuthAction(): Promise<CheckAuthResponse> {
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