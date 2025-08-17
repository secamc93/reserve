'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/server/config/env';

export interface BusinessData {
  name: string;
  code: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone?: string;
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  quaternary_color?: string;
  custom_domain?: string;
  enable_delivery?: boolean;
  enable_pickup?: boolean;
  enable_dine_in?: boolean;
  business_type_id: number;
}

export async function getBusinessesAction(): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/businesses`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al obtener negocios'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data || []
    };
  } catch (error) {
    console.error('Get businesses action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function getBusinessByIdAction(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/businesses/${id}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al obtener negocio'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Get business by ID action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function createBusinessAction(businessData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/businesses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(businessData)),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al crear negocio'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Create business action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function updateBusinessAction(id: number, businessData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    console.log('🔍 [SERVER] updateBusinessAction iniciado para ID:', id);
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const dataToSend = Object.fromEntries(businessData);
    console.log('📤 [SERVER] Datos a enviar:', dataToSend);
    console.log('🌐 [SERVER] Llamando al backend para actualizar negocio:', `${getApiBaseUrl()}/api/v1/businesses/${id}`);

    const response = await fetch(`${getApiBaseUrl()}/api/v1/businesses/${id}`, {
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
      console.log('❌ [SERVER] Error del backend al actualizar negocio:', errorData);
      return {
        success: false,
        message: errorData.message || 'Error al actualizar negocio'
      };
    }

    const data = await response.json();
    console.log('✅ [SERVER] Negocio actualizado exitosamente del backend');
    console.log('📊 [SERVER] Datos de respuesta:', data);
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('💥 [SERVER] Error en updateBusinessAction:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function deleteBusinessAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/businesses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al eliminar negocio'
      };
    }

    return {
      success: true,
      message: 'Negocio eliminado exitosamente'
    };
  } catch (error) {
    console.error('Delete business action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function getBusinessTypesAction(): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/business-types`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al obtener tipos de negocio'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data || []
    };
  } catch (error) {
    console.error('Get business types action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
} 