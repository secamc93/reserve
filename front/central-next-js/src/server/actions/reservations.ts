'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '../config/env';

export interface ReservationData {
  clientId: number;
  tableId: number;
  businessId: number;
  reservationDate: string;
  reservationTime: string;
  numberOfGuests: number;
  notes?: string;
  status: string;
}

export interface ReservationFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  businessId?: number;
  clientId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface ReservationListResult {
  success: boolean;
  data?: any[];
  total?: number;
  message?: string;
}

export async function getReservationsAction(filters: ReservationFilters = {}): Promise<ReservationListResult> {
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
    if (filters.status) params.append('status', filters.status);
    if (filters.businessId) params.append('businessId', filters.businessId.toString());
    if (filters.clientId) params.append('clientId', filters.clientId.toString());
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/reservations?${params.toString()}`, {
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
        message: errorData.message || 'Error al obtener reservas'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data || [],
      total: data.total || 0
    };

  } catch (error) {
    console.error('Get reservations action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function getReservationByIdAction(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
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
    const response = await fetch(`${getApiBaseUrl()}/api/v1/reservations/${id}`, {
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
        message: errorData.message || 'Error al obtener reserva'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Get reservation by id action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function createReservationAction(reservationData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
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
    const response = await fetch(`${getApiBaseUrl()}/api/v1/reservations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(reservationData)),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al crear reserva'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Create reservation action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function updateReservationAction(id: number, reservationData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
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
    const response = await fetch(`${getApiBaseUrl()}/api/v1/reservations/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(reservationData)),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al actualizar reserva'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Update reservation action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function updateReservationStatusAction(id: number, status: string): Promise<{ success: boolean; data?: any; message?: string }> {
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
    const response = await fetch(`${getApiBaseUrl()}/api/v1/reservations/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al actualizar estado de reserva'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Update reservation status action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function deleteReservationAction(id: number): Promise<{ success: boolean; message?: string }> {
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
    const response = await fetch(`${getApiBaseUrl()}/api/v1/reservations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al eliminar reserva'
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Delete reservation action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
} 