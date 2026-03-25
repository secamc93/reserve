'use server';
import { revalidatePath } from 'next/cache';
import { BookingsRepository } from '../repositories/bookings.repository';

export interface BookingActionInput { bookingId: number; token: string; notes?: string; reason?: string; }
export interface BookingActionResult { success: boolean; message?: string; }

export async function approveBookingAction(input: BookingActionInput): Promise<BookingActionResult> {
  try {
    const repo = new BookingsRepository();
    await repo.approveBooking({ bookingId: input.bookingId, token: input.token, notes: input.notes });
    revalidatePath('/sport-training/bookings');
    revalidatePath(`/sport-training/bookings/${input.bookingId}`);
    return { success: true };
  } catch (error) {
    console.error('Error al aprobar reserva:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function rejectBookingAction(input: BookingActionInput): Promise<BookingActionResult> {
  try {
    const repo = new BookingsRepository();
    await repo.rejectBooking({ bookingId: input.bookingId, token: input.token, notes: input.notes });
    revalidatePath('/sport-training/bookings');
    revalidatePath(`/sport-training/bookings/${input.bookingId}`);
    return { success: true };
  } catch (error) {
    console.error('Error al rechazar reserva:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function cancelBookingAction(input: BookingActionInput): Promise<BookingActionResult> {
  try {
    const repo = new BookingsRepository();
    await repo.cancelBooking({ bookingId: input.bookingId, token: input.token, reason: input.reason });
    revalidatePath('/sport-training/bookings');
    revalidatePath(`/sport-training/bookings/${input.bookingId}`);
    return { success: true };
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
