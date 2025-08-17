'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/server/config/env';

export interface RoomData {
  name: string;
  capacity: number;
  business_id: number;
  description?: string;
  is_active?: boolean;
  room_type?: string;
}

export async function getRoomsAction(): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    console.log('🔍 [SERVER] getRoomsAction iniciado...');
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    console.log('🌐 [SERVER] Llamando al backend para salas:', `${getApiBaseUrl()}/api/v1/rooms`);

    const response = await fetch(`${getApiBaseUrl()}/api/v1/rooms`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    console.log('📡 [SERVER] Respuesta del backend (salas):', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ [SERVER] Error del backend al obtener salas:', errorData);
      return {
        success: false,
        message: errorData.message || 'Error al obtener salas'
      };
    }

    const data = await response.json();
    console.log('✅ [SERVER] Salas obtenidas exitosamente del backend');
    console.log('📊 [SERVER] Estructura de datos recibida:', {
      hasData: !!data,
      hasRooms: !!(data && data.data),
      roomsCount: data?.data?.length || 0
    });
    
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error('💥 [SERVER] Error en getRoomsAction:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
}

export async function getRoomByIdAction(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/rooms/${id}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al obtener sala'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Get room by ID action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function createRoomAction(roomData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(roomData)),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al crear sala'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Create room action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function updateRoomAction(id: number, roomData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/rooms/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(roomData)),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al actualizar sala'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Update room action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function deleteRoomAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/rooms/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al eliminar sala'
      };
    }

    return {
      success: true,
      message: 'Sala eliminada exitosamente'
    };
  } catch (error) {
    console.error('Delete room action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function getRoomTypesAction(): Promise<{ success: boolean; data?: any[]; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/room-types`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al obtener tipos de sala'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data || []
    };
  } catch (error) {
    console.error('Get room types action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
} 