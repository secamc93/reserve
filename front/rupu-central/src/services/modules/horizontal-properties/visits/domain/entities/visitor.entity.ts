/**
 * Entidad: Visitor
 * Representa un visitante (maestro) en el sistema
 */

export interface Visitor {
  id: number;
  businessId?: number;
  dni: string;
  fullName: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  hasBlacklist: boolean;
  isVerified: boolean;
  lastVisitAt?: string;
  totalVisits: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitorDTO {
  dni: string;
  fullName: string;
  phone: string;
  email?: string;
  photoUrl?: string;
}
