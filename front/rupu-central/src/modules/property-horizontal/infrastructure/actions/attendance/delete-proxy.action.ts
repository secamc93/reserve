'use server';

import { ProxyRepository } from '../../repositories/attendance/proxy.repository';

export interface DeleteProxyInput { token: string; id: number }
export interface DeleteProxyResult { success: boolean; error?: string }

export async function deleteProxyAction(input: DeleteProxyInput): Promise<DeleteProxyResult> {
  try {
    const repo = new ProxyRepository();
    await repo.deleteProxy({ token: input.token, id: input.id });
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}


