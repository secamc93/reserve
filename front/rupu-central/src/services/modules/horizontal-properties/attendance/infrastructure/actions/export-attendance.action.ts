/**
 * Server Action: descarga la lista de asistencia en CSV (se abre en Excel).
 *  - `list`: Casa, propietario, apoderado y firma, para tomar asistencia en papel.
 *  - `detailed`: resumen con la asistencia por coeficiente.
 * Devuelve el contenido; el navegador arma el archivo.
 */

'use server';

import { env, logHttpRequest, logHttpError } from '@shared/config';

export type AttendanceExportKind = 'list' | 'detailed';

export interface ExportAttendanceResult {
  success: boolean;
  content?: string;
  filename?: string;
  error?: string;
}

export async function exportAttendanceAction(input: {
  token: string;
  listId: number;
  kind: AttendanceExportKind;
}): Promise<ExportAttendanceResult> {
  const path = input.kind === 'detailed' ? 'export-detailed-excel' : 'export-excel';
  const url = `${env.API_BASE_URL}/attendance/lists/${input.listId}/${path}`;
  logHttpRequest({ method: 'GET', url });
  try {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${input.token}` }, cache: 'no-store' });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      logHttpError({ status: response.status, statusText: response.statusText, duration: 0, data });
      return { success: false, error: data.message || data.error || `Error ${response.status}` };
    }
    const content = await response.text();
    const filename = `${input.kind === 'detailed' ? 'resumen-asistencia' : 'lista-asistencia'}-${input.listId}.csv`;
    return { success: true, content, filename };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error de conexión' };
  }
}
