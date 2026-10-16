/** Server Action: resumen de hoy de una propiedad (GET /dashboard/today). */

'use server';

import { env, logHttpRequest, logHttpError } from '@shared/config';
import type { TodaySummary } from '../../domain/entities';

export interface GetTodaySummaryResult {
  success: boolean;
  data?: TodaySummary;
  error?: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function map(d: any): TodaySummary {
  return {
    visitsInside: (d.visits_inside ?? []).map((v: any) => ({
      visitorName: v.visitor_name, visitType: v.visit_type, unitNumber: v.unit_number, unitBlock: v.unit_block, entryTime: v.entry_time, exceeded: Boolean(v.exceeded),
    })),
    visitsInsideCount: d.visits_inside_count ?? 0,
    visitsExceededCount: d.visits_exceeded_count ?? 0,
    packagesPending: d.packages_pending ?? 0,
    packagesOld: d.packages_old ?? 0,
    reservationsToday: (d.reservations_today ?? []).map((r: any) => ({
      startTime: r.start_time, endTime: r.end_time, areaName: r.area_name, unitNumber: r.unit_number, unitBlock: r.unit_block, approved: Boolean(r.approved),
    })),
    reservationsPending: d.reservations_pending ?? 0,
    activeVoting: d.active_voting
      ? {
          groupId: d.active_voting.group_id,
          groupName: d.active_voting.group_name,
          votingId: d.active_voting.voting_id,
          title: d.active_voting.title,
          votedUnits: d.active_voting.voted_units,
          totalUnits: d.active_voting.total_units,
          quorumPercentage: d.active_voting.quorum_percentage ?? null,
          attendanceByCoef: d.active_voting.attendance_by_coef ?? null,
        }
      : null,
    occupancy: {
      units: d.occupancy?.units ?? 0,
      unitsWithResident: d.occupancy?.units_with_resident ?? 0,
      parkingSlots: d.occupancy?.parking_slots ?? 0,
      parkingAssigned: d.occupancy?.parking_assigned ?? 0,
      residents: d.occupancy?.residents ?? 0,
      residentsWithEmail: d.occupancy?.residents_with_email ?? 0,
    },
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getTodaySummaryAction(input: { token: string; businessId: number }): Promise<GetTodaySummaryResult> {
  const url = `${env.API_BASE_URL}/dashboard/today?business_id=${input.businessId}`;
  logHttpRequest({ method: 'GET', url });
  try {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${input.token}` }, cache: 'no-store' });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      logHttpError({ status: response.status, statusText: response.statusText, duration: 0, data: body });
      return { success: false, error: body.message || body.error || `Error ${response.status}` };
    }
    return { success: true, data: map(body.data) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error de conexión' };
  }
}
