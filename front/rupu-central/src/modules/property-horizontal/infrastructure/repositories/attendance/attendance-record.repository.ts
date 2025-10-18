/**
 * Repository Implementation: AttendanceRecord
 */

import { IAttendanceRecordRepository, MarkAttendanceParams, CreateAttendanceRecordParams, GetAttendanceRecordParams, UpdateAttendanceRecordParams, DeleteAttendanceRecordParams, ListAttendanceRecordsParams, VerifyAttendanceParams } from '../../../domain/ports/attendance';
import { AttendanceRecord } from '../../../domain/entities/attendance';
import { logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export class AttendanceRecordRepository implements IAttendanceRecordRepository {
  async markAttendance(params: MarkAttendanceParams): Promise<AttendanceRecord> {
    const startTime = Date.now();
    const url = `${process.env.API_BASE_URL}/attendance/records/mark`;

    // Convert DTO (camelCase) to API payload (snake_case)
    const payload: Record<string, unknown> = {
      attendance_list_id: params.data.attendanceListId,
      property_unit_id: params.data.propertyUnitId,
      attended_as_owner: params.data.attendedAsOwner,
      attended_as_proxy: params.data.attendedAsProxy,
    };
    if (params.data.residentId != null) payload.resident_id = params.data.residentId;
    if (params.data.proxyId != null) payload.proxy_id = params.data.proxyId;
    if (params.data.signature != null) payload.signature = params.data.signature;
    if (params.data.signatureMethod != null) payload.signature_method = params.data.signatureMethod;
    if (params.data.notes != null) payload.notes = params.data.notes;

    logHttpRequest({
      method: 'POST',
      url,
      token: params.token.substring(0, 20) + '...',
      body: payload,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
        summary: 'Asistencia marcada exitosamente',
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

  async createAttendanceRecord(params: CreateAttendanceRecordParams): Promise<AttendanceRecord> {
    // Placeholder - implementar cuando el backend esté disponible
    console.log('CreateAttendanceRecord params:', params);
    throw new Error('CreateAttendanceRecord no implementado aún');
  }

  async getAttendanceRecordById(params: GetAttendanceRecordParams): Promise<AttendanceRecord> {
    // Placeholder - implementar cuando el backend esté disponible
    console.log('GetAttendanceRecordById params:', params);
    throw new Error('GetAttendanceRecordById no implementado aún');
  }

  async updateAttendanceRecord(params: UpdateAttendanceRecordParams): Promise<AttendanceRecord> {
    // Placeholder - implementar cuando el backend esté disponible
    console.log('UpdateAttendanceRecord params:', params);
    throw new Error('UpdateAttendanceRecord no implementado aún');
  }

  async deleteAttendanceRecord(params: DeleteAttendanceRecordParams): Promise<void> {
    // Placeholder - implementar cuando el backend esté disponible
    console.log('DeleteAttendanceRecord params:', params);
    throw new Error('DeleteAttendanceRecord no implementado aún');
  }

  async listAttendanceRecords(params: ListAttendanceRecordsParams): Promise<AttendanceRecord[]> {
    // Placeholder - implementar cuando el backend esté disponible
    console.log('ListAttendanceRecords params:', params);
    throw new Error('ListAttendanceRecords no implementado aún');
  }

  async verifyAttendance(params: VerifyAttendanceParams): Promise<AttendanceRecord> {
    // Placeholder - implementar cuando el backend esté disponible
    console.log('VerifyAttendance params:', params);
    throw new Error('VerifyAttendance no implementado aún');
  }

  async markAttendanceSimple(params: { token: string; recordId: number }): Promise<AttendanceRecord> {
    const startTime = Date.now();
    const url = `${process.env.API_BASE_URL}/attendance/records/${params.recordId}/mark`;

    logHttpRequest({
      method: 'POST',
      url,
      token: params.token.substring(0, 20) + '...',
      body: null,
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
        summary: 'Asistencia marcada exitosamente (simple)',
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

  async unmarkAttendanceSimple(params: { token: string; recordId: number }): Promise<AttendanceRecord> {
    const startTime = Date.now();
    const url = `${process.env.API_BASE_URL}/attendance/records/${params.recordId}/unmark`;

    logHttpRequest({
      method: 'POST',
      url,
      token: params.token.substring(0, 20) + '...',
      body: null,
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
        summary: 'Asistencia desmarcada exitosamente (simple)',
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
}
