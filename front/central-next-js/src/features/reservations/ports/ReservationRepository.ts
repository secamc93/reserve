// Domain - Reservation Repository (Port)
import { Reservation, CreateReservationData, UpdateReservationStatusData, ReservationFilters } from '@/features/reservations/domain/Reservation';

export interface ReservationRepository {
  getReservations(filters?: ReservationFilters): Promise<{
    success: boolean;
    data: Reservation[];
    total: number;
    error?: string;
  }>;
  
  createReservation(reservationData: CreateReservationData): Promise<{
    success: boolean;
    data?: Reservation;
    error?: string;
  }>;
  
  updateReservationStatus(data: UpdateReservationStatusData): Promise<{
    success: boolean;
    data?: Reservation;
    error?: string;
  }>;
  
  cancelReservation(reservationId: number): Promise<{
    success: boolean;
    data?: Reservation;
    error?: string;
  }>;
  
  getReservationById(reservationId: number): Promise<{
    success: boolean;
    data?: Reservation;
    error?: string;
  }>;
} 