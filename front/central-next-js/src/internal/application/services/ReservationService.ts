// Application - Reservation Service
import { ReservationUseCase } from '../usecases/ReservationUseCase';
import { ReservationRepositoryImpl } from '../../infrastructure/secondary/ReservationRepositoryImpl';
import { Reservation, CreateReservationData, UpdateReservationStatusData, ReservationFilters } from '../../domain/entities/Reservation';

export class ReservationService {
  private reservationUseCase: ReservationUseCase;

  constructor(baseURL: string) {
    const reservationRepository = new ReservationRepositoryImpl(baseURL);
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