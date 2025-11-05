'use server';

import { ProxyRepository } from '../../repositories/attendance/proxy.repository';
import { Proxy, UpdateProxyDTO } from '../../../domain/entities/attendance';

export interface UpdateProxyInput { token: string; id: number; data: UpdateProxyDTO }
export interface UpdateProxyResult { success: boolean; data?: Proxy; error?: string }

export async function updateProxyAction(input: UpdateProxyInput): Promise<UpdateProxyResult> {
  try {
    const repo = new ProxyRepository();
    const data = await repo.updateProxy({ token: input.token, id: input.id, data: input.data });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}



