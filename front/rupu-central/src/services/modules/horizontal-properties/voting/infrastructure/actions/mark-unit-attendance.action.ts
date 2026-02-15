/**
 * Server Action: Marcar asistencia de unidad
 * ✅ NUEVO: Permite marcar/desmarcar asistencia desde el live voting
 */

'use server';

import { MarkUnitAttendanceUseCase } from '../../application';
import { VotesRepository } from '../repositories';

export interface MarkUnitAttendanceInput {
  token: string;
  businessId: number;
  groupId: number;
  votingId: number;
  unitId: number;
  markAttendance: boolean;
}

export interface MarkUnitAttendanceResult {
  success: boolean;
  error?: string;
}

export async function markUnitAttendanceAction(input: MarkUnitAttendanceInput): Promise<MarkUnitAttendanceResult> {
  try {
    const repository = new VotesRepository();
    const useCase = new MarkUnitAttendanceUseCase(repository);

    await useCase.execute({
      token: input.token,
      businessId: input.businessId,
      groupId: input.groupId,
      votingId: input.votingId,
      unitId: input.unitId,
      markAttendance: input.markAttendance,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Error en markUnitAttendanceAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
