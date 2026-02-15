/**
 * Response Types del Backend para Catálogos
 * Mapeo de snake_case (backend) a camelCase (frontend)
 */

// Backend Skill Level
export interface BackendSkillLevel {
  id: number;
  code: string;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendSkillLevelsResponse {
  success: boolean;
  message: string;
  data: BackendSkillLevel[];
}

// Backend Session Type
export interface BackendSessionType {
  id: number;
  code: string;
  name: string;
  description: string;
  is_group: boolean;
  max_participants: number | null;
  default_duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendSessionTypesResponse {
  success: boolean;
  message: string;
  data: BackendSessionType[];
}

// Backend Booking Status
export interface BackendBookingStatus {
  id: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendBookingStatusesResponse {
  success: boolean;
  message: string;
  data: BackendBookingStatus[];
}

// Backend Attendance Status
export interface BackendAttendanceStatus {
  id: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendAttendanceStatusesResponse {
  success: boolean;
  message: string;
  data: BackendAttendanceStatus[];
}

// Backend Coach Specialty
export interface BackendCoachSpecialty {
  id: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendCoachSpecialtiesResponse {
  success: boolean;
  message: string;
  data: BackendCoachSpecialty[];
}
