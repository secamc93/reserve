/**
 * Entidad: Guardian (Apoderado)
 * Apoderados de jugadores menores de edad
 */
export interface Guardian {
  id: number;
  businessId: number;
  firstName: string;
  lastName: string;
  documentNumber: string;
  email: string;
  phone: string;
  relationshipType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para crear apoderado
 */
export interface CreateGuardianDTO {
  businessId: number;
  firstName: string;
  lastName: string;
  documentNumber: string;
  email: string;
  phone: string;
  relationshipType: string;
}

/**
 * DTO para actualizar apoderado
 */
export interface UpdateGuardianDTO {
  firstName?: string;
  lastName?: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
  relationshipType?: string;
  isActive?: boolean;
}
