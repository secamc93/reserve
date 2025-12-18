/**
 * Entidad: CommonAreaReservation
 * Representa una reserva de zona común en el sistema
 */

export interface CommonAreaReservation {
  id: number;
  businessId: number;
  commonAreaId: number;
  commonAreaName?: string;
  propertyUnitId: number;
  propertyUnitNumber?: string;
  residentId?: number;
  residentName?: string;
  reservationStatusId: number;
  statusName?: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  requiresApproval: boolean;
  approvedByUserId?: number;
  approvedAt?: string;
  rejectedByUserId?: number;
  rejectedAt?: string;
  rejectionReason?: string;
  numberOfGuests: number;
  purpose?: string;
  specialRequests?: string;
  isRecurring: boolean;
  recurringPatternId?: number;
  parentReservationId?: number;
  totalAmount?: number;
  depositAmount?: number;
  depositPaid: boolean;
  depositPaidAt?: string;
  fullPaymentPaid: boolean;
  fullPaymentPaidAt?: string;
  qrCode?: string;
  accessCode?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  checkedInByUserId?: number;
  checkedOutByUserId?: number;
  notifyResident: boolean;
  notifyAdmin: boolean;
  notificationSentAt?: string;
  reminderSentAt?: string;
  cancelledAt?: string;
  cancelledByUserId?: number;
  cancellationReason?: string;
  refundAmount?: number;
  notes?: string;
  residentNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationListDTO {
  id: number;
  commonAreaName: string;
  propertyUnitNumber: string;
  residentName: string;
  statusName: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  numberOfGuests: number;
  createdAt: string;
}

export interface CreateReservationDTO {
  commonAreaId: number;
  propertyUnitId: number;
  residentId?: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  numberOfGuests: number;
  purpose?: string;
  specialRequests?: string;
  isRecurring?: boolean;
}

export interface CheckAvailabilityDTO {
  commonAreaId: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
}

export interface ReservationsPaginated {
  data: ReservationListDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
