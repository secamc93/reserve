'use server';
import { BookingsRepository } from '../repositories/bookings.repository';

export async function getBookingsAction(input: { businessId: number; token: string; page?: number; pageSize?: number }) {
  try {
    const repo = new BookingsRepository();
    return { success: true as const, data: await repo.getBookings(input) };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function getBookingByIdAction(input: { businessId: number; bookingId: number; token: string }) {
  try {
    const repo = new BookingsRepository();
    return { success: true as const, data: await repo.getBookingById(input) };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
