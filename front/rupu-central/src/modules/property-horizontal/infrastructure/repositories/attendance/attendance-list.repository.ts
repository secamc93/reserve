/**
 * Repository Implementation: AttendanceList
 */

import { IAttendanceListRepository, CreateAttendanceListParams, GenerateAttendanceListParams, GetAttendanceListParams, UpdateAttendanceListParams, DeleteAttendanceListParams, ListAttendanceListsParams, GetAttendanceListSummaryParams, GetAttendanceListRecordsParams } from '../../../domain/ports/attendance';
import { AttendanceList, AttendanceListSummary } from '../../../domain/entities/attendance';
import { logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export class AttendanceListRepository implements IAttendanceListRepository {
  async createAttendanceList(params: CreateAttendanceListParams): Promise<AttendanceList> {
    const startTime = Date.now();
    const url = `${process.env.API_BASE_URL}/attendance/lists`;

    logHttpRequest({
      method: 'POST',
      url,
      token: params.token.substring(0, 20) + '...',
      body: params.data,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params.data),
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.error || data.message || `Error ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: 'Lista de asistencia creada exitosamente',
        data: data.data,
      });

      return data.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  async generateAttendanceList(params: GenerateAttendanceListParams): Promise<AttendanceList> {
    const startTime = Date.now();
    const url = `${process.env.API_BASE_URL}/attendance/lists/generate?voting_group_id=${params.votingGroupId}`;

    logHttpRequest({
      method: 'POST',
      url,
      token: params.token.substring(0, 20) + '...',
      body: null, // No body needed, only query parameter
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.error || data.message || `Error ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: 'Lista de asistencia generada automáticamente',
        data: data.data,
      });

      return data.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  async getAttendanceListById(params: GetAttendanceListParams): Promise<AttendanceList> {
    const startTime = Date.now();
    const url = `${process.env.API_BASE_URL}/attendance/lists/${params.id}`;

    logHttpRequest({ method: 'GET', url, token: params.token.substring(0, 20) + '...' });

    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${params.token}` },
      });
      const data = await response.json();
      const duration = Date.now() - startTime;
      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.error || data.message || `Error ${response.status}`);
      }
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, summary: 'Lista obtenida', data: data.data });
      return data.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: error instanceof Error ? error.message : 'Unknown error' } });
      throw error;
    }
  }

  async updateAttendanceList(params: UpdateAttendanceListParams): Promise<AttendanceList> {
    // Placeholder - implementar cuando el backend esté disponible
    console.log('UpdateAttendanceList params:', params);
    throw new Error('UpdateAttendanceList no implementado aún');
  }

  async deleteAttendanceList(params: DeleteAttendanceListParams): Promise<void> {
    const startTime = Date.now();
    const url = `${process.env.API_BASE_URL}/attendance/lists/${params.id}`;

    logHttpRequest({
      method: 'DELETE',
      url,
      token: params.token.substring(0, 20) + '...',
    });

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${params.token}`,
        },
      });

      const data = await response.json().catch(() => ({}));
      const duration = Date.now() - startTime;

      if (!response.ok) {
        logHttpError({
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
        });
        throw new Error(data.error || data.message || `Error ${response.status}`);
      }

      logHttpSuccess({
        status: response.status,
        statusText: response.statusText,
        duration,
        summary: 'Lista de asistencia eliminada',
        data,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({
        status: 0,
        statusText: 'Network Error',
        duration,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  async listAttendanceLists(params: ListAttendanceListsParams): Promise<AttendanceList[]> {
    const startTime = Date.now();
    const url = new URL(`${process.env.API_BASE_URL}/attendance/lists`);
    url.searchParams.append('business_id', String(params.businessId));
    if (params.title) url.searchParams.append('title', params.title);
    if (params.isActive !== undefined) url.searchParams.append('is_active', String(params.isActive));

    logHttpRequest({ method: 'GET', url: url.toString(), token: params.token.substring(0, 20) + '...' });

    try {
      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${params.token}` },
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.error || data.message || `Error ${response.status}`);
      }

      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, summary: 'Listas de asistencia obtenidas', data: data.data });
      return data.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: error instanceof Error ? error.message : 'Unknown error' } });
      throw error;
    }
  }

  async getAttendanceListSummary(params: GetAttendanceListSummaryParams): Promise<AttendanceListSummary> {
    const startTime = Date.now();
    const url = `${process.env.API_BASE_URL}/attendance/lists/${params.id}/summary`;
    logHttpRequest({ method: 'GET', url, token: params.token.substring(0, 20) + '...' });
    try {
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${params.token}` } });
      const data = await response.json();
      const duration = Date.now() - startTime;
      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.error || data.message || `Error ${response.status}`);
      }
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, summary: 'Resumen obtenido', data: data.data });
      return data.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: error instanceof Error ? error.message : 'Unknown error' } });
      throw error;
    }
  }

  async getAttendanceListRecords(params: GetAttendanceListRecordsParams): Promise<AttendanceList[]> {
    const startTime = Date.now();
    const url = `${process.env.API_BASE_URL}/attendance/lists/${params.id}/records`;
    logHttpRequest({ method: 'GET', url, token: params.token.substring(0, 20) + '...' });
    try {
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${params.token}` } });
      const data = await response.json();
      const duration = Date.now() - startTime;
      if (!response.ok) {
        logHttpError({ status: response.status, statusText: response.statusText, duration, data });
        throw new Error(data.error || data.message || `Error ${response.status}`);
      }
      logHttpSuccess({ status: response.status, statusText: response.statusText, duration, summary: 'Registros obtenidos', data: data.data });
      return data.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logHttpError({ status: 0, statusText: 'Network Error', duration, data: { error: error instanceof Error ? error.message : 'Unknown error' } });
      throw error;
    }
  }
}
