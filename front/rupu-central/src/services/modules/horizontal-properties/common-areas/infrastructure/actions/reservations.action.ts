'use server';

/** Server Actions de reservas: listar, crear, detalle y transiciones (aprobar, rechazar…). */

import { revalidatePath } from 'next/cache';
import { CommonAreasRepository } from '../repositories';
import {
  CreateReservationUseCase,
  GetReservationsUseCase,
  GetReservationByIdUseCase,
  ApproveReservationUseCase,
  RejectReservationUseCase,
  ConfirmReservationUseCase,
  CheckInReservationUseCase,
  CheckOutReservationUseCase,
  CancelReservationUseCase,
  UpdateReservationPaymentsUseCase,
} from '../../application';
import type {
  CreateReservationParams,
  GetReservationsParams,
  ReservationIdParams,
  RejectReservationParams,
  CancelReservationParams,
  UpdatePaymentsParams,
  CommonAreaReservation,
  ReservationsPaginated,
} from '../../domain';
import { toResult, type ActionResult } from './result';

const repo = () => new CommonAreasRepository();

async function mutate(businessId: number, run: () => Promise<CommonAreaReservation>, fallback: string) {
  const result = await toResult(run, fallback);
  if (result.success) revalidatePath(`/properties/${businessId}/common-areas/reservations`);
  return result;
}

export async function getReservationsAction(params: GetReservationsParams): Promise<ActionResult<ReservationsPaginated>> {
  return toResult(() => new GetReservationsUseCase(repo()).execute(params), 'Error cargando reservas');
}

export async function getReservationByIdAction(params: ReservationIdParams): Promise<ActionResult<CommonAreaReservation>> {
  return toResult(() => new GetReservationByIdUseCase(repo()).execute(params), 'Error cargando la reserva');
}

export async function createReservationAction(params: CreateReservationParams): Promise<ActionResult<CommonAreaReservation>> {
  return mutate(params.businessId, () => new CreateReservationUseCase(repo()).execute(params), 'Error creando la reserva');
}

export async function approveReservationAction(params: ReservationIdParams): Promise<ActionResult<CommonAreaReservation>> {
  return mutate(params.businessId, () => new ApproveReservationUseCase(repo()).execute(params), 'Error aprobando la reserva');
}

export async function rejectReservationAction(params: RejectReservationParams): Promise<ActionResult<CommonAreaReservation>> {
  return mutate(params.businessId, () => new RejectReservationUseCase(repo()).execute(params), 'Error rechazando la reserva');
}

export async function confirmReservationAction(params: ReservationIdParams): Promise<ActionResult<CommonAreaReservation>> {
  return mutate(params.businessId, () => new ConfirmReservationUseCase(repo()).execute(params), 'Error confirmando la reserva');
}

export async function checkInReservationAction(params: ReservationIdParams): Promise<ActionResult<CommonAreaReservation>> {
  return mutate(params.businessId, () => new CheckInReservationUseCase(repo()).execute(params), 'Error registrando el ingreso');
}

export async function checkOutReservationAction(params: ReservationIdParams): Promise<ActionResult<CommonAreaReservation>> {
  return mutate(params.businessId, () => new CheckOutReservationUseCase(repo()).execute(params), 'Error registrando la salida');
}

export async function cancelReservationAction(params: CancelReservationParams): Promise<ActionResult<CommonAreaReservation>> {
  return mutate(params.businessId, () => new CancelReservationUseCase(repo()).execute(params), 'Error cancelando la reserva');
}

export async function updateReservationPaymentsAction(params: UpdatePaymentsParams): Promise<ActionResult<CommonAreaReservation>> {
  return mutate(params.businessId, () => new UpdateReservationPaymentsUseCase(repo()).execute(params), 'Error actualizando pagos');
}
