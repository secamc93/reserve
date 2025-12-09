'use server';

import { ProxyRepository } from '../repositories';
import { Proxy } from '../../domain/entities';

export interface GetProxyInput { token: string; id: number }
export interface GetProxyResult { success: boolean; data?: Proxy; error?: string }

export async function getProxyAction(input: GetProxyInput): Promise<GetProxyResult> {
  try {
    const repo = new ProxyRepository();
    const data = await repo.getProxyById({ token: input.token, id: input.id });
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}



