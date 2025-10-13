/**
 * Puerto (Interface): IPropertyUnitsRepository
 * Define los métodos para gestionar unidades de propiedad
 */

import { PropertyUnit, PropertyUnitsPaginated, CreatePropertyUnitDTO, UpdatePropertyUnitDTO } from '../entities/property-units';

export interface GetPropertyUnitsParams {
  hpId: number;
  token: string;
  page?: number;
  pageSize?: number;
  number?: string; // Filtro por número de unidad (búsqueda parcial, case-insensitive)
  unitType?: string;
  floor?: number;
  block?: string;
  isActive?: boolean;
}

export interface GetPropertyUnitByIdParams {
  hpId: number;
  unitId: number;
  token: string;
}

export interface CreatePropertyUnitParams {
  hpId: number;
  data: CreatePropertyUnitDTO;
  token: string;
}

export interface UpdatePropertyUnitParams {
  hpId: number;
  unitId: number;
  data: UpdatePropertyUnitDTO;
  token: string;
}

export interface DeletePropertyUnitParams {
  hpId: number;
  unitId: number;
  token: string;
}

export interface IPropertyUnitsRepository {
  getPropertyUnits(params: GetPropertyUnitsParams): Promise<PropertyUnitsPaginated>;
  getPropertyUnitById(params: GetPropertyUnitByIdParams): Promise<PropertyUnit>;
  createPropertyUnit(params: CreatePropertyUnitParams): Promise<PropertyUnit>;
  updatePropertyUnit(params: UpdatePropertyUnitParams): Promise<PropertyUnit>;
  deletePropertyUnit(params: DeletePropertyUnitParams): Promise<void>;
}

