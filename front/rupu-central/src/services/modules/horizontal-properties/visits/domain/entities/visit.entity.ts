/**
 * Entidad: Visit
 * Representa una visita en el sistema
 */

export interface Visit {
  id: number;
  businessId: number;
  visitorId: number;
  propertyUnitId: number;
  residentId?: number;
  visitTypeId: number;
  visitStatusId: number;
  visitorVehicleId?: number;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime?: string;
  actualEntryTime?: string;
  actualExitTime?: string;
  durationMinutes?: number;
  authorizationCode: string;
  qrCode: string;
  qrCodeExpiresAt?: string;
  authorizedByResidentId?: number;
  authorizationDate?: string;
  authorizationExpiresAt?: string;
  registeredByUserId?: number;
  entryRegisteredByUserId?: number;
  exitRegisteredByUserId?: number;
  entryGate?: string;
  exitGate?: string;
  entryMethod?: string;
  purpose?: string;
  numberOfVisitors: number;
  hasCompanions: boolean;
  hasAssets: boolean;
  notes?: string;
  isRecurring: boolean;
  recurringPatternId?: number;
  parentVisitId?: number;
  durationExceeded: boolean;
  durationExceededAt?: string;
  alertSent: boolean;
  notifyResident: boolean;
  notifySecurity: boolean;
  notificationSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisitListDTO {
  id: number;
  visitorName: string;
  visitorDni: string;
  visitorPhone?: string;
  visitorId?: number;
  propertyUnitId?: number;
  propertyUnitNumber: string;
  /** Tipo de unidad en Tayazal ("Casa", "Dúplex", "Local", "Jardín"); se muestra "Casa 126". */
  propertyUnitBlock?: string;
  visitTypeName: string;
  visitStatusName: string;
  /** pending, authorized, in_progress, completed, cancelled, expired, rejected */
  visitStatusCode?: string;
  scheduledDate: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  actualEntryTime?: string;
  actualExitTime?: string;
  purpose?: string;
  numberOfVisitors?: number;
  createdAt: string;
  visitorVehiclePlate?: string;
  authorizationCode?: string;
  entryGate?: string;
  /** Residente que recibe la visita. */
  residentName?: string;
  /** Residente que autorizó la visita. */
  authorizedByName?: string;
  /** Minutos de permanencia permitidos por el tipo de visita. */
  stayLimitMinutes?: number;
  /** Dentro y pasada de su tiempo. */
  exceedsTime?: boolean;
}

/** Activo (equipo) declarado en una visita. */
export interface VisitAssetItem {
  id: number;
  assetName: string;
  assetDescription?: string;
  assetSerial?: string;
  assetBrand?: string;
  entryRegistered: boolean;
  exitRegistered: boolean;
}

/** Vehículo con que llega un visitante. */
export interface VisitorVehicle {
  id: number;
  visitorId?: number;
  plate: string;
  brand?: string;
  color?: string;
}

export interface CreateVisitorVehicleDTO {
  visitorId?: number;
  plate: string;
  brand?: string;
  color?: string;
}

/** Estado de una visita tal como lo ve la portería. */
export type VisitState = 'inside' | 'expected' | 'left' | 'cancelled';

/** Conteos de las visitas de un día por estado de portería. */
export interface VisitsSummary {
  date: string;
  inside: number;
  expected: number;
  left: number;
  cancelled: number;
  total: number;
  /** Visitantes dentro ahora, sin importar el día programado. */
  insideNow: number;
  /** Dentro ahora y pasados de su tiempo. */
  exceeded: number;
  /** Hora programada (pared, UTC) de la próxima esperada del día. */
  nextExpectedAt?: string;
  nextUnitNumber?: string;
  nextUnitBlock?: string;
  /** Estadía promedio (min) de las que salieron ese día. */
  avgStayMinutes?: number;
}

export interface VisitsPaginated {
  visits: VisitListDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateVisitDTO {
  visitorId: number;
  propertyUnitId: number;
  residentId?: number;
  visitTypeId: number;
  visitorVehicleId?: number;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime?: string;
  purpose?: string;
  numberOfVisitors?: number;
  hasCompanions?: boolean;
  hasAssets?: boolean;
  notes?: string;
  notifyResident?: boolean;
  notifySecurity?: boolean;
}

export interface RegisterEntryDTO {
  gate: string;
  method: 'qr_code' | 'manual' | 'ocr' | 'lpr';
}

export interface RegisterExitDTO {
  gate: string;
}

export interface CreateVisitAssetDTO {
  assetName: string;
  assetDescription?: string;
  assetSerial?: string;
  assetBrand?: string;
}

export interface RegisterAssetsDTO {
  assets: CreateVisitAssetDTO[];
}

// DTOs para Update y Delete
export interface UpdateVisitDTO {
  propertyUnitId?: number;
  residentId?: number;
  visitTypeId?: number;
  scheduledDate?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  purpose?: string;
  numberOfVisitors?: number;
  notes?: string;
  notifyResident?: boolean;
  notifySecurity?: boolean;
}

// Tipos de visita
export interface VisitType {
  id: number;
  name: string;
  code: string;
  description: string;
  requiresAuthorization: boolean;
  requiresVehicleRegistration: boolean;
  requiresCompanions: boolean;
  requiresAssetsTracking: boolean;
  maxDurationHours?: number;
  defaultDurationMinutes?: number;
  isActive: boolean;
}

// Estados de visita
export interface VisitStatus {
  id: number;
  code: string;
  name: string;
  description: string;
  isFinal: boolean;
  isActive: boolean;
}

// Acompañantes
export interface VisitCompanion {
  id: number;
  visitId: number;
  visitorId?: number;
  companionName: string;
  companionDni: string;
  companionPhone?: string;
  isMinor: boolean;
  relationship?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitCompanionDTO {
  companionName: string;
  companionDni: string;
  companionPhone?: string;
  isMinor?: boolean;
  relationship?: string;
  notes?: string;
}

// Activos
export interface VisitAsset {
  id: number;
  visitId: number;
  assetName: string;
  assetDescription?: string;
  assetSerial?: string;
  assetBrand?: string;
  entryRegistered: boolean;
  entryRegisteredAt?: string;
  exitRegistered: boolean;
  exitRegisteredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
