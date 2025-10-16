/**
 * Puerto (Interface): IResidentsRepository
 * Define los métodos para gestionar residentes
 */

import { Resident, ResidentsPaginated, CreateResidentDTO, UpdateResidentDTO, BulkUpdateResidentDTO } from '../entities/residents';

export interface GetResidentsParams {
  hpId: number;
  token: string;
  page?: number;
  pageSize?: number;
  name?: string;
  propertyUnitId?: number;
  propertyUnitNumber?: string; // Nuevo filtro por número de unidad
  residentTypeId?: number;
  isActive?: boolean;
  isMainResident?: boolean;
}

export interface GetResidentByIdParams {
  hpId: number;
  residentId: number;
  token: string;
}

export interface CreateResidentParams {
  hpId: number;
  data: CreateResidentDTO;
  token: string;
}

export interface UpdateResidentParams {
  hpId: number;
  residentId: number;
  data: UpdateResidentDTO;
  token: string;
}

export interface DeleteResidentParams {
  hpId: number;
  residentId: number;
  token: string;
}

export interface BulkUpdateResidentsParams {
  hpId: number;
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

