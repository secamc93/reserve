/**
 * Puerto: Repositorio de Propiedades Horizontales
 */

import { HorizontalPropertiesPaginated } from '../entities/horizontal-property.entity';

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

export interface IHorizontalPropertiesRepository {
  getHorizontalProperties(params: GetHorizontalPropertiesParams): Promise<HorizontalPropertiesPaginated>;
}

