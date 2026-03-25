export interface TrainingSession {
  id: number;
  businessId: number;
  trainingSessionTypeId: number;
  sessionTypeName: string;
  sessionTypeCode: string;
  coachId: number;
  coachName: string;
  trainingGroupId?: number;
  groupName?: string;
  sessionMode: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  location?: string;
  field?: string;
  maxParticipants?: number;
  currentParticipants: number;
  price?: number;
  status: string;
  isRecurring: boolean;
  coachNotes?: string;
  publicNotes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionDTO {
  businessId: number;
  trainingSessionTypeId: number;
  coachId: number;
  trainingGroupId?: number;
  sessionMode: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  location?: string;
  field?: string;
  maxParticipants?: number;
  price?: number;
  isRecurring?: boolean;
  coachNotes?: string;
  publicNotes?: string;
}

export interface UpdateSessionDTO {
  trainingSessionTypeId?: number;
  coachId?: number;
  trainingGroupId?: number;
  sessionMode?: string;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  location?: string;
  field?: string;
  maxParticipants?: number;
  price?: number;
  coachNotes?: string;
  publicNotes?: string;
}
