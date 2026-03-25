import { TrainingSession, CreateSessionDTO, UpdateSessionDTO } from '../entities';

export interface GetSessionsParams { businessId: number; token: string; page?: number; pageSize?: number; }
export interface GetSessionByIdParams { businessId: number; sessionId: number; token: string; }
export interface CreateSessionParams { token: string; data: CreateSessionDTO; }
export interface UpdateSessionParams { businessId: number; sessionId: number; token: string; data: UpdateSessionDTO; }
export interface CancelSessionParams { sessionId: number; token: string; reason: string; }

export interface SessionsPaginated {
  data: TrainingSession[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ISessionsRepository {
  getSessions(params: GetSessionsParams): Promise<SessionsPaginated>;
  getSessionById(params: GetSessionByIdParams): Promise<TrainingSession>;
  createSession(params: CreateSessionParams): Promise<TrainingSession>;
  updateSession(params: UpdateSessionParams): Promise<TrainingSession>;
  cancelSession(params: CancelSessionParams): Promise<void>;
}
