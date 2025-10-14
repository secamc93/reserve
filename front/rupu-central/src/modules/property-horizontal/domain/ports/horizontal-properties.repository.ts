/**
 * Puerto: Repositorio de Propiedades Horizontales
 */

import { HorizontalPropertiesPaginated, HorizontalProperty, CreateHorizontalPropertyDTO } from '../entities';

export interface GetHorizontalPropertiesParams {
  token: string;
  page?: number;
  pageSize?: number;
  name?: string;
  code?: string;
  isActive?: boolean;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

export interface GetHorizontalPropertyByIdParams {
  token: string;
  id: number;
}

export interface CreateHorizontalPropertyParams {
  token: string;
  data: CreateHorizontalPropertyDTO;
}

export interface DeleteHorizontalPropertyParams {
  token: string;
  id: number;
}

export interface IHorizontalPropertiesRepository {
  getHorizontalProperties(params: GetHorizontalPropertiesParams): Promise<HorizontalPropertiesPaginated>;
  getHorizontalPropertyById(params: GetHorizontalPropertyByIdParams): Promise<HorizontalProperty>;
  createHorizontalProperty(params: CreateHorizontalPropertyParams): Promise<HorizontalProperty>;
  deleteHorizontalProperty(params: DeleteHorizontalPropertyParams): Promise<void>;
}

