'use server';
import { CatalogRepository } from '../repositories/catalog.repository';

export async function getCatalogsAction(input: { token: string }) {
  try {
    const repo = new CatalogRepository();
    const [skillLevels, sessionTypes, bookingStatuses, attendanceStatuses, coachSpecialties] = await Promise.all([
      repo.getSkillLevels(input.token),
      repo.getSessionTypes(input.token),
      repo.getBookingStatuses(input.token),
      repo.getAttendanceStatuses(input.token),
      repo.getCoachSpecialties(input.token),
    ]);
    return { success: true as const, data: { skillLevels, sessionTypes, bookingStatuses, attendanceStatuses, coachSpecialties } };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
