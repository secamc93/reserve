/**
 * Guardians Repository Port
 * Contrato de interfaz para el repositorio de apoderados
 */

import { Guardian, CreateGuardianDTO, UpdateGuardianDTO, PlayerGuardian, AssignGuardianDTO } from '../entities';

/**
 * Parámetros para obtener lista de apoderados (paginada)
 */
export interface GetGuardiansParams {
  businessId: number;
  token: string;
  page?: number;
  pageSize?: number;
  name?: string;
  documentNumber?: string;
  isActive?: boolean;
}

/**
 * Parámetros para obtener un apoderado por ID
 */
export interface GetGuardianByIdParams {
  businessId: number;
  guardianId: number;
  token: string;
}

/**
 * Parámetros para crear apoderado
 */
export interface CreateGuardianParams {
  token: string;
  data: CreateGuardianDTO;
}

/**
 * Parámetros para actualizar apoderado
 */
export interface UpdateGuardianParams {
  businessId: number;
  guardianId: number;
  token: string;
  data: UpdateGuardianDTO;
}

/**
 * Parámetros para eliminar apoderado
 */
export interface DeleteGuardianParams {
  businessId: number;
  guardianId: number;
  token: string;
}

/**
 * Parámetros para asignar apoderado a jugador
 */
export interface AssignGuardianParams {
  token: string;
  data: AssignGuardianDTO;
}

/**
 * Parámetros para obtener apoderados de un jugador
 */
export interface GetPlayerGuardiansParams {
  businessId: number;
  playerId: number;
  token: string;
}

/**
 * Parámetros para remover apoderado de jugador
 */
export interface RemoveGuardianFromPlayerParams {
  businessId: number;
  playerId: number;
  guardianId: number;
  token: string;
}

/**
 * Response paginado de apoderados
 */
export interface GuardiansPaginated {
  data: Guardian[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Interfaz del repositorio de apoderados
 */
export interface IGuardiansRepository {
  getGuardians(params: GetGuardiansParams): Promise<GuardiansPaginated>;
  getGuardianById(params: GetGuardianByIdParams): Promise<Guardian>;
  createGuardian(params: CreateGuardianParams): Promise<Guardian>;
  updateGuardian(params: UpdateGuardianParams): Promise<Guardian>;
  deleteGuardian(params: DeleteGuardianParams): Promise<void>;
  assignGuardian(params: AssignGuardianParams): Promise<void>;
  getPlayerGuardians(params: GetPlayerGuardiansParams): Promise<PlayerGuardian[]>;
  removeGuardianFromPlayer(params: RemoveGuardianFromPlayerParams): Promise<void>;
}
