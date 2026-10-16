/**
 * Server Actions: contraseñas de voto por unidad de un grupo de votación.
 * Desde que el grupo tiene contraseñas, el voto público por QR exige la de la unidad.
 */

'use server';

import { env, logHttpRequest, logHttpError } from '@shared/config';

export interface VotingCredential {
  propertyUnitId: number;
  unitNumber: string;
  /** Tipo o bloque de la unidad ("Casa", "Local"...). */
  unitBlock: string;
  ownerName: string;
  password: string;
}

export interface ListVotingCredentialsResult {
  success: boolean;
  data?: { credentials: VotingCredential[]; total: number; page: number; pageSize: number; totalPages: number };
  error?: string;
}

export interface GenerateVotingCredentialsResult {
  success: boolean;
  data?: { generated: number; total: number };
  error?: string;
}

const base = (groupId: number) => `${env.API_BASE_URL}/horizontal-properties/voting-groups/${groupId}/credentials`;

export async function generateVotingCredentialsAction(input: {
  token: string;
  businessId: number;
  groupId: number;
  /** Reemplaza todas: las credenciales impresas antes dejan de servir. */
  regenerate?: boolean;
}): Promise<GenerateVotingCredentialsResult> {
  const url = `${base(input.groupId)}/generate?business_id=${input.businessId}`;
  logHttpRequest({ method: 'POST', url });
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${input.token}` },
      body: JSON.stringify({ regenerate: Boolean(input.regenerate) }),
    });
    const data = await response.json();
    if (!response.ok) {
      logHttpError({ status: response.status, statusText: response.statusText, duration: 0, data });
      return { success: false, error: data.message || data.error || `Error ${response.status}` };
    }
    return { success: true, data: { generated: data.data.generated, total: data.data.total } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error de conexión' };
  }
}

export async function listVotingCredentialsAction(input: {
  token: string;
  businessId: number;
  groupId: number;
  page: number;
  pageSize: number;
}): Promise<ListVotingCredentialsResult> {
  const qs = new URLSearchParams({
    business_id: String(input.businessId),
    page: String(input.page),
    page_size: String(input.pageSize),
  });
  const url = `${base(input.groupId)}?${qs}`;
  logHttpRequest({ method: 'GET', url });
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${input.token}` },
      cache: 'no-store',
    });
    const data = await response.json();
    if (!response.ok) {
      logHttpError({ status: response.status, statusText: response.statusText, duration: 0, data });
      return { success: false, error: data.message || data.error || `Error ${response.status}` };
    }
    const d = data.data;
    return {
      success: true,
      data: {
        credentials: (d.credentials ?? []).map((c: Record<string, unknown>) => ({
          propertyUnitId: Number(c.property_unit_id),
          unitNumber: String(c.unit_number ?? ''),
          unitBlock: String(c.unit_block ?? ''),
          ownerName: String(c.owner_name ?? ''),
          password: String(c.password ?? ''),
        })),
        total: d.total,
        page: d.page,
        pageSize: d.page_size,
        totalPages: d.total_pages,
      },
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error de conexión' };
  }
}
