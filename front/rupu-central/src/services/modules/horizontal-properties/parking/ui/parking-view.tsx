/**
 * Parqueaderos (diseño "PH - Parqueaderos"): cabecera secundaria con las pestañas Mapa de cupos ·
 * Asignaciones · Reservas de visitantes · Zonas, sus acciones, y los formularios.
 * La pestaña vive en la URL (?tab=map|assignments|reservations|zones) para poder enlazarla
 * (p. ej. una visita abre ?tab=reservations&visit_id=<id>).
 */

'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DsBody, DsPage, DsSectionHeader, VtNotice, vtBtn } from '@shared/ui/ds';
import type { ParkingAssignmentListDTO, ParkingSlotListDTO } from '../domain';
import { useParkingData } from './use-parking-data';
import { isLiveReservation, toISODay } from './parking-view-model';
import { SlotMap } from './slot-map';
import { AssignmentsTab } from './assignments-tab';
import { ReservationsTab } from './reservations-tab';
import { ZonesTab } from './zones-tab';
import { AssignSlotDialog, BulkSlotsDialog, ReleaseDialog, VisitorReservationDialog, ZoneFormDialog } from './parking-forms';

type Tab = 'map' | 'assignments' | 'reservations' | 'zones';
const TABS: Tab[] = ['map', 'assignments', 'reservations', 'zones'];

interface UnitOption { id: number; number: string; block?: string }

export function ParkingView({ businessId }: { businessId: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab') as Tab | null;
  const tab: Tab = rawTab && TABS.includes(rawTab) ? rawTab : 'map';
  const visitId = searchParams.get('visit_id');

  const [today] = useState(() => new Date());
  const todayISO = toISODay(today);
  const { data, loading, error, reload } = useParkingData(businessId, todayISO);
  const [version, setVersion] = useState(0);
  const refresh = () => {
    reload();
    setVersion((v) => v + 1);
  };

  const [notice, setNotice] = useState<string | null>(null);
  const [zoneOpen, setZoneOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [assign, setAssign] = useState<{ slot?: ParkingSlotListDTO | null; unit?: UnitOption | null; editing?: ParkingAssignmentListDTO | null } | null>(null);
  const [reservationOpen, setReservationOpen] = useState(Boolean(visitId));
  const [releasing, setReleasing] = useState<ParkingAssignmentListDTO | null>(null);

  const changeTab = (next: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', next);
    params.delete('page');
    params.delete('visit_id');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const liveToday = data.todayReservations.filter(isLiveReservation).length;
  const visitorSlots = data.slots.filter((s) => /visit/i.test(s.parkingZoneName)).length;

  const tabs = useMemo(
    () => [
      { id: 'map' as const, label: 'Mapa de cupos' },
      { id: 'assignments' as const, label: 'Asignaciones', count: data.summary?.active ?? null },
      { id: 'reservations' as const, label: 'Reservas de visitantes', count: liveToday ? `${liveToday} hoy` : null },
      { id: 'zones' as const, label: 'Zonas', count: data.zones.length || null },
    ],
    [data.summary, liveToday, data.zones.length],
  );

  const done = (message: string) => {
    setNotice(message);
    refresh();
  };

  const actions =
    tab === 'map' ? (
      <>
        <button type="button" className={vtBtn.secondary} onClick={() => setZoneOpen(true)}>+ Zona</button>
        <button type="button" className={vtBtn.secondary} onClick={() => setBulkOpen(true)} disabled={data.zones.length === 0}>+ Cupo</button>
        <button type="button" className={vtBtn.primary} onClick={() => setAssign({})} disabled={data.slots.length === 0}>Asignar cupo</button>
      </>
    ) : tab === 'assignments' ? (
      <button type="button" className={vtBtn.primary} onClick={() => setAssign({})} disabled={data.slots.length === 0}>Asignar cupo</button>
    ) : tab === 'reservations' ? (
      <button type="button" className={vtBtn.primary} onClick={() => setReservationOpen(true)} disabled={data.slots.length === 0}>+ Reserva de visitante</button>
    ) : (
      <button type="button" className={vtBtn.primary} onClick={() => setZoneOpen(true)}>+ Zona</button>
    );

  const editFromSlot = (slot: ParkingSlotListDTO) => setAssign({ editing: data.assignmentBySlot.get(slot.id) ?? null });
  const releaseFromSlot = (slot: ParkingSlotListDTO) => setReleasing(data.assignmentBySlot.get(slot.id) ?? null);

  return (
    <DsPage>
      <DsSectionHeader ariaLabel="Secciones de parqueaderos" tabs={tabs} active={tab} onChange={changeTab} actions={actions} />
      <DsBody>
        {notice && (
          <div className="flex items-start justify-between gap-3">
            <VtNotice tone="ok">{notice}</VtNotice>
            <button type="button" onClick={() => setNotice(null)} className="text-xs text-[#8a8580] hover:text-[#1a1a1a] mt-2" aria-label="Cerrar aviso">✕</button>
          </div>
        )}
        {error && <VtNotice>{error}</VtNotice>}
        {tab === 'map' &&
          (loading && data.slots.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#8a8580]">Cargando cupos…</p>
          ) : (
            <SlotMap
              data={data}
              today={today}
              onAssign={(slot) => setAssign({ slot })}
              onEditAssignment={editFromSlot}
              onRelease={releaseFromSlot}
              onCreateSlots={() => setBulkOpen(true)}
            />
          ))}
        {tab === 'assignments' && (
          <AssignmentsTab
            businessId={businessId}
            today={today}
            summary={data.summary}
            version={version}
            onEdit={(a) => setAssign({ editing: a })}
            onRelease={setReleasing}
            onAssignUnit={(unit) => setAssign({ unit })}
          />
        )}
        {tab === 'reservations' && (
          <ReservationsTab businessId={businessId} today={today} version={version} visitorSlots={visitorSlots} onChanged={refresh} />
        )}
        {tab === 'zones' && <ZonesTab data={data} loading={loading} />}
      </DsBody>

      <ZoneFormDialog open={zoneOpen} businessId={businessId} onClose={() => setZoneOpen(false)} onSaved={() => { setZoneOpen(false); done('Zona creada.'); }} />
      <BulkSlotsDialog
        open={bulkOpen}
        businessId={businessId}
        zones={data.zones}
        types={data.types}
        onClose={() => setBulkOpen(false)}
        onSaved={(n) => { setBulkOpen(false); done(`Se crearon ${n} cupos.`); }}
      />
      <AssignSlotDialog
        open={assign !== null}
        businessId={businessId}
        slots={data.slots}
        initialSlot={assign?.slot}
        initialUnit={assign?.unit}
        editing={assign?.editing}
        onClose={() => setAssign(null)}
        onSaved={() => { const editing = assign?.editing; setAssign(null); done(editing ? 'Asignación actualizada.' : 'Cupo asignado.'); }}
      />
      <VisitorReservationDialog
        open={reservationOpen}
        businessId={businessId}
        slots={data.slots}
        initialNotes={visitId ? `Desde visita #${visitId}` : undefined}
        onClose={() => setReservationOpen(false)}
        onSaved={() => { setReservationOpen(false); if (tab !== 'reservations') changeTab('reservations'); done('Reserva creada.'); }}
      />
      <ReleaseDialog assignment={releasing} businessId={businessId} onClose={() => setReleasing(null)} onDone={() => { setReleasing(null); done('Cupo liberado.'); }} />
    </DsPage>
  );
}
