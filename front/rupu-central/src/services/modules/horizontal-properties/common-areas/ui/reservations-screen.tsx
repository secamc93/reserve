/**
 * Z3 · Reservas (/common-areas/reservations): pestañas Calendario de reservas, Pendientes e
 * Historial bajo la misma cabecera de Zonas comunes. Calendario semanal con navegación,
 * chips de zona y leyenda; Pendientes y Historial como tablas paginadas. En el teléfono se
 * muestra Z5 (tarjetas de pendientes / hoy / semana). Detalle en panel lateral (Z4).
 * URL: ?tab=pendientes|historial, ?zona, ?semana=YYYY-MM-DD, ?page, ?page_size.
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Pagination, usePaginationParams } from '@shared/ui/pagination';
import { DsBody, DsCard, DsChips, DsLegend, DsPage, DsStatus, DsTable, VtIcon, VtNotice, dsMono, vtBtn, type DsColumn } from '@/shared/ui/ds';
import type { CommonAreaListDTO, ReservationListDTO } from '../domain';
import { approveReservationAction, getCommonAreasAction, getReservationsAction } from '../infrastructure/actions';
import {
  DAY_SHORT,
  addDays,
  calendarTone,
  dayMonth,
  formatThousands,
  isInactiveStatus,
  parseISODate,
  reservationDay,
  startOfWeek,
  statusMeta,
  timeAgo,
  toISODate,
  unitLabel,
  weekDays,
  weekLabel,
} from './design';
import { MobileReservations } from './mobile-reservations';
import { ReservationFormModal } from './reservation-form-modal';
import { ReservationPanel } from './reservation-panel';
import { CALENDAR_LEGEND, WeekCalendar } from './week-calendar';
import { ZonesHeader, zonesTabHref, type ZonesTab } from './zones-header';
import { useBusinessToken } from './hooks/use-business-token';

type ReservationsTab = Exclude<ZonesTab, 'zones'>;

const TAB_PARAM: Record<ReservationsTab, string | null> = { calendar: null, pending: 'pendientes', history: 'historial' };

function shortDate(value: string): string {
  const day = reservationDay(value);
  return `${DAY_SHORT[parseISODate(day).getDay()]} ${dayMonth(day)}`;
}

export function ReservationsScreen({ businessId }: { businessId: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, pageSize } = usePaginationParams();
  const getToken = useBusinessToken(businessId);

  const today = toISODate(new Date());
  const tabParam = searchParams.get('tab');
  const tab: ReservationsTab = tabParam === 'pendientes' ? 'pending' : tabParam === 'historial' ? 'history' : 'calendar';
  const zoneParam = searchParams.get('zona');
  const semana = searchParams.get('semana');
  const monday = startOfWeek(semana && /^\d{4}-\d{2}-\d{2}$/.test(semana) ? semana : today);

  const [zones, setZones] = useState<CommonAreaListDTO[]>([]);
  const [zonesTotal, setZonesTotal] = useState<number | null>(null);
  const [pending, setPending] = useState<ReservationListDTO[]>([]);
  const [pendingTotal, setPendingTotal] = useState<number | null>(null);
  const [week, setWeek] = useState<ReservationListDTO[]>([]);
  const [listItems, setListItems] = useState<ReservationListDTO[]>([]);
  const [listTotal, setListTotal] = useState(0);
  const [listPages, setListPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [approving, setApproving] = useState<number | null>(null);
  const [refresh, setRefresh] = useState(0);

  const zoneId = useMemo(() => {
    const id = zoneParam ? Number(zoneParam) : null;
    return id && zones.some((z) => z.id === id) ? id : null;
  }, [zoneParam, zones]);
  const zone = zones.find((z) => z.id === zoneId);

  const setParams = useCallback(
    (patch: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === '') params.delete(k);
        else params.set(k, v);
      }
      if (resetPage) params.delete('page');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Zonas activas (chips y nueva reserva), pendientes y la semana de todas las zonas.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const token = await getToken();
        const [zonesRes, pendingRes, weekRes] = await Promise.all([
          getCommonAreasAction({ token, businessId, page: 1, pageSize: 200, isActive: true }),
          getReservationsAction({ token, businessId, status: ['pending'], page: 1, pageSize: 20 }),
          getReservationsAction({ token, businessId, startDate: monday, endDate: addDays(monday, 6), page: 1, pageSize: 200 }),
        ]);
        if (cancelled) return;
        if (!zonesRes.success) throw new Error(zonesRes.error);
        setZones(zonesRes.data.data);
        setZonesTotal(zonesRes.data.total);
        if (pendingRes.success) {
          setPending(pendingRes.data.data);
          setPendingTotal(pendingRes.data.total);
        }
        if (!weekRes.success) throw new Error(weekRes.error);
        setWeek(weekRes.data.data);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error cargando reservas');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken, businessId, monday, refresh]);

  // Tablas de Pendientes / Historial (paginadas).
  useEffect(() => {
    if (tab === 'calendar') return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const result =
          tab === 'pending'
            ? await getReservationsAction({ token, businessId, status: ['pending'], commonAreaId: zoneId ?? undefined, page, pageSize })
            : await getReservationsAction({ token, businessId, endDate: addDays(today, -1), commonAreaId: zoneId ?? undefined, page, pageSize });
        if (cancelled) return;
        if (!result.success) throw new Error(result.error);
        setListItems(result.data.data);
        setListTotal(result.data.total);
        setListPages(result.data.totalPages || 1);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error cargando reservas');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, zoneId, page, pageSize, today, getToken, businessId, refresh]);

  const changed = useCallback((message: string) => {
    setNotice(message);
    setRefresh((n) => n + 1);
  }, []);

  const approveQuick = async (r: ReservationListDTO) => {
    setApproving(r.id);
    setError(null);
    try {
      const token = await getToken();
      const result = await approveReservationAction({ token, businessId, id: r.id });
      if (!result.success) throw new Error(result.error);
      changed(`Reserva de ${unitLabel(r.propertyUnitNumber, r.propertyUnitBlock)} aprobada`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo aprobar');
    } finally {
      setApproving(null);
    }
  };

  const calendarItems = zoneId ? week.filter((r) => r.commonAreaId === zoneId) : week;
  const zoneChips = [{ id: 'all', label: 'Todas las zonas' }, ...zones.map((z) => ({ id: String(z.id), label: z.name }))];

  const baseColumns: DsColumn<ReservationListDTO>[] = [
    { key: 'date', label: 'Fecha', width: '104px', render: (r) => <span className={`${dsMono} text-xs`}>{shortDate(r.reservationDate)}</span> },
    { key: 'time', label: 'Horario', width: '100px', render: (r) => <span className={`${dsMono} text-xs`}>{r.startTime}–{r.endTime}</span> },
    { key: 'zone', label: 'Zona', width: 'minmax(120px,1fr)', render: (r) => <span className="font-semibold truncate">{r.commonAreaName}</span> },
    {
      key: 'unit',
      label: 'Unidad',
      width: 'minmax(140px,1fr)',
      render: (r) => (
        <span className="truncate">
          <span className={dsMono}>{unitLabel(r.propertyUnitNumber, r.propertyUnitBlock)}</span>
          {r.residentName && <span className="text-[#8a8580]"> · {r.residentName}</span>}
        </span>
      ),
    },
    { key: 'guests', label: 'Inv.', width: '48px', align: 'right', render: (r) => <span className={dsMono}>{r.numberOfGuests}</span> },
  ];

  const pendingColumns: DsColumn<ReservationListDTO>[] = [
    { key: 'ago', label: 'Solicitada', width: '92px', render: (r) => <span className={`${dsMono} text-xs text-[#8a8580]`}>{timeAgo(r.createdAt)}</span> },
    ...baseColumns,
    {
      key: 'deposit',
      label: 'Depósito',
      width: '96px',
      align: 'right',
      render: (r) => <span className={`${dsMono} text-xs`}>{r.depositAmount ? formatThousands(r.depositAmount) : '—'}</span>,
    },
    {
      key: 'actions',
      label: '',
      width: '92px',
      align: 'right',
      render: (r) => (
        <button
          type="button"
          className={vtBtn.accent}
          onClick={(e) => {
            e.stopPropagation();
            approveQuick(r);
          }}
          disabled={approving === r.id}
          aria-label={`Aprobar reserva de ${unitLabel(r.propertyUnitNumber, r.propertyUnitBlock)}`}
        >
          {approving === r.id ? '…' : 'Aprobar'}
        </button>
      ),
    },
  ];

  const historyColumns: DsColumn<ReservationListDTO>[] = [
    ...baseColumns,
    {
      key: 'status',
      label: 'Estado',
      width: '108px',
      render: (r) => {
        const m = statusMeta(r.statusCode, r.statusName);
        const label = !isInactiveStatus(r.statusCode) && calendarTone(r) === 'past' && r.statusCode !== 'checked_out' && r.statusCode !== 'completed' ? `${m.label} · pasada` : m.label;
        return <DsStatus label={label} color={m.color} />;
      },
    },
    {
      key: 'pay',
      label: 'Pago',
      width: '80px',
      render: (r) =>
        !r.totalAmount && !r.depositAmount ? (
          <span className="text-xs text-[#8a8580]">Sin costo</span>
        ) : (
          <span className={`text-xs font-medium ${r.fullPaymentPaid || (!r.totalAmount && r.depositPaid) ? 'text-[#1f8a4c]' : 'text-[#c8603f]'}`}>
            {r.fullPaymentPaid || (!r.totalAmount && r.depositPaid) ? 'Pagado' : 'Pendiente'}
          </span>
        ),
    },
  ];

  return (
    <DsPage>
      <div className="hidden md:block">
        <ZonesHeader
          businessId={businessId}
          active={tab}
          zonesCount={zonesTotal}
          pendingCount={pendingTotal}
          onTab={(t) => {
            if (t === 'zones') return false;
            setParams({ tab: TAB_PARAM[t] });
            return true;
          }}
          actions={
            <button type="button" className={vtBtn.primary} onClick={() => setCreating(true)} disabled={zones.length === 0}>
              + Nueva reserva
            </button>
          }
        />
      </div>

      {(error || notice) && (
        <div className="px-4 md:px-8 pt-4">
          {error ? <VtNotice>{error}</VtNotice> : <VtNotice tone="ok">{notice}</VtNotice>}
        </div>
      )}

      <div className="md:hidden">
        <MobileReservations
          pending={pending}
          pendingTotal={pendingTotal ?? 0}
          week={week}
          today={today}
          zonesHref={zonesTabHref(businessId, 'zones')}
          approvingId={approving}
          onApprove={approveQuick}
          onOpen={setSelected}
        />
      </div>

      <div className="hidden md:block">
        <DsBody>
          {zonesTotal === 0 ? (
            <DsCard className="px-6 py-12 text-center">
              <div className="text-[15px] font-semibold">No hay zonas activas</div>
              <p className="text-[13px] text-[#8a8580] mt-1 mb-4">Crea una zona con su horario para recibir reservas.</p>
              <button type="button" className={vtBtn.primary} onClick={() => router.push(zonesTabHref(businessId, 'zones'))}>
                Ir a zonas
              </button>
            </DsCard>
          ) : tab === 'calendar' ? (
            <>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
                <div className="flex items-center gap-1.5">
                  <button type="button" className={vtBtn.icon} aria-label="Semana anterior" onClick={() => setParams({ semana: addDays(monday, -7) }, false)}>
                    <VtIcon name="back" size={14} />
                  </button>
                  <span className="text-[13px] font-semibold min-w-[140px] text-center" aria-live="polite">
                    {weekLabel(monday)}
                  </span>
                  <button type="button" className={vtBtn.icon} aria-label="Semana siguiente" onClick={() => setParams({ semana: addDays(monday, 7) }, false)}>
                    <span className="rotate-180 inline-flex">
                      <VtIcon name="back" size={14} />
                    </span>
                  </button>
                  <DsChips ariaLabel="Ir a hoy" chips={[{ id: 'today', label: 'Hoy' }]} active={monday === startOfWeek(today) ? 'today' : ''} onChange={() => setParams({ semana: null }, false)} />
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2.5 min-w-0">
                  <DsChips ariaLabel="Zona" chips={zoneChips} active={zoneId ? String(zoneId) : 'all'} onChange={(id) => setParams({ zona: id === 'all' ? null : id }, false)} />
                  <DsLegend items={CALENDAR_LEGEND} />
                </div>
              </div>
              {zone && zone.schedules.filter((s) => s.isActive).length === 0 && (
                <VtNotice tone="info">«{zone.name}» no tiene horario: configúralo al editar la zona para recibir reservas.</VtNotice>
              )}
              <div className={loading ? 'opacity-60 transition-opacity' : ''}>
                <WeekCalendar days={weekDays(monday)} reservations={calendarItems} schedules={zone?.schedules ?? []} today={today} selectedId={selected} onSelect={setSelected} />
              </div>
            </>
          ) : (
            <>
              <DsChips ariaLabel="Zona" chips={zoneChips} active={zoneId ? String(zoneId) : 'all'} onChange={(id) => setParams({ zona: id === 'all' ? null : id })} />
              <DsTable
                ariaLabel={tab === 'pending' ? 'Reservas pendientes de aprobar' : 'Historial de reservas'}
                columns={tab === 'pending' ? pendingColumns : historyColumns}
                rows={listItems}
                rowKey={(r) => r.id}
                onRowClick={(r) => setSelected(r.id)}
                selectedKey={selected}
                empty={tab === 'pending' ? 'No hay reservas por aprobar' : 'Aún no hay reservas pasadas'}
                minWidth={900}
                footer={listTotal > 0 ? <Pagination total={listTotal} totalPages={listPages} /> : undefined}
              />
            </>
          )}
        </DsBody>
      </div>

      <ReservationPanel businessId={businessId} reservationId={selected} getToken={getToken} onClose={() => setSelected(null)} onChanged={changed} />
      <ReservationFormModal
        open={creating}
        businessId={businessId}
        zones={zones}
        defaultZoneId={zoneId ?? undefined}
        defaultDate={monday > today ? monday : today}
        getToken={getToken}
        onClose={() => setCreating(false)}
        onCreated={(message) => {
          setCreating(false);
          changed(message);
        }}
      />
    </DsPage>
  );
}
