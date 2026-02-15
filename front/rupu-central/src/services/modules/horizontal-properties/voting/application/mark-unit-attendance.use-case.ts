/**
 * Caso de uso: Marcar asistencia de unidad
 * ✅ NUEVO: Permite marcar/desmarcar asistencia desde el live voting
 */

import {
  IVotesRepository,
  MarkUnitAttendanceParams
} from '../domain/ports';

export class MarkUnitAttendanceUseCase {
  constructor(private votesRepository: IVotesRepository) {}

  async execute(params: MarkUnitAttendanceParams): Promise<void> {
    await this.votesRepository.markUnitAttendance(params);
  }
}
