/**
 * Carga de datos del rediseño de parqueaderos: zonas, todos los cupos (en páginas de 200),
 * asignaciones activas, reservas de un día, tipos de parqueadero y resumen de asignaciones.
 * El token es el de la propiedad activa (lo deja el selector de propiedad).
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { fetchAllPages } from '@shared/utils/pagination';
import {
  getParkingAssignmentsAction,
  getParkingReservationsAction,
  getParkingSlotsAction,
  getParkingTypesAction,
  getParkingZonesAction,
  getParkingAssignmentSummaryAction,
} from '../infrastructure/actions';
import type {
  ParkingAssignmentListDTO,
  ParkingAssignmentSummary,
  ParkingReservationListDTO,
  ParkingSlotListDTO,
  ParkingType,
  ParkingZoneListDTO,
} from '../domain';

export function parkingToken(): string {
  return TokenStorage.getBusinessToken() || TokenStorage.getSessionToken() || '';
}

export interface ParkingData {
  zones: ParkingZoneListDTO[];
  slots: ParkingSlotListDTO[];
  /** Asignación activa por id de cupo. */
  assignmentBySlot: Map<number, ParkingAssignmentListDTO>;
  /** Reservas de hoy por id de cupo (puede haber varias). */
  reservationsBySlot: Map<number, ParkingReservationListDTO[]>;
  todayReservations: ParkingReservationListDTO[];
  types: ParkingType[];
  summary: ParkingAssignmentSummary | null;
}

const EMPTY: ParkingData = {
  zones: [],
  slots: [],
  assignmentBySlot: new Map(),
  reservationsBySlot: new Map(),
  todayReservations: [],
  types: [],
  summary: null,
};

export function useParkingData(businessId: number, today: string) {
  const [data, setData] = useState<ParkingData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let alive = true;
    const token = parkingToken();
    if (!token || !businessId) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [zones, slots, assignments, reservations, types, summary] = await Promise.all([
          fetchAllPages((page, pageSize) =>
            getParkingZonesAction({ businessId, token, page, pageSize }).then((r) => ({ items: r.data, total: r.total, totalPages: r.totalPages })),
          ),
          fetchAllPages((page, pageSize) =>
            getParkingSlotsAction({ businessId, token, page, pageSize }).then((r) => ({ items: r.data, total: r.total, totalPages: r.totalPages })),
          ),
          fetchAllPages((page, pageSize) =>
            getParkingAssignmentsAction({ businessId, token, isActive: true, page, pageSize }).then((r) => ({ items: r.data, total: r.total, totalPages: r.totalPages })),
          ),
          fetchAllPages((page, pageSize) =>
            getParkingReservationsAction({ businessId, token, startDate: today, endDate: today, page, pageSize }).then((r) => ({ items: r.data, total: r.total, totalPages: r.totalPages })),
          ),
          getParkingTypesAction(token).catch(() => [] as ParkingType[]),
          getParkingAssignmentSummaryAction({ businessId, token }).then((r) => (r.success ? r.data ?? null : null)),
        ]);
        if (!alive) return;
        const assignmentBySlot = new Map<number, ParkingAssignmentListDTO>();
        for (const a of assignments) assignmentBySlot.set(a.parkingSlotId, a);
        const reservationsBySlot = new Map<number, ParkingReservationListDTO[]>();
        for (const r of reservations) reservationsBySlot.set(r.parkingSlotId, [...(reservationsBySlot.get(r.parkingSlotId) ?? []), r]);
        setData({ zones, slots, assignmentBySlot, reservationsBySlot, todayReservations: reservations, types, summary });
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'No se pudieron cargar los parqueaderos');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [businessId, today, version]);

  return { data, loading, error, reload };
}
