import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  IAttendanceRepository, RecordAttendanceParams, GetBySessionParams,
  GetByPlayerParams, AttendancePaginated, AttendanceRecord,
} from '../../domain';
import { BackendGetAttendanceResponse, BackendRecordAttendanceResponse, BackendAttendanceRecord } from './response/attendance.response';

export class AttendanceRepository implements IAttendanceRepository {
  private baseUrl = env.API_BASE_URL;

  private mapRecord(r: BackendAttendanceRecord): AttendanceRecord {
    return {
      id: r.id, trainingSessionId: r.training_session_id, sessionDate: r.session_date,
      sessionLocation: r.session_location, playerId: r.player_id, playerName: r.player_name,
      attendanceStatusId: r.attendance_status_id, statusName: r.status_name,
      statusCode: r.status_code, statusColor: r.status_color,
      checkInTime: r.check_in_time, checkOutTime: r.check_out_time,
      recordedByCoachId: r.recorded_by_coach_id, recordedByCoachName: r.recorded_by_coach_name,
      recordedAt: r.recorded_at, performanceRating: r.performance_rating,
      coachFeedback: r.coach_feedback, playerNotes: r.player_notes,
      createdAt: r.created_at, updatedAt: r.updated_at || '',
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

  async recordAttendance(params: RecordAttendanceParams): Promise<AttendanceRecord> {
    const d = params.data;
    const body: Record<string, unknown> = {
      player_id: d.playerId, attendance_status_id: d.attendanceStatusId,
    };
    if (d.checkInTime) body.check_in_time = d.checkInTime;
    if (d.performanceRating) body.performance_rating = d.performanceRating;
    if (d.coachFeedback) body.coach_feedback = d.coachFeedback;
    if (d.playerNotes) body.player_notes = d.playerNotes;

    const data = await this.req<BackendRecordAttendanceResponse>(
      `${this.baseUrl}/sport-training/sessions/${d.sessionId}/attendance`, 'POST', params.token, body
    );
    return this.mapRecord(data.data);
  }

  async getBySession(params: GetBySessionParams): Promise<AttendancePaginated> {
    const { sessionId, businessId, token, page = 1, pageSize = 10 } = params;
    const qp = new URLSearchParams({ business_id: businessId.toString(), page: page.toString(), page_size: pageSize.toString() });
    const data = await this.req<BackendGetAttendanceResponse>(
      `${this.baseUrl}/sport-training/sessions/${sessionId}/attendance?${qp}`, 'GET', token
    );
    return { data: data.data.map(this.mapRecord.bind(this)), total: data.total, page: data.page, pageSize: data.page_size, totalPages: data.total_pages };
  }

  async getByPlayer(params: GetByPlayerParams): Promise<AttendancePaginated> {
    const { playerId, businessId, token, page = 1, pageSize = 10 } = params;
    const qp = new URLSearchParams({ business_id: businessId.toString(), page: page.toString(), page_size: pageSize.toString() });
    const data = await this.req<BackendGetAttendanceResponse>(
      `${this.baseUrl}/sport-training/players/${playerId}/attendance?${qp}`, 'GET', token
    );
    return { data: data.data.map(this.mapRecord.bind(this)), total: data.total, page: data.page, pageSize: data.page_size, totalPages: data.total_pages };
  }
}
