/**
 * Use Case: Create Attendance List
 */

import { IAttendanceListRepository } from '../../domain/ports/attendance';
import { AttendanceList, CreateAttendanceListDTO } from '../../domain/entities/attendance';

export interface CreateAttendanceListInput {
  token: string;
  data: CreateAttendanceListDTO;
}

export interface CreateAttendanceListOutput {
  attendanceList: AttendanceList;
}

export class CreateAttendanceListUseCase {
  constructor(private readonly attendanceListRepository: IAttendanceListRepository) {}

  async execute(input: CreateAttendanceListInput): Promise<CreateAttendanceListOutput> {
    try {
      const attendanceList = await this.attendanceListRepository.createAttendanceList({
        token: input.token,
        data: input.data,
      });

      return { attendanceList };
    } catch (error: unknown) {
      throw new Error(`Error creating attendance list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
