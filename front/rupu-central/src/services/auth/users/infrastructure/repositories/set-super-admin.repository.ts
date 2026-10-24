/**
 * Repositorio para dar o quitar el rol de super admin a un usuario
 * IMPORTANTE: Este archivo es server-only
 */

import { SetSuperAdminParams, SetSuperAdminResponse } from '../../domain/entities/set-super-admin.entity';
import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export class SetSuperAdminRepository {
  async setSuperAdmin(params: SetSuperAdminParams): Promise<SetSuperAdminResponse> {
    const { token, user_id, enabled } = params;
    const url = `${env.API_BASE_URL}/users/${user_id}/super-admin`;
    const startTime = Date.now();
    const body = { enabled };

    logHttpRequest({ method: 'PUT', url, token, body });

    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    const duration = Date.now() - startTime;

    if (!response.ok) {
      logHttpError({ status: response.status, statusText: response.statusText, duration, data });
      throw new Error(data.error || data.message || `Error ${response.status}`);
    }

    logHttpSuccess({ status: response.status, statusText: response.statusText, duration, summary: 'Super admin actualizado', data });
    return { success: true, message: data.message, is_super_admin: !!data.is_super_admin };
  }
}
