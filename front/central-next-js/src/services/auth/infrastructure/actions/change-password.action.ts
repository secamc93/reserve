'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/server/config/env';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

export async function changePasswordAction(formData: FormData): Promise<ChangePasswordResponse> {
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