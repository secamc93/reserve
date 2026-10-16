/**
 * Entidad: CommonAreaReservation
 * Reserva de una zona común. El estado sigue la máquina del back:
 * pending → approved → confirmed → checked_in → checked_out → completed
 * (y rejected / cancelled / expired como finales).
 */

export type ReservationStatusCode =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'completed'
  | 'expired';

export interface CommonAreaReservation {
  id: number;
  businessId: number;
  commonAreaId: number;
  commonAreaName?: string;
  propertyUnitId: number;
  propertyUnitNumber?: string;
  propertyUnitBlock?: string;
  residentId?: number;
  residentName?: string;
  reservationStatusId: number;
  statusCode?: string;
  statusName?: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  requiresApproval: boolean;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  numberOfGuests: number;
  purpose?: string;
  specialRequests?: string;
  isRecurring: boolean;
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
  cancelledAt?: string;
  cancellationReason?: string;
  notes?: string;
  residentNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReservationListDTO {
  id: number;
  commonAreaId: number;
  commonAreaName: string;
  propertyUnitId: number;
  propertyUnitNumber: string;
  propertyUnitBlock: string;
  residentName: string;
  statusCode: string;
  statusName: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  numberOfGuests: number;
  purpose?: string;
  requiresApproval: boolean;
  totalAmount?: number;
  depositAmount?: number;
  depositPaid: boolean;
  fullPaymentPaid: boolean;
  checkedInAt?: string;
  createdAt: string;
}

export interface CreateReservationDTO {
  commonAreaId: number;
  propertyUnitId: number;
  residentId?: number;
  /** RFC3339 a medianoche UTC ("2026-10-20T00:00:00Z"). */
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

export interface UpdatePaymentsDTO {
  depositPaid?: boolean;
  fullPaymentPaid?: boolean;
}

export interface ReservationsPaginated {
  data: ReservationListDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
