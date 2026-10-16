/**
 * Server Actions: apoderado de un registro de la lista de asistencia.
 * El apoderado queda solo en esa lista y la unidad queda presente como apoderado.
 */

'use server';

import { env, logHttpRequest, logHttpError } from '@shared/config';

export interface RecordProxyData {
  id: number;
  propertyUnitId: number;
  proxyId: number | null;
  proxyName: string;
  attendedAsOwner: boolean;
  attendedAsProxy: boolean;
}

export interface RecordProxyResult {
  success: boolean;
  data?: RecordProxyData;
  error?: string;
}

async function call(method: 'PUT' | 'DELETE', input: { token: string; recordId: number }, body?: unknown): Promise<RecordProxyResult> {
  const url = `${env.API_BASE_URL}/attendance/records/${input.recordId}/proxy`;
  logHttpRequest({ method, url });
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${input.token}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      logHttpError({ status: response.status, statusText: response.statusText, duration: 0, data });
      return { success: false, error: data.message || data.error || `Error ${response.status}` };
    }
    const r = data.data ?? {};
    return {
      success: true,
      data: {
        id: r.id,
        propertyUnitId: r.property_unit_id,
        proxyId: r.proxy_id ?? null,
        proxyName: r.proxy_name ?? '',
        attendedAsOwner: Boolean(r.attended_as_owner),
        attendedAsProxy: Boolean(r.attended_as_proxy),
      },
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error de conexión' };
  }
}

export async function assignRecordProxyAction(input: {
  token: string;
  recordId: number;
  proxyName: string;
  proxyDni?: string;
}): Promise<RecordProxyResult> {
  return call('PUT', input, { proxy_name: input.proxyName.trim(), proxy_dni: (input.proxyDni ?? '').trim() });
}

export async function removeRecordProxyAction(input: { token: string; recordId: number }): Promise<RecordProxyResult> {
  return call('DELETE', input);
}
