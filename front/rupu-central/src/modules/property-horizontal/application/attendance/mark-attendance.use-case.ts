/**
 * Use Case: Mark Attendance
 */

import { IAttendanceRecordRepository } from '../../domain/ports/attendance';
import { AttendanceRecord, MarkAttendanceDTO } from '../../domain/entities/attendance';

export interface MarkAttendanceInput {
  token: string;
  data: MarkAttendanceDTO;
}

export interface MarkAttendanceOutput {
  attendanceRecord: AttendanceRecord;
}

export class MarkAttendanceUseCase {
  constructor(private readonly attendanceRecordRepository: IAttendanceRecordRepository) {}

  async execute(input: MarkAttendanceInput): Promise<MarkAttendanceOutput> {
    try {
      const attendanceRecord = await this.attendanceRecordRepository.markAttendance({
        token: input.token,
        data: input.data,
      });

      return { attendanceRecord };
    } catch (error: unknown) {
      throw new Error(`Error marking attendance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
