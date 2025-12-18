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
  RegisterEntryDTO,
  RegisterExitDTO,
  RegisterAssetsDTO,
  CreateVisitorDTO,
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

export interface IVisitsRepository {
  searchVisitor(params: SearchVisitorParams): Promise<Visitor>;
  getVisits(params: GetVisitsParams): Promise<VisitsPaginated>;
  getVisitById(params: GetVisitByIdParams): Promise<Visit>;
  getVisitByQRCode(params: GetVisitByQRCodeParams): Promise<Visit>;
  createVisit(params: CreateVisitParams): Promise<Visit>;
  registerEntry(params: RegisterEntryParams): Promise<Visit>;
  registerExit(params: RegisterExitParams): Promise<Visit>;
  registerAssets(params: RegisterAssetsParams): Promise<void>;
  createVisitor(params: CreateVisitorParams): Promise<Visitor>;
}
