/**
 * Puerto (Interface): IVisitsRepository
 * Define los métodos para gestionar visitas
 */

import {
  Visitor,
  Visit,
  VisitListDTO,
  VisitsPaginated,
  CreateVisitDTO,
  UpdateVisitDTO,
  RegisterEntryDTO,
  RegisterExitDTO,
  RegisterAssetsDTO,
  CreateVisitorDTO,
  VisitType,
  VisitStatus,
  VisitCompanion,
  CreateVisitCompanionDTO,
} from '../entities';

export interface SearchVisitorParams {
  businessId: number;
  dni: string;
  token: string;
}

export interface GetVisitsParams {
  businessId: number;
  token: string;
  page?: number;
  pageSize?: number;
  visitorId?: number;
  propertyUnitId?: number;
  residentId?: number;
  visitTypeId?: number;
  visitStatusId?: number;
  startDate?: string;
  endDate?: string;
}

export interface GetVisitByIdParams {
  businessId: number;
  visitId: number;
  token: string;
}

export interface GetVisitByQRCodeParams {
  qrCode: string;
  token: string;
}

export interface CreateVisitParams {
  businessId: number;
  data: CreateVisitDTO;
  token: string;
}

export interface RegisterEntryParams {
  businessId: number;
  visitId: number;
  data: RegisterEntryDTO;
  token: string;
}

export interface RegisterExitParams {
  businessId: number;
  visitId: number;
  data: RegisterExitDTO;
  token: string;
}

export interface RegisterAssetsParams {
  businessId: number;
  visitId: number;
  data: RegisterAssetsDTO;
  token: string;
}

export interface CreateVisitorParams {
  businessId: number;
  data: CreateVisitorDTO;
  token: string;
}

export interface UpdateVisitParams {
  businessId: number;
  visitId: number;
  data: UpdateVisitDTO;
  token: string;
}

export interface DeleteVisitParams {
  businessId: number;
  visitId: number;
  token: string;
}

export interface GetVisitTypesParams {
  token: string;
}

export interface GetVisitStatusesParams {
  token: string;
}

export interface GetCompanionsParams {
  businessId: number;
  visitId: number;
  token: string;
}

export interface CreateCompanionParams {
  businessId: number;
  visitId: number;
  data: CreateVisitCompanionDTO;
  token: string;
}

export interface DeleteCompanionParams {
  businessId: number;
  visitId: number;
  companionId: number;
  token: string;
}

export interface IVisitsRepository {
  // Visitantes
  searchVisitor(params: SearchVisitorParams): Promise<Visitor>;
  createVisitor(params: CreateVisitorParams): Promise<Visitor>;

  // CRUD Visitas
  getVisits(params: GetVisitsParams): Promise<VisitsPaginated>;
  getVisitById(params: GetVisitByIdParams): Promise<Visit>;
  getVisitByQRCode(params: GetVisitByQRCodeParams): Promise<Visit>;
  createVisit(params: CreateVisitParams): Promise<Visit>;
  updateVisit(params: UpdateVisitParams): Promise<Visit>;
  deleteVisit(params: DeleteVisitParams): Promise<void>;

  // Entrada/Salida
  registerEntry(params: RegisterEntryParams): Promise<Visit>;
  registerExit(params: RegisterExitParams): Promise<Visit>;

  // Activos
  registerAssets(params: RegisterAssetsParams): Promise<void>;

  // Tipos y estados
  getVisitTypes(params: GetVisitTypesParams): Promise<VisitType[]>;
  getVisitStatuses(params: GetVisitStatusesParams): Promise<VisitStatus[]>;

  // Acompañantes
  getCompanions(params: GetCompanionsParams): Promise<VisitCompanion[]>;
  createCompanion(params: CreateCompanionParams): Promise<VisitCompanion>;
  deleteCompanion(params: DeleteCompanionParams): Promise<void>;
}
