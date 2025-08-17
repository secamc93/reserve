'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '../config/env';

export interface ClientData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  businessId: number;
}

export interface ClientFilters {
  page?: number;
  pageSize?: number;
  name?: string;
  email?: string;
  businessId?: number;
  isActive?: boolean;
}

export interface ClientListResult {
  success: boolean;
  data?: any[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  message?: string;
}

export async function getClientsAction(filters: ClientFilters = {}): Promise<ClientListResult> {
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
    if (filters.businessId) params.append('businessId', filters.businessId.toString());
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/clients?${params.toString()}`, {
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
        message: errorData.message || 'Error al obtener clientes'
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
    console.error('Get clients action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
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

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/clients/${id}`, {
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
        message: errorData.message || 'Error al obtener cliente'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Get client by id action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function createClientAction(clientData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
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
    const response = await fetch(`${getApiBaseUrl()}/api/v1/clients`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(clientData)),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al crear cliente'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Create client action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function updateClientAction(id: number, clientData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
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
    const response = await fetch(`${getApiBaseUrl()}/api/v1/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(clientData)),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al actualizar cliente'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Update client action error:', error);
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

    // Llamada a la API desde el servidor
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
      success: true
    };

  } catch (error) {
    console.error('Delete client action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
} 