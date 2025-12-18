'use server';

import { CommonAreasRepository } from '../repositories';
import { CreateReservationUseCase } from '../../application/create-reservation.use-case';
import { CreateReservationParams, CommonAreaReservation } from '../../domain';

export async function createReservationAction(params: CreateReservationParams): Promise<CommonAreaReservation> {
  const repository = new CommonAreasRepository();
  const useCase = new CreateReservationUseCase(repository);
  return await useCase.execute(params);
}
