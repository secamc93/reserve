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
  propertyUnitNumber: string;
  visitTypeName: string;
  visitStatusName: string;
  scheduledDate: string;
  actualEntryTime?: string;
  actualExitTime?: string;
  createdAt: string;
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
