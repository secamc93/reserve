'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '../config/env';

export interface BusinessData {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  businessTypeId: number;
}

export interface BusinessListResult {
  success: boolean;
  data?: any[];
  message?: string;
}

export async function getBusinessesAction(): Promise<BusinessListResult> {
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
    const response = await fetch(`${getApiBaseUrl()}/api/v1/businesses`, {
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

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/businesses/${id}`, {
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
        message: errorData.message || 'Error al obtener negocio'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Get business by id action error:', error);
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

    // Llamada a la API desde el servidor
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
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/businesses/${id}`, {
      method: 'PUT',
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
        message: errorData.message || 'Error al actualizar negocio'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Update business action error:', error);
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

    // Llamada a la API desde el servidor
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
      success: true
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

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/business-types`, {
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