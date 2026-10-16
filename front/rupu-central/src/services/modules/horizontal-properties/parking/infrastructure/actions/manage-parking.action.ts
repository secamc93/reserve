/**
 * Server Actions del rediseño de parqueaderos: cupos en lote, editar / liberar asignaciones,
 * resumen de asignaciones y check-in / check-out / cancelar reservas de visitantes.
 * Devuelven { success, data?, error? } para mostrar el mensaje del back en el formulario.
 */

'use server';

import { ParkingRepository } from '../repositories';
import type {
  AssignParkingDTO,
  CreateParkingReservationDTO,
  CreateParkingZoneDTO,
  ParkingZone,
  CreateParkingSlotsBulkDTO,
  ParkingAssignment,
  ParkingAssignmentSummary,
  ParkingReservation,
  UpdateParkingAssignmentDTO,
} from '../../domain';

export interface ParkingActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function run<T>(fn: () => Promise<T>): Promise<ParkingActionResult<T>> {
  try {
    return { success: true, data: await fn() };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error inesperado' };
  }
}

export async function createParkingSlotsBulkAction(input: { businessId: number; token: string; data: CreateParkingSlotsBulkDTO }): Promise<ParkingActionResult<{ created: number }>> {
  return run(() => new ParkingRepository().createParkingSlotsBulk(input));
}

export async function getParkingAssignmentSummaryAction(input: { businessId: number; token: string }): Promise<ParkingActionResult<ParkingAssignmentSummary>> {
  return run(() => new ParkingRepository().getParkingAssignmentSummary(input));
}

export async function updateParkingAssignmentAction(input: { id: number; businessId: number; token: string; data: UpdateParkingAssignmentDTO }): Promise<ParkingActionResult<ParkingAssignment>> {
  return run(() => new ParkingRepository().updateParkingAssignment(input));
}

export async function releaseParkingAssignmentAction(input: { id: number; businessId: number; token: string }): Promise<ParkingActionResult<ParkingAssignment>> {
  return run(() => new ParkingRepository().releaseParkingAssignment(input));
}

export async function checkInParkingAction(input: { id: number; token: string }): Promise<ParkingActionResult<ParkingReservation>> {
  return run(() => new ParkingRepository().checkInParking(input));
}

export async function checkOutParkingAction(input: { id: number; token: string }): Promise<ParkingActionResult<ParkingReservation>> {
  return run(() => new ParkingRepository().checkOutParking(input));
}

export async function cancelParkingReservationAction(input: { id: number; token: string; reason?: string }): Promise<ParkingActionResult<ParkingReservation>> {
  return run(() => new ParkingRepository().cancelParkingReservation(input));
}

// Versiones que devuelven el error en vez de lanzarlo (Next oculta el mensaje de los errores
// lanzados por una Server Action en producción).

export async function createParkingZoneSafeAction(input: { businessId: number; token: string; data: CreateParkingZoneDTO }): Promise<ParkingActionResult<ParkingZone>> {
  return run(() => new ParkingRepository().createParkingZone(input));
}

export async function assignParkingSafeAction(input: { businessId: number; token: string; data: AssignParkingDTO }): Promise<ParkingActionResult<ParkingAssignment>> {
  return run(() => new ParkingRepository().assignParking(input));
}

export async function createParkingReservationSafeAction(input: { businessId: number; token: string; data: CreateParkingReservationDTO }): Promise<ParkingActionResult<ParkingReservation>> {
  return run(() => new ParkingRepository().createParkingReservation(input));
}
