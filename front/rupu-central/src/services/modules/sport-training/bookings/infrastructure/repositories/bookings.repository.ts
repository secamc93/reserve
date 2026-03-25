import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  IBookingsRepository, GetBookingsParams, GetBookingByIdParams, CreateBookingParams,
  ApproveBookingParams, RejectBookingParams, CancelBookingParams, BookingsPaginated,
  Booking, BookingDetail,
} from '../../domain';
import {
  BackendGetBookingsResponse, BackendGetBookingByIdResponse, BackendCreateBookingResponse,
  BackendSimpleResponse, BackendBookingListItem, BackendBookingDetail,
} from './response/bookings.response';

export class BookingsRepository implements IBookingsRepository {
  private baseUrl = env.API_BASE_URL;

  private mapListItem(b: BackendBookingListItem): Booking {
    return {
      id: b.id, trainingSessionId: b.training_session_id, playerId: b.player_id,
      playerName: b.player_name, sessionDate: b.session_date, sessionMode: b.session_mode,
      location: b.location, statusName: b.status_name, statusCode: b.status_code,
      statusColor: b.status_color, bookingDate: b.booking_date, isPaid: b.is_paid,
      price: b.price, createdAt: b.created_at, updatedAt: '',
    };
  }

  private mapDetail(b: BackendBookingDetail): BookingDetail {
    return {
      id: b.id, trainingSessionId: b.training_session_id, playerId: b.player_id,
      playerName: b.player_name, bookedByUserId: b.booked_by_user_id,
      bookingStatusId: b.booking_status_id, bookingDate: b.booking_date,
      requestNotes: b.request_notes, reviewedAt: b.reviewed_at,
      reviewedByCoachId: b.reviewed_by_coach_id, responseNotes: b.response_notes,
      cancelledAt: b.cancelled_at, cancelledByUserId: b.cancelled_by_user_id,
      cancellationReason: b.cancellation_reason, price: b.price, isPaid: b.is_paid,
      paymentDate: b.payment_date, paymentMethod: b.payment_method,
      statusName: b.status_name, statusCode: b.status_code, statusColor: b.status_color,
      createdAt: b.created_at, updatedAt: b.updated_at,
    };
  }

  private async req<T>(url: string, method: string, token: string, body?: unknown): Promise<T> {
    const startTime = Date.now();
    logHttpRequest({ method, url, body });
    try {
      const response = await fetch(url, {
        method, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}), cache: 'no-store',
      });
      const duration = Date.now() - startTime;
      const data = await response.json();
      if (!response.ok) { logHttpError({ status: response.status, statusText: response.statusText, duration, data }); throw new Error(data.message || 'Error'); }
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, data });
      return data as T;
    } catch (error) {
      logHttpError({ status: 0, statusText: 'Network Error', duration: Date.now() - startTime, data: { error: String(error) } });
      throw error;
    }
  }

  async getBookings(params: GetBookingsParams): Promise<BookingsPaginated> {
    const { businessId, token, page = 1, pageSize = 10 } = params;
    const qp = new URLSearchParams({ business_id: businessId.toString(), page: page.toString(), page_size: pageSize.toString() });
    const data = await this.req<BackendGetBookingsResponse>(`${this.baseUrl}/sport-training/bookings?${qp}`, 'GET', token);
    return { data: data.data.map(this.mapListItem.bind(this)), total: data.total, page: data.page, pageSize: data.page_size, totalPages: data.total_pages };
  }

  async getBookingById(params: GetBookingByIdParams): Promise<BookingDetail> {
    const data = await this.req<BackendGetBookingByIdResponse>(`${this.baseUrl}/sport-training/bookings/${params.bookingId}?business_id=${params.businessId}`, 'GET', params.token);
    return this.mapDetail(data.data);
  }

  async createBooking(params: CreateBookingParams): Promise<Booking> {
    const d = params.data;
    const body: Record<string, unknown> = { business_id: d.businessId, training_session_id: d.trainingSessionId, player_id: d.playerId };
    if (d.requestNotes) body.request_notes = d.requestNotes;
    const data = await this.req<BackendCreateBookingResponse>(`${this.baseUrl}/sport-training/bookings`, 'POST', params.token, body);
    return this.mapListItem(data.data);
  }

  async approveBooking(params: ApproveBookingParams): Promise<void> {
    const body: Record<string, unknown> = {};
    if (params.notes) body.notes = params.notes;
    await this.req<BackendSimpleResponse>(`${this.baseUrl}/sport-training/bookings/${params.bookingId}/approve`, 'POST', params.token, body);
  }

  async rejectBooking(params: RejectBookingParams): Promise<void> {
    const body: Record<string, unknown> = {};
    if (params.notes) body.notes = params.notes;
    await this.req<BackendSimpleResponse>(`${this.baseUrl}/sport-training/bookings/${params.bookingId}/reject`, 'POST', params.token, body);
  }

  async cancelBooking(params: CancelBookingParams): Promise<void> {
    const body: Record<string, unknown> = {};
    if (params.reason) body.reason = params.reason;
    await this.req<BackendSimpleResponse>(`${this.baseUrl}/sport-training/bookings/${params.bookingId}/cancel`, 'POST', params.token, body);
  }
}
