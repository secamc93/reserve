/**
 * Server Action: Mark Attendance
 */

'use server';

import { MarkAttendanceUseCase } from '../../../application/attendance';
import { AttendanceRecordRepository } from '../../repositories/attendance/attendance-record.repository';
import { AttendanceRecord, MarkAttendanceDTO } from '../../../domain/entities/attendance';
import { logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export interface MarkAttendanceInput {
  token: string;
  data: MarkAttendanceDTO;
}

export interface MarkAttendanceResult {
  success: boolean;
  data?: AttendanceRecord;
  error?: string;
}

export async function markAttendanceAction(
  input: MarkAttendanceInput
): Promise<MarkAttendanceResult> {
  const startTime = Date.now();
  const url = `${process.env.API_BASE_URL}/attendance/records/mark`;

  logHttpRequest({
    method: 'POST',
    url,
    token: input.token.substring(0, 20) + '...',
    // Log with snake_case preview to match backend contract
    body: {
      attendance_list_id: input.data.attendanceListId,
      property_unit_id: input.data.propertyUnitId,
      resident_id: input.data.residentId,
      proxy_id: input.data.proxyId,
      attended_as_owner: input.data.attendedAsOwner,
      attended_as_proxy: input.data.attendedAsProxy,
      signature: input.data.signature,
      signature_method: input.data.signatureMethod,
      notes: input.data.notes,
    },
  });

  try {
    const repository = new AttendanceRecordRepository();
    const useCase = new MarkAttendanceUseCase(repository);

    const result = await useCase.execute(input);

    logHttpSuccess({
      status: 201,
      statusText: 'Created',
      duration: Date.now() - startTime,
    summary: `Asistencia marcada para unidad ${input.data.propertyUnitId}`,
      data: result.attendanceRecord,
    });

    return {
      success: true,
      data: result.attendanceRecord,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logHttpError({
      status: 400,
      statusText: 'Bad Request',
      duration,
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    console.error('❌ Error en markAttendanceAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
