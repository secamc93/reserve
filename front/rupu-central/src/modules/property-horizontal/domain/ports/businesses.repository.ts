/**
 * Puerto de dominio: Repositorio de Businesses
 * Define la interfaz para obtener businesses
 */

import { Business, BusinessesPaginated } from '../entities';

export interface GetBusinessesParams {
  token: string;
  page?: number;
  per_page?: number;
  name?: string;
  business_type_id?: number;
}

export interface IBusinessesRepository {
  getBusinesses(params: GetBusinessesParams): Promise<BusinessesPaginated>;
}

// Re-exportar interfaces de configured resources
export * from './businesses/configured-resources.repository';

