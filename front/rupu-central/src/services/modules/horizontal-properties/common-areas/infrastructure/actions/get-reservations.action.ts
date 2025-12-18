'use server';

import { CommonAreasRepository } from '../repositories';
import { GetReservationsUseCase } from '../../application/get-reservations.use-case';
import { GetReservationsParams, ReservationsPaginated } from '../../domain';

export async function getReservationsAction(params: GetReservationsParams): Promise<ReservationsPaginated> {
  const repository = new CommonAreasRepository();
  const useCase = new GetReservationsUseCase(repository);
  return await useCase.execute(params);
}
