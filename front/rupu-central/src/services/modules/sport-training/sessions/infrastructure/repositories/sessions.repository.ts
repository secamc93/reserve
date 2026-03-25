import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import {
  ISessionsRepository, GetSessionsParams, GetSessionByIdParams, CreateSessionParams,
  UpdateSessionParams, CancelSessionParams, SessionsPaginated, TrainingSession,
} from '../../domain';
import {
  BackendGetSessionsResponse, BackendGetSessionByIdResponse, BackendCreateSessionResponse,
  BackendUpdateSessionResponse, BackendCancelSessionResponse, BackendTrainingSession,
} from './response/sessions.response';

export class SessionsRepository implements ISessionsRepository {
  private baseUrl = env.API_BASE_URL;

  private mapSession(s: BackendTrainingSession): TrainingSession {
    return {
      id: s.id, businessId: s.business_id,
      trainingSessionTypeId: s.training_session_type_id, sessionTypeName: s.session_type_name,
      sessionTypeCode: s.session_type_code, coachId: s.coach_id, coachName: s.coach_name,
      trainingGroupId: s.training_group_id, groupName: s.group_name,
      sessionMode: s.session_mode, scheduledDate: s.scheduled_date,
      startTime: s.start_time, endTime: s.end_time, duration: s.duration,
      location: s.location, field: s.field,
      maxParticipants: s.max_participants, currentParticipants: s.current_participants,
      price: s.price, status: s.status, isRecurring: s.is_recurring,
      coachNotes: s.coach_notes, publicNotes: s.public_notes,
      cancellationReason: s.cancellation_reason,
      createdAt: s.created_at, updatedAt: s.updated_at || '',
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

  async getSessions(params: GetSessionsParams): Promise<SessionsPaginated> {
    const { businessId, token, page = 1, pageSize = 10 } = params;
    const qp = new URLSearchParams({ business_id: businessId.toString(), page: page.toString(), page_size: pageSize.toString() });
    const data = await this.req<BackendGetSessionsResponse>(`${this.baseUrl}/sport-training/sessions?${qp}`, 'GET', token);
    return { data: data.data.map(this.mapSession.bind(this)), total: data.total, page: data.page, pageSize: data.page_size, totalPages: data.total_pages };
  }

  async getSessionById(params: GetSessionByIdParams): Promise<TrainingSession> {
    const data = await this.req<BackendGetSessionByIdResponse>(`${this.baseUrl}/sport-training/sessions/${params.sessionId}?business_id=${params.businessId}`, 'GET', params.token);
    return this.mapSession(data.data);
  }

  async createSession(params: CreateSessionParams): Promise<TrainingSession> {
    const d = params.data;
    const body: Record<string, unknown> = {
      business_id: d.businessId, training_session_type_id: d.trainingSessionTypeId,
      coach_id: d.coachId, session_mode: d.sessionMode,
      scheduled_date: d.scheduledDate, start_time: d.startTime, end_time: d.endTime, duration: d.duration,
    };
    if (d.trainingGroupId !== undefined) body.training_group_id = d.trainingGroupId;
    if (d.location !== undefined) body.location = d.location;
    if (d.field !== undefined) body.field = d.field;
    if (d.maxParticipants !== undefined) body.max_participants = d.maxParticipants;
    if (d.price !== undefined) body.price = d.price;
    if (d.isRecurring !== undefined) body.is_recurring = d.isRecurring;
    if (d.coachNotes !== undefined) body.coach_notes = d.coachNotes;
    if (d.publicNotes !== undefined) body.public_notes = d.publicNotes;

    const data = await this.req<BackendCreateSessionResponse>(`${this.baseUrl}/sport-training/sessions`, 'POST', params.token, body);
    return this.mapSession(data.data);
  }

  async updateSession(params: UpdateSessionParams): Promise<TrainingSession> {
    const d = params.data;
    const body: Record<string, unknown> = { business_id: params.businessId };
    if (d.trainingSessionTypeId !== undefined) body.training_session_type_id = d.trainingSessionTypeId;
    if (d.coachId !== undefined) body.coach_id = d.coachId;
    if (d.trainingGroupId !== undefined) body.training_group_id = d.trainingGroupId;
    if (d.sessionMode !== undefined) body.session_mode = d.sessionMode;
    if (d.scheduledDate !== undefined) body.scheduled_date = d.scheduledDate;
    if (d.startTime !== undefined) body.start_time = d.startTime;
    if (d.endTime !== undefined) body.end_time = d.endTime;
    if (d.duration !== undefined) body.duration = d.duration;
    if (d.location !== undefined) body.location = d.location;
    if (d.field !== undefined) body.field = d.field;
    if (d.maxParticipants !== undefined) body.max_participants = d.maxParticipants;
    if (d.price !== undefined) body.price = d.price;
    if (d.coachNotes !== undefined) body.coach_notes = d.coachNotes;
    if (d.publicNotes !== undefined) body.public_notes = d.publicNotes;

    const data = await this.req<BackendUpdateSessionResponse>(`${this.baseUrl}/sport-training/sessions/${params.sessionId}`, 'PUT', params.token, body);
    return this.mapSession(data.data);
  }

  async cancelSession(params: CancelSessionParams): Promise<void> {
    await this.req<BackendCancelSessionResponse>(`${this.baseUrl}/sport-training/sessions/${params.sessionId}/cancel`, 'PUT', params.token, { reason: params.reason });
  }
}
