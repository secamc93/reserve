export interface Booking {
  id: number;
  trainingSessionId: number;
  playerId: number;
  playerName: string;
  sessionDate: string;
  sessionMode: string;
  location: string;
  statusName: string;
  statusCode: string;
  statusColor: string;
  bookingDate: string;
  isPaid: boolean;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookingDetail {
  id: number;
  trainingSessionId: number;
  playerId: number;
  bookedByUserId: number;
  bookingStatusId: number;
  bookingDate: string;
  requestNotes?: string;
  reviewedAt?: string;
  reviewedByCoachId?: number;
  responseNotes?: string;
  cancelledAt?: string;
  cancelledByUserId?: number;
  cancellationReason?: string;
  price?: number;
  isPaid: boolean;
  paymentDate?: string;
  paymentMethod?: string;
  statusName: string;
  statusCode: string;
  statusColor: string;
  playerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingDTO {
  businessId: number;
  trainingSessionId: number;
  playerId: number;
  requestNotes?: string;
}
