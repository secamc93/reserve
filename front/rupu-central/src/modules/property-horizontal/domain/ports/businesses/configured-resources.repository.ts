/**
 * Puerto de dominio: Repositorio de Configured Resources
 * Define la interfaz para obtener recursos configurados de un business
 */

import { BusinessConfiguredResources } from '../../entities';

export interface GetBusinessConfiguredResourcesParams {
  token: string;
  businessId: number;
}

export interface ActivateResourceParams {
  token: string;
  resourceId: number;
  businessId: number;
}

export interface DeactivateResourceParams {
  token: string;
  resourceId: number;
  businessId: number;
}

export interface IBusinessConfiguredResourcesRepository {
  getBusinessConfiguredResources(params: GetBusinessConfiguredResourcesParams): Promise<BusinessConfiguredResources>;
  activateResource(params: ActivateResourceParams): Promise<void>;
  deactivateResource(params: DeactivateResourceParams): Promise<void>;
}
