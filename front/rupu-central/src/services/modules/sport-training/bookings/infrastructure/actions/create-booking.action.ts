'use server';
import { revalidatePath } from 'next/cache';
import { BookingsRepository } from '../repositories/bookings.repository';
import { CreateBookingDTO } from '../../domain';

export interface CreateBookingInput { token: string; data: CreateBookingDTO; }
export interface CreateBookingResult { success: boolean; message?: string; bookingId?: number; }

export async function createBookingAction(input: CreateBookingInput): Promise<CreateBookingResult> {
  try {
    const repo = new BookingsRepository();
    const booking = await repo.createBooking({ token: input.token, data: input.data });
    revalidatePath('/sport-training/bookings');
    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error('Error al crear reserva:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
