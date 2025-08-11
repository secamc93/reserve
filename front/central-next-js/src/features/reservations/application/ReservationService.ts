// Application - Reservation Service
import { ReservationUseCase } from './ReservationUseCase';
import { ReservationRepositoryHttp } from '@/features/reservations/adapters/http/ReservationRepositoryHttp';
import { Reservation, CreateReservationData, UpdateReservationStatusData, ReservationFilters } from '@/features/reservations/domain/Reservation';

export class ReservationService {
  private reservationUseCase: ReservationUseCase;

  constructor(baseURL: string) {
    const reservationRepository = new ReservationRepositoryHttp(baseURL);
    this.reservationUseCase = new ReservationUseCase(reservationRepository);
  }

  async getReservations(filters?: ReservationFilters) {
    return this.reservationUseCase.getReservations(filters);
  }

  async createReservation(reservationData: CreateReservationData) {
    return this.reservationUseCase.createReservation(reservationData);
  }

  async updateReservationStatus(data: UpdateReservationStatusData) {
    return this.reservationUseCase.updateReservationStatus(data);
  }

  async cancelReservation(reservationId: number) {
    return this.reservationUseCase.cancelReservation(reservationId);
  }

  // Métodos de utilidad
  getReservationsForDate(reservations: Reservation[], date: Date): Reservation[] {
    return this.reservationUseCase.getReservationsForDate(reservations, date);
  }

  getStatusName(status: string): string {
    return this.reservationUseCase.getStatusName(status);
  }

  getStatusColor(status: string): string {
    return this.reservationUseCase.getStatusColor(status);
  }

  getStatusIcon(status: string): string {
    return this.reservationUseCase.getStatusIcon(status);
  }
} 