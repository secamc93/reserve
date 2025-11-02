/**
 * Puerto (Interface): IResidentsRepository
 * Define los métodos para gestionar residentes
 */

import { Resident, ResidentsPaginated, CreateResidentDTO, UpdateResidentDTO, BulkUpdateResidentDTO } from '../entities/residents';

export interface GetResidentsParams {
  businessId: number;
  token: string;
  page?: number;
  pageSize?: number;
  name?: string;
  propertyUnitId?: number;
  propertyUnitNumber?: string; // Nuevo filtro por número de unidad
  residentTypeId?: number;
  isActive?: boolean;
  isMainResident?: boolean;
  dni?: string; // Filtro por DNI parcial
}

export interface GetResidentByIdParams {
  businessId: number;
  residentId: number;
  token: string;
}

export interface CreateResidentParams {
  businessId: number;
  data: CreateResidentDTO;
  token: string;
}

export interface UpdateResidentParams {
  businessId: number;
  residentId: number;
  data: UpdateResidentDTO;
  token: string;
}

export interface DeleteResidentParams {
  businessId: number;
  residentId: number;
  token: string;
}

export interface BulkUpdateResidentsParams {
  businessId: number;
  file: File;
  token: string;
}

export interface BulkUpdateResidentsResponse {
  success: boolean;
  message: string;
  data: {
    total_processed: number;
    updated: number;
    errors: number;
    error_details: Array<{
      row: number;
      property_unit_number: string;
      error: string;
    }>;
  };
}

export interface IResidentsRepository {
  getResidents(params: GetResidentsParams): Promise<ResidentsPaginated>;
  getResidentById(params: GetResidentByIdParams): Promise<Resident>;
  createResident(params: CreateResidentParams): Promise<Resident>;
  updateResident(params: UpdateResidentParams): Promise<Resident>;
  deleteResident(params: DeleteResidentParams): Promise<void>;
  bulkUpdateResidents(params: BulkUpdateResidentsParams): Promise<BulkUpdateResidentsResponse>;
}

