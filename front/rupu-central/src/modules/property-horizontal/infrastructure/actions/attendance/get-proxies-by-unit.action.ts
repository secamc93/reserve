'use server';

import { ProxyRepository } from '../../repositories/attendance/proxy.repository';
import { Proxy } from '../../../domain/entities/attendance';

export interface GetProxiesByUnitInput { token: string; unitId: number }
export interface GetProxiesByUnitResult { success: boolean; data?: Proxy[]; error?: string }

export async function getProxiesByUnitAction(input: GetProxiesByUnitInput): Promise<GetProxiesByUnitResult> {
  try {
    const repo = new ProxyRepository();
    const data = await repo.getProxiesByPropertyUnit({ token: input.token, unitId: input.unitId });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}



