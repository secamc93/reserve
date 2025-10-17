/**
 * Server Action: Create Attendance List
 */

'use server';

import { CreateAttendanceListUseCase } from '../../../application/attendance';
import { AttendanceListRepository } from '../../repositories/attendance/attendance-list.repository';
import { AttendanceList, CreateAttendanceListDTO } from '../../../domain/entities/attendance';
import { logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';

export interface CreateAttendanceListInput {
  token: string;
  data: CreateAttendanceListDTO;
}

export interface CreateAttendanceListResult {
  success: boolean;
  data?: AttendanceList;
  error?: string;
}

export async function createAttendanceListAction(
  input: CreateAttendanceListInput
): Promise<CreateAttendanceListResult> {
  const startTime = Date.now();
  const url = `${process.env.API_BASE_URL}/attendance/lists`;

  logHttpRequest({
    method: 'POST',
    url,
    token: input.token.substring(0, 20) + '...',
    body: input.data,
  });

  try {
    const repository = new AttendanceListRepository();
    const useCase = new CreateAttendanceListUseCase(repository);

    const result = await useCase.execute(input);

    logHttpSuccess({
      status: 201,
      statusText: 'Created',
      duration: Date.now() - startTime,
      summary: `Lista de asistencia creada: ${result.attendanceList.title}`,
      data: result.attendanceList,
    });

    return {
      success: true,
      data: result.attendanceList,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logHttpError({
      status: 400,
      statusText: 'Bad Request',
      duration,
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    console.error('❌ Error en createAttendanceListAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
