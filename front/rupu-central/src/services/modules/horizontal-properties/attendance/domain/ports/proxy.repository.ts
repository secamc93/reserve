/**
 * Repository Interface: Proxy
 */

import { Proxy, CreateProxyDTO, UpdateProxyDTO } from '../../entities/attendance';

export interface CreateProxyParams {
  token: string;
  data: CreateProxyDTO;
}

export interface GetProxyParams {
  token: string;
  id: number;
}

export interface UpdateProxyParams {
  token: string;
  id: number;
  data: UpdateProxyDTO;
}

export interface DeleteProxyParams {
  token: string;
  id: number;
}

export interface ListProxiesParams {
  token: string;
  businessId: number;
  propertyUnitId?: number;
  proxyType?: 'external' | 'resident' | 'family';
  isActive?: boolean;
}

export interface GetProxiesByPropertyUnitParams {
  token: string;
  unitId: number;
}

export interface IProxyRepository {
  createProxy(params: CreateProxyParams): Promise<Proxy>;
  getProxyById(params: GetProxyParams): Promise<Proxy>;
  updateProxy(params: UpdateProxyParams): Promise<Proxy>;
  deleteProxy(params: DeleteProxyParams): Promise<void>;
  listProxies(params: ListProxiesParams): Promise<Proxy[]>;
  getProxiesByPropertyUnit(params: GetProxiesByPropertyUnitParams): Promise<Proxy[]>;
}

