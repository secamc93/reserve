import { Booking, BookingDetail, CreateBookingDTO } from '../entities';

export interface GetBookingsParams { businessId: number; token: string; page?: number; pageSize?: number; }
export interface GetBookingByIdParams { businessId: number; bookingId: number; token: string; }
export interface CreateBookingParams { token: string; data: CreateBookingDTO; }
export interface ApproveBookingParams { bookingId: number; token: string; notes?: string; }
export interface RejectBookingParams { bookingId: number; token: string; notes?: string; }
export interface CancelBookingParams { bookingId: number; token: string; reason?: string; }

export interface BookingsPaginated {
  data: Booking[]; total: number; page: number; pageSize: number; totalPages: number;
}

export interface IBookingsRepository {
  getBookings(params: GetBookingsParams): Promise<BookingsPaginated>;
  getBookingById(params: GetBookingByIdParams): Promise<BookingDetail>;
  createBooking(params: CreateBookingParams): Promise<Booking>;
  approveBooking(params: ApproveBookingParams): Promise<void>;
  rejectBooking(params: RejectBookingParams): Promise<void>;
  cancelBooking(params: CancelBookingParams): Promise<void>;
}
