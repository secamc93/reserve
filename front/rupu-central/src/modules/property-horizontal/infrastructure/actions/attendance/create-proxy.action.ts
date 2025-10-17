/**
 * Server Action: Create Proxy
 */

'use server';

import { CreateProxyUseCase } from '../../../application/attendance';
import { ProxyRepository } from '../../repositories/attendance/proxy.repository';
import { Proxy, CreateProxyDTO } from '../../../domain/entities/attendance';
import { logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export interface CreateProxyInput {
  token: string;
  data: CreateProxyDTO;
}

export interface CreateProxyResult {
  success: boolean;
  data?: Proxy;
  error?: string;
}

export async function createProxyAction(
  input: CreateProxyInput
): Promise<CreateProxyResult> {
  const startTime = Date.now();
  const url = `${process.env.API_BASE_URL}/attendance/proxies`;

  logHttpRequest({
    method: 'POST',
    url,
    token: input.token.substring(0, 20) + '...',
    body: input.data,
  });

  try {
    const repository = new ProxyRepository();
    const useCase = new CreateProxyUseCase(repository);

    const result = await useCase.execute(input);

    logHttpSuccess({
      status: 201,
      statusText: 'Created',
      duration: Date.now() - startTime,
      summary: `Apoderado creado: ${result.proxy.proxyName}`,
      data: result.proxy,
    });

    return {
      success: true,
      data: result.proxy,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logHttpError({
      status: 400,
      statusText: 'Bad Request',
      duration,
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    console.error('❌ Error en createProxyAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
