/**
 * Entity: AttendanceRecord (Registro de Asistencia)
 */

export interface AttendanceRecord {
  id: number;
  attendanceListId: number;
  propertyUnitId: number;
  residentId: number | null;
  proxyId: number | null;
  attendedAsOwner: boolean;
  attendedAsProxy: boolean;
  signature: string;
  signatureDate: string | null;
  signatureMethod: string;
  verifiedBy: number | null;
  verificationDate: string | null;
  verificationNotes: string;
  notes: string;
  isValid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttendanceRecordDTO {
  attendanceListId: number;
  propertyUnitId: number;
  residentId?: number;
  proxyId?: number;
  attendedAsOwner: boolean;
  attendedAsProxy: boolean;
  signature?: string;
  signatureMethod?: 'digital' | 'handwritten' | 'electronic';
  notes?: string;
}

export interface MarkAttendanceDTO {
  attendanceListId: number;
  propertyUnitId: number;
  residentId?: number;
  proxyId?: number;
  attendedAsOwner: boolean;
  attendedAsProxy: boolean;
  signature?: string;
  signatureMethod?: 'digital' | 'handwritten' | 'electronic';
  notes?: string;
}

export interface UpdateAttendanceRecordDTO {
  residentId?: number;
  proxyId?: number;
  attendedAsOwner?: boolean;
  attendedAsProxy?: boolean;
  signature?: string;
  signatureMethod?: 'digital' | 'handwritten' | 'electronic';
  verifiedBy?: number;
  verificationNotes?: string;
  notes?: string;
  isValid?: boolean;
}

export interface VerifyAttendanceDTO {
  verifiedBy: number;
  verificationNotes?: string;
}

