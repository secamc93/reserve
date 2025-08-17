'use server';

import { cookies } from 'next/headers';

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

export async function logoutAction(): Promise<LogoutResponse> {
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