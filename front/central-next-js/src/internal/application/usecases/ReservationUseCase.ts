// Application - Reservation Use Case
import { ReservationRepository } from '../../domain/ports/ReservationRepository';
import { Reservation, CreateReservationData, UpdateReservationStatusData, ReservationFilters } from '../../domain/entities/Reservation';

export class ReservationUseCase {
  constructor(private reservationRepository: ReservationRepository) {}

  async getReservations(filters?: ReservationFilters) {
    try {
      const result = await this.reservationRepository.getReservations(filters);
      
      if (result.success) {
        // Convertir las fechas de string a Date
        const reservationsWithDates = result.data.map(reservation => ({
          ...reservation,
          start_at: new Date(reservation.start_at),
          end_at: new Date(reservation.end_at),
          reserva_creada: new Date(reservation.reserva_creada),
          reserva_actualizada: new Date(reservation.reserva_actualizada),
          status_history: reservation.status_history.map(history => ({
            ...history,
            changed_at: new Date(history.changed_at)
          }))
        }));

        return {
          success: true,
          data: reservationsWithDates,
          total: result.total
        };
      } else {
        return {
          success: false,
          error: result.error || 'Error al obtener reservas',
          data: [],
          total: 0
        };
      }
    } catch (error) {
      console.error('Error en caso de uso getReservations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        data: [],
        total: 0
      };
    }
  }

  async createReservation(reservationData: CreateReservationData) {
    try {
      // Validaciones de negocio
      if (!reservationData.cliente_nombre || !reservationData.cliente_email) {
        throw new Error('Nombre y email del cliente son requeridos');
      }

      if (reservationData.number_of_guests <= 0) {
        throw new Error('El número de invitados debe ser mayor a 0');
      }

      if (new Date(reservationData.start_at) >= new Date(reservationData.end_at)) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
      }

      const result = await this.reservationRepository.createReservation(reservationData);
      
      if (result.success && result.data) {
        // Convertir fechas
        const reservationWithDates = {
          ...result.data,
          start_at: new Date(result.data.start_at),
          end_at: new Date(result.data.end_at),
          reserva_creada: new Date(result.data.reserva_creada),
          reserva_actualizada: new Date(result.data.reserva_actualizada),
          status_history: result.data.status_history.map(history => ({
            ...history,
            changed_at: new Date(history.changed_at)
          }))
        };

        return {
          success: true,
          data: reservationWithDates
        };
      } else {
        return {
          success: false,
          error: result.error || 'Error al crear reserva'
        };
      }
    } catch (error) {
      console.error('Error en caso de uso createReservation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateReservationStatus(data: UpdateReservationStatusData) {
    try {
      // Validaciones de negocio
      const validStatuses = ['pendiente', 'asignado', 'confirmado', 'cancelado', 'completado'];
      if (!validStatuses.includes(data.status)) {
        throw new Error('Estado de reserva inválido');
      }

      const result = await this.reservationRepository.updateReservationStatus(data);
      
      if (result.success && result.data) {
        // Convertir fechas
        const reservationWithDates = {
          ...result.data,
          start_at: new Date(result.data.start_at),
          end_at: new Date(result.data.end_at),
          reserva_creada: new Date(result.data.reserva_creada),
          reserva_actualizada: new Date(result.data.reserva_actualizada),
          status_history: result.data.status_history.map(history => ({
            ...history,
            changed_at: new Date(history.changed_at)
          }))
        };

        return {
          success: true,
          data: reservationWithDates
        };
      } else {
        return {
          success: false,
          error: result.error || 'Error al actualizar estado de reserva'
        };
      }
    } catch (error) {
      console.error('Error en caso de uso updateReservationStatus:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async cancelReservation(reservationId: number) {
    try {
      const result = await this.reservationRepository.cancelReservation(reservationId);
      
      if (result.success && result.data) {
        // Convertir fechas
        const reservationWithDates = {
          ...result.data,
          start_at: new Date(result.data.start_at),
          end_at: new Date(result.data.end_at),
          reserva_creada: new Date(result.data.reserva_creada),
          reserva_actualizada: new Date(result.data.reserva_actualizada),
          status_history: result.data.status_history.map(history => ({
            ...history,
            changed_at: new Date(history.changed_at)
          }))
        };

        return {
          success: true,
          data: reservationWithDates
        };
      } else {
        return {
          success: false,
          error: result.error || 'Error al cancelar reserva'
        };
      }
    } catch (error) {
      console.error('Error en caso de uso cancelReservation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Métodos de utilidad para la lógica de negocio
  getReservationsForDate(reservations: Reservation[], date: Date): Reservation[] {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.start_at);
      reservationDate.setHours(0, 0, 0, 0);
      return reservationDate.getTime() === targetDate.getTime();
    });
  }

  getStatusName(status: string): string {
    const statusNames: Record<string, string> = {
      'pendiente': 'Pendiente',
      'asignado': 'Asignado',
      'confirmado': 'Confirmado',
      'cancelado': 'Cancelado',
      'completado': 'Completado'
    };
    return statusNames[status] || status;
  }

  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'pendiente': '#FFA500',
      'asignado': '#17A2B8',
      'confirmado': '#28A745',
      'cancelado': '#DC3545',
      'completado': '#6F42C1'
    };
    return statusColors[status] || '#6C757D';
  }

  getStatusIcon(status: string): string {
    const statusIcons: Record<string, string> = {
      'pendiente': '⏳',
      'asignado': '🪑',
      'confirmado': '✅',
      'cancelado': '❌',
      'completado': '🎉'
    };
    return statusIcons[status] || '❓';
  }
} 