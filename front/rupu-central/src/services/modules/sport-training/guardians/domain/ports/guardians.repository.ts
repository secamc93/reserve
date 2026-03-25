/**
 * Guardians Repository Port
 * Contrato de interfaz para el repositorio de tutores
 */

import { Guardian, CreateGuardianDTO, UpdateGuardianDTO } from '../entities';

export interface GetGuardiansParams {
  businessId: number;
  token: string;
  page?: number;
  pageSize?: number;
  name?: string;
  isActive?: boolean;
}

export interface GetGuardianByIdParams {
  businessId: number;
  guardianId: number;
  token: string;
}

export interface CreateGuardianParams {
  token: string;
  data: CreateGuardianDTO;
}

export interface UpdateGuardianParams {
  businessId: number;
  guardianId: number;
  token: string;
  data: UpdateGuardianDTO;
}

export interface GuardiansPaginated {
  data: Guardian[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IGuardiansRepository {
  getGuardians(params: GetGuardiansParams): Promise<GuardiansPaginated>;
  getGuardianById(params: GetGuardianByIdParams): Promise<Guardian>;
  createGuardian(params: CreateGuardianParams): Promise<Guardian>;
  updateGuardian(params: UpdateGuardianParams): Promise<Guardian>;
}
