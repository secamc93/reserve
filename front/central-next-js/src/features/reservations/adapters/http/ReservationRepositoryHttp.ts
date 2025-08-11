// Infrastructure - Reservation Repository Implementation (Secondary Adapter)
import { ReservationRepository } from '@/features/reservations/ports/ReservationRepository';
import { Reservation, CreateReservationData, UpdateReservationStatusData, ReservationFilters } from '@/features/reservations/domain/Reservation';
import { HttpClient } from '@/shared/adapters/http/HttpClient';

export class ReservationRepositoryHttp implements ReservationRepository {
  private httpClient: HttpClient;

  constructor(baseURL: string) {
    this.httpClient = new HttpClient(baseURL);
  }

  async getReservations(filters?: ReservationFilters) {
    try {
      const params = filters ? this.buildFilterParams(filters) : {};
      const response = await this.httpClient.get('/api/v1/reserves', params);
      
      if (response.success) {
        return {
          success: true,
          data: response.data || [],
          total: response.total || 0
        };
      } else {
        return {
          success: false,
          data: [],
          total: 0,
          error: response.error || 'Error al obtener reservas'
        };
      }
    } catch (error) {
      console.error('Error en ReservationRepositoryHttp.getReservations:', error);
      return {
        success: false,
        data: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }

  async createReservation(reservationData: CreateReservationData) {
    try {
      const response = await this.httpClient.post('/api/v1/reserves', reservationData);
      
      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.error || 'Error al crear reserva'
        };
      }
    } catch (error) {
      console.error('Error en ReservationRepositoryHttp.createReservation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }

  async updateReservationStatus(data: UpdateReservationStatusData) {
    try {
      const response = await this.httpClient.put(`/api/v1/reserves/${data.reserva_id}/status`, {
        status: data.status,
        notes: data.notes
      });
      
      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.error || 'Error al actualizar estado de reserva'
        };
      }
    } catch (error) {
      console.error('Error en ReservationRepositoryHttp.updateReservationStatus:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }

  async cancelReservation(reservationId: number) {
    try {
      const response = await this.httpClient.patch(`/api/v1/reserves/${reservationId}/cancel`);
      
      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.error || 'Error al cancelar reserva'
        };
      }
    } catch (error) {
      console.error('Error en ReservationRepositoryHttp.cancelReservation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }

  async getReservationById(reservationId: number) {
    try {
      const response = await this.httpClient.get(`/api/v1/reserves/${reservationId}`);
      
      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.error || 'Error al obtener reserva'
        };
      }
    } catch (error) {
      console.error('Error en ReservationRepositoryHttp.getReservationById:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }

  private buildFilterParams(filters: ReservationFilters): Record<string, any> {
    const params: Record<string, any> = {};
    
    // Mapear filtros según el proyecto original
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    if (filters.status) params.status_id = filters.status; // El backend usa status_id
    if (filters.cliente_email) params.client_id = filters.cliente_email; // El backend usa client_id
    if (filters.mesa_id) params.table_id = filters.mesa_id; // El backend usa table_id
    if (filters.restaurante_id) params.business_id = filters.restaurante_id; // El backend usa business_id
    if (filters.page) params.page = filters.page;
    if (filters.page_size) params.page_size = filters.page_size;
    
    return params;
  }
} 