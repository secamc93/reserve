'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/server/config/env';

export interface ClientData {
  name: string;
  email: string;
  phone: string;
  dni?: string;
  business_id: number;
  is_active?: boolean;
  notes?: string;
}

export interface ClientFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  business_id?: number;
  is_active?: boolean;
}

export async function getClientsAction(filters: ClientFilters = {}): Promise<{ success: boolean; data?: any[]; total?: number; message?: string }> {
  try {
    console.log('🔍 [SERVER] getClientsAction iniciado...');
    
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
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());

    console.log('🌐 [SERVER] Llamando al backend para clientes:', `${getApiBaseUrl()}/api/v1/clients?${params.toString()}`);

    const response = await fetch(`${getApiBaseUrl()}/api/v1/clients?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    console.log('📡 [SERVER] Respuesta del backend (clientes):', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ [SERVER] Error del backend al obtener clientes:', errorData);
      return {
        success: false,
        message: errorData.message || 'Error al obtener clientes'
      };
    }

    const data = await response.json();
    console.log('✅ [SERVER] Clientes obtenidos exitosamente del backend');
    console.log('📊 [SERVER] Estructura de datos recibida:', {
      hasData: !!data,
      hasClients: !!(data && data.data),
      clientsCount: data?.data?.length || 0
    });
    
    return {
      success: true,
      data: data.data || [],
      total: data.total || 0
    };
  } catch (error) {
    console.error('💥 [SERVER] Error en getClientsAction:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
}

export async function getClientByIdAction(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/clients/${id}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al obtener cliente'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Get client by ID action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function createClientAction(clientData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    console.log('🔍 [SERVER] createClientAction iniciado...');
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const dataToSend = Object.fromEntries(clientData);
    console.log('📤 [SERVER] Datos a enviar:', dataToSend);
    console.log('🌐 [SERVER] Llamando al backend para crear cliente:', `${getApiBaseUrl()}/api/v1/clients`);

    const response = await fetch(`${getApiBaseUrl()}/api/v1/clients`, {
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
      console.log('❌ [SERVER] Error del backend al crear cliente:', errorData);
      return {
        success: false,
        message: errorData.message || 'Error al crear cliente'
      };
    }

    const data = await response.json();
    console.log('✅ [SERVER] Cliente creado exitosamente del backend');
    console.log('📊 [SERVER] Datos de respuesta:', data);
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('💥 [SERVER] Error en createClientAction:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function updateClientAction(id: number, clientData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    console.log('🔍 [SERVER] updateClientAction iniciado para ID:', id);
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const dataToSend = Object.fromEntries(clientData);
    console.log('📤 [SERVER] Datos a enviar:', dataToSend);
    console.log('🌐 [SERVER] Llamando al backend para actualizar cliente:', `${getApiBaseUrl()}/api/v1/clients/${id}`);

    const response = await fetch(`${getApiBaseUrl()}/api/v1/clients/${id}`, {
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
      console.log('❌ [SERVER] Error del backend al actualizar cliente:', errorData);
      return {
        success: false,
        message: errorData.message || 'Error al actualizar cliente'
      };
    }

    const data = await response.json();
    console.log('✅ [SERVER] Cliente actualizado exitosamente del backend');
    console.log('📊 [SERVER] Datos de respuesta:', data);
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('💥 [SERVER] Error en updateClientAction:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function deleteClientAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/clients/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al eliminar cliente'
      };
    }

    return {
      success: true,
      message: 'Cliente eliminado exitosamente'
    };
  } catch (error) {
    console.error('Delete client action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function getClientByEmailAction(email: string, businessId: number): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/clients/search?email=${email}&business_id=${businessId}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al buscar cliente'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Get client by email action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
} 