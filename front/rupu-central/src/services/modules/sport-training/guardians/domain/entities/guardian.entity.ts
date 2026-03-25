/**
 * Entidad: Guardian (Tutor/Padre)
 * Tutores y padres de jugadores menores
 */
export interface Guardian {
  id: number;
  businessId: number;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  relationship?: string;
  photoUrl?: string;
  notes?: string;
  canBookSessions: boolean;
  canAccessRecords: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para crear tutor
 */
export interface CreateGuardianDTO {
  businessId: number;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  relationship?: string;
  canBookSessions?: boolean;
  canAccessRecords?: boolean;
}

/**
 * DTO para actualizar tutor
 */
export interface UpdateGuardianDTO {
  firstName?: string;
  lastName?: string;
  documentType?: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
  secondaryPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  relationship?: string;
  canBookSessions?: boolean;
  canAccessRecords?: boolean;
  isActive?: boolean;
}
