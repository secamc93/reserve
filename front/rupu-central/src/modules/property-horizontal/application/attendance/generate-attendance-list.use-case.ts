/**
 * Use Case: Generate Attendance List
 */

import { IAttendanceListRepository } from '../../domain/ports/attendance';
import { AttendanceList } from '../../domain/entities/attendance';

export interface GenerateAttendanceListInput {
  token: string;
  votingGroupId: number;
}

export interface GenerateAttendanceListOutput {
  attendanceList: AttendanceList;
}

export class GenerateAttendanceListUseCase {
  constructor(private readonly attendanceListRepository: IAttendanceListRepository) {}

  async execute(input: GenerateAttendanceListInput): Promise<GenerateAttendanceListOutput> {
    try {
      const attendanceList = await this.attendanceListRepository.generateAttendanceList({
        token: input.token,
        votingGroupId: input.votingGroupId,
      });

      return { attendanceList };
    } catch (error: unknown) {
      throw new Error(`Error generating attendance list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
