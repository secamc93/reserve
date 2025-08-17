'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/server/config/env';

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
  startDate?: string;
  endDate?: string;
  status?: string;
}

export async function getReservationsAction(filters: ReservationFilters = {}): Promise<{ success: boolean; data?: any[]; total?: number; message?: string }> {
  try {
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
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.status) params.append('status', filters.status);

    const response = await fetch(`${getApiBaseUrl()}/api/v1/reserves?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
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

    const response = await fetch(`${getApiBaseUrl()}/api/v1/reserves/${id}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
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
    console.error('Get reservation by ID action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function createReservationAction(reservationData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    console.log('🔍 [SERVER] createReservationAction iniciado...');
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      console.log('❌ [SERVER] No hay token, retornando error de autorización');
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    // Debug: ver qué datos se están enviando
    const dataToSend = Object.fromEntries(reservationData);
    console.log('📤 [SERVER] Datos a enviar:', dataToSend);
    console.log('📅 [SERVER] Fechas específicas:', {
      start_at: dataToSend.start_at,
      end_at: dataToSend.end_at,
      start_at_type: typeof dataToSend.start_at,
      end_at_type: typeof dataToSend.end_at
    });
    
    // Convertir tipos correctamente para el backend
    const processedData = {
      // Mapear campos del frontend a los que espera el backend
      name: dataToSend.cliente_nombre,
      email: dataToSend.cliente_email,
      phone: dataToSend.cliente_telefono,
      dni: dataToSend.cliente_dni || null,
      start_at: dataToSend.start_at,
      end_at: dataToSend.end_at,
      number_of_guests: parseInt(dataToSend.number_of_guests as string, 10) || 0,
      table_id: parseInt(dataToSend.mesa_id as string, 10) || 0,
      business_id: parseInt(dataToSend.restaurante_id as string, 10) || 0
    };
    
    console.log('🔢 [SERVER] Datos procesados con tipos correctos:', processedData);
    console.log('🌐 [SERVER] Llamando al backend para crear reserva:', `${getApiBaseUrl()}/api/v1/reserves`);

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/reserves`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processedData),
    });

    console.log('📡 [SERVER] Respuesta del backend (create):', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ [SERVER] Error del backend al crear reserva:', errorData);
      return {
        success: false,
        message: errorData.message || 'Error al crear reserva'
      };
    }

    const data = await response.json();
    console.log('✅ [SERVER] Reserva creada exitosamente del backend');
    console.log('📊 [SERVER] Datos de respuesta:', data);
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('💥 [SERVER] Error en createReservationAction:', error);
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
    const response = await fetch(`${getApiBaseUrl()}/api/v1/reserves/${id}`, {
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
    const response = await fetch(`${getApiBaseUrl()}/api/v1/reserves/${id}/status`, {
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
        message: errorData.message || 'Error al actualizar estado'
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