/**
 * Coaches Repository Port
 * Contrato de interfaz para el repositorio de entrenadores
 */

import { Coach, CreateCoachDTO, UpdateCoachDTO, AssignCoachSpecialtyDTO } from '../entities';

/**
 * Parámetros para obtener lista de entrenadores (paginada)
 */
export interface GetCoachesParams {
  businessId: number;
  token: string;
  page?: number;
  pageSize?: number;
  name?: string;
  specialtyId?: number;
  isActive?: boolean;
}

/**
 * Parámetros para obtener un entrenador por ID
 */
export interface GetCoachByIdParams {
  businessId: number;
  coachId: number;
  token: string;
}

/**
 * Parámetros para crear entrenador
 */
export interface CreateCoachParams {
  token: string;
  data: CreateCoachDTO;
}

/**
 * Parámetros para actualizar entrenador
 */
export interface UpdateCoachParams {
  businessId: number;
  coachId: number;
  token: string;
  data: UpdateCoachDTO;
}

/**
 * Parámetros para eliminar entrenador
 */
export interface DeleteCoachParams {
  businessId: number;
  coachId: number;
  token: string;
}

/**
 * Parámetros para asignar especialidad
 */
export interface AssignCoachSpecialtyParams {
  token: string;
  data: AssignCoachSpecialtyDTO;
}

/**
 * Response paginado de entrenadores
 */
export interface CoachesPaginated {
  data: Coach[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Interfaz del repositorio de entrenadores
 */
export interface ICoachesRepository {
  getCoaches(params: GetCoachesParams): Promise<CoachesPaginated>;
  getCoachById(params: GetCoachByIdParams): Promise<Coach>;
  createCoach(params: CreateCoachParams): Promise<Coach>;
  updateCoach(params: UpdateCoachParams): Promise<Coach>;
  deleteCoach(params: DeleteCoachParams): Promise<void>;
  assignSpecialty(params: AssignCoachSpecialtyParams): Promise<void>;
}
