/**
 * Entidad: Booking Status (Estado de Reserva)
 * Catálogo maestro de estados de reservas
 */
export interface BookingStatus {
  id: number;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
