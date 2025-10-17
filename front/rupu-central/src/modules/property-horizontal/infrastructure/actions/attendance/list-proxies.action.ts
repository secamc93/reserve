'use server';

import { ProxyRepository } from '../../repositories/attendance/proxy.repository';
import { Proxy } from '../../../domain/entities/attendance';

export interface ListProxiesInput {
  token: string;
  businessId: number;
  propertyUnitId?: number;
  proxyType?: 'external' | 'resident' | 'family';
  isActive?: boolean;
}

export interface ListProxiesResult {
  success: boolean;
  data?: Proxy[];
  error?: string;
}

export async function listProxiesAction(input: ListProxiesInput): Promise<ListProxiesResult> {
  try {
    const repo = new ProxyRepository();
    const data = await repo.listProxies({
      token: input.token,
      businessId: input.businessId,
      propertyUnitId: input.propertyUnitId,
      proxyType: input.proxyType,
      isActive: input.isActive,
    });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}


