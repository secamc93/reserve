/**
 * Z3 · Reservas (/common-areas/reservations): pendientes de aprobar arriba, calendario
 * semanal por zona (o lista paginada con filtros de estado) y detalle en panel lateral (Z4).
 * URL: ?zona, ?vista=lista, ?semana=YYYY-MM-DD (lunes), ?estado, ?page, ?page_size.
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Pagination, usePaginationParams } from '@shared/ui/pagination';
import {
  DsBody,
  DsCard,
  DsChips,
  DsEyebrow,
  DsLegend,
  DsPage,
  DsSectionHeader,
  DsStatus,
  DsTable,
  DsToolbar,
  VtIcon,
  VtNotice,
  dsMono,
  vtBtn,
  type DsColumn,
} from '@/shared/ui/ds';
import type { CommonAreaListDTO, ReservationListDTO } from '../domain';
import { approveReservationAction, getCommonAreasAction, getReservationsAction } from '../infrastructure/actions';
import {
  DAY_SHORT,
  STATUS_FILTERS,
  addDays,
  parseISODate,
  reservationDay,
  startOfWeek,
  statusCodesFor,
  statusMeta,
  toISODate,
  unitLabel,
  weekDays,
  weekLabel,
} from './design';
import { ReservationFormModal } from './reservation-form-modal';
import { ReservationPanel } from './reservation-panel';
import { WeekCalendar } from './week-calendar';
import { useBusinessToken } from './hooks/use-business-token';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function shortDate(value: string): string {
  const d = parseISODate(reservationDay(value));
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

const LEGEND = ['pending', 'approved', 'confirmed', 'checked_in', 'checked_out'].map((code) => {
  const m = statusMeta(code);
  return { label: m.label, swatch: { background: m.bg, border: `1px solid ${m.border}` } };
});

export function ReservationsScreen({ businessId }: { businessId: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, pageSize } = usePaginationParams();
  const getToken = useBusinessToken(businessId);

  const today = toISODate(new Date());
  const view = searchParams.get('vista') === 'lista' ? 'list' : 'calendar';
  const zoneParam = searchParams.get('zona');
  const semana = searchParams.get('semana');
  const monday = startOfWeek(semana && /^\d{4}-\d{2}-\d{2}$/.test(semana) ? semana : today);
  const estado = searchParams.get('estado') ?? 'all';

  const [zones, setZones] = useState<CommonAreaListDTO[]>([]);
  const [zonesTotal, setZonesTotal] = useState<number | null>(null);
  const [pending, setPending] = useState<ReservationListDTO[]>([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [weekItems, setWeekItems] = useState<ReservationListDTO[]>([]);
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

  // En calendario siempre hay una zona; en la lista "todas" es válido.
  const zoneId = useMemo(() => {
    const fromUrl = zoneParam && zoneParam !== 'all' ? Number(zoneParam) : null;
    if (fromUrl && zones.some((z) => z.id === fromUrl)) return fromUrl;
    if (view === 'list') return null;
    return zones[0]?.id ?? null;
  }, [zoneParam, zones, view]);
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

  // Zonas (para chips, calendario y nueva reserva): las activas, hasta 200.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const result = await getCommonAreasAction({ token, businessId, page: 1, pageSize: 200, isActive: true });
        if (cancelled) return;
        if (!result.success) throw new Error(result.error);
        setZones(result.data.data);
        setZonesTotal(result.data.total);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error cargando zonas');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken, businessId, refresh]);

  // Pendientes de aprobar (todas las zonas).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const result = await getReservationsAction({ token, businessId, status: ['pending'], page: 1, pageSize: 5 });
        if (cancelled || !result.success) return;
        setPending(result.data.data);
        setPendingTotal(result.data.total);
      } catch {
        /* el error principal ya se muestra arriba */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken, businessId, refresh]);

  // Datos de la vista activa.
  useEffect(() => {
    if (view === 'calendar' && zonesTotal === null) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const token = await getToken();
        if (view === 'calendar') {
          if (!zoneId) {
            setWeekItems([]);
            return;
          }
          const result = await getReservationsAction({ token, businessId, commonAreaId: zoneId, startDate: monday, endDate: addDays(monday, 6), page: 1, pageSize: 200 });
          if (cancelled) return;
          if (!result.success) throw new Error(result.error);
          setWeekItems(result.data.data);
        } else {
          const codes = statusCodesFor(estado);
          const result = await getReservationsAction({ token, businessId, commonAreaId: zoneId ?? undefined, status: codes.length ? codes : undefined, page, pageSize });
          if (cancelled) return;
          if (!result.success) throw new Error(result.error);
          setListItems(result.data.data);
          setListTotal(result.data.total);
          setListPages(result.data.totalPages || 1);
        }
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
  }, [view, zoneId, monday, estado, page, pageSize, getToken, businessId, zonesTotal, refresh]);

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

  const base = `/properties/${businessId}/common-areas`;
  const zoneChips = [
    ...(view === 'list' ? [{ id: 'all', label: 'Todas las zonas' }] : []),
    ...zones.map((z) => ({ id: String(z.id), label: z.name })),
  ];

  const columns: DsColumn<ReservationListDTO>[] = [
    { key: 'date', label: 'Fecha', width: '108px', render: (r) => <span className={`${dsMono} text-xs`}>{shortDate(r.reservationDate)}</span> },
    { key: 'time', label: 'Horario', width: '104px', render: (r) => <span className={`${dsMono} text-xs`}>{r.startTime}–{r.endTime}</span> },
    { key: 'zone', label: 'Zona', width: 'minmax(120px,1fr)', render: (r) => <span className="truncate">{r.commonAreaName}</span> },
    { key: 'unit', label: 'Unidad', width: '110px', render: (r) => <span className="font-semibold">{unitLabel(r.propertyUnitNumber, r.propertyUnitBlock)}</span> },
    { key: 'resident', label: 'Residente', width: 'minmax(120px,1fr)', render: (r) => <span className="truncate text-[#4b4a46]">{r.residentName || '—'}</span> },
    { key: 'guests', label: 'Pers.', width: '52px', align: 'right', render: (r) => <span className={dsMono}>{r.numberOfGuests}</span> },
    {
      key: 'status',
      label: 'Estado',
      width: '112px',
      render: (r) => {
        const m = statusMeta(r.statusCode, r.statusName);
        return <DsStatus label={m.label} color={m.color} />;
      },
    },
    {
      key: 'pay',
      label: 'Pago',
      width: '84px',
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
      <DsSectionHeader
        ariaLabel="Zonas comunes"
        tabs={[
          { id: 'zones', label: 'Zonas', count: zonesTotal },
          { id: 'reservations', label: 'Reservas', count: pendingTotal ? `${pendingTotal} por aprobar` : null },
        ]}
        active="reservations"
        onChange={(id) => id === 'zones' && router.push(base)}
        actions={
          <>
            <div role="group" aria-label="Vista" className="inline-flex rounded-[7px] border border-[#d6d3cd] bg-white p-0.5">
              {(['calendar', 'list'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setParams({ vista: v === 'list' ? 'lista' : null })}
                  className={`h-8 max-md:h-10 px-3 rounded-[5px] text-[13px] font-medium ${view === v ? 'bg-[#1a1a1a] text-white' : 'text-[#4b4a46] hover:bg-[#f5f5f4]'}`}
                >
                  {v === 'calendar' ? 'Calendario' : 'Lista'}
                </button>
              ))}
            </div>
            <button type="button" className={vtBtn.primary} onClick={() => setCreating(true)} disabled={zones.length === 0}>
              + Nueva reserva
            </button>
          </>
        }
      />
      <DsBody>
        {error && <VtNotice>{error}</VtNotice>}
        {notice && !error && <VtNotice tone="ok">{notice}</VtNotice>}

        {pendingTotal > 0 && (
          <DsCard className="overflow-hidden">
            <section aria-label="Pendientes de aprobar">
              <div className="flex items-center justify-between px-[18px] py-2.5 border-b border-[#efedea]">
                <div className="flex items-center gap-2">
                  <span className="w-[7px] h-[7px] rounded-full bg-[#c8603f]" aria-hidden="true" />
                  <span className="text-[13px] font-semibold">Pendientes de aprobar · {pendingTotal}</span>
                </div>
                {pendingTotal > pending.length && (
                  <button type="button" className="text-xs font-medium text-[#c8603f]" onClick={() => setParams({ vista: 'lista', estado: 'pending', zona: null })}>
                    Ver todas
                  </button>
                )}
              </div>
              <ul className="list-none m-0 p-0">
                {pending.map((r) => (
                  <li key={r.id} className="flex flex-wrap md:flex-nowrap items-center gap-x-4 gap-y-1 px-[18px] py-2.5 border-b border-[#efedea] last:border-b-0">
                    <span className={`${dsMono} text-xs w-[150px]`}>
                      {shortDate(r.reservationDate)} · {r.startTime}–{r.endTime}
                    </span>
                    <span className="text-[13px] font-semibold w-[110px]">{unitLabel(r.propertyUnitNumber, r.propertyUnitBlock)}</span>
                    <span className="text-[13px] text-[#4b4a46] flex-1 min-w-0 truncate">
                      {r.commonAreaName} · {r.numberOfGuests} pers.{r.purpose ? ` · ${r.purpose}` : ''}
                    </span>
                    <div className="flex gap-1.5 ml-auto">
                      <button type="button" className={vtBtn.small} onClick={() => setSelected(r.id)}>
                        Ver
                      </button>
                      <button type="button" className={vtBtn.accent} onClick={() => approveQuick(r)} disabled={approving === r.id} aria-label={`Aprobar reserva de ${unitLabel(r.propertyUnitNumber, r.propertyUnitBlock)}`}>
                        {approving === r.id ? 'Aprobando…' : 'Aprobar'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </DsCard>
        )}

        <DsToolbar
          left={
            zones.length > 0 ? (
              <DsChips ariaLabel="Zona" chips={zoneChips} active={zoneId ? String(zoneId) : 'all'} onChange={(id) => setParams({ zona: id === 'all' ? null : id })} />
            ) : null
          }
          right={
            view === 'calendar' ? (
              <div className="flex items-center gap-1.5">
                <button type="button" className={vtBtn.icon} aria-label="Semana anterior" onClick={() => setParams({ semana: addDays(monday, -7) }, false)}>
                  <VtIcon name="back" size={14} />
                </button>
                <span className={`${dsMono} text-xs min-w-[150px] text-center`} aria-live="polite">
                  {weekLabel(monday)}
                </span>
                <button type="button" className={vtBtn.icon} aria-label="Semana siguiente" onClick={() => setParams({ semana: addDays(monday, 7) }, false)}>
                  <span className="rotate-180 inline-flex">
                    <VtIcon name="back" size={14} />
                  </span>
                </button>
                <button type="button" className={vtBtn.small} onClick={() => setParams({ semana: null }, false)} disabled={monday === startOfWeek(today)}>
                  Hoy
                </button>
              </div>
            ) : null
          }
        />

        {zonesTotal === 0 ? (
          <DsCard className="px-6 py-12 text-center">
            <div className="text-[15px] font-semibold">No hay zonas activas</div>
            <p className="text-[13px] text-[#8a8580] mt-1 mb-4">Crea una zona y configura su horario para recibir reservas.</p>
            <button type="button" className={vtBtn.primary} onClick={() => router.push(base)}>
              Ir a zonas
            </button>
          </DsCard>
        ) : view === 'calendar' ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="min-w-0">
                <DsEyebrow>{zone?.name ?? 'Zona'}</DsEyebrow>
                {zone && zone.schedules.filter((s) => s.isActive).length === 0 && (
                  <div className="text-xs text-[#c8603f] mt-0.5">Esta zona no tiene horario: configúralo en Zonas → Horario y bloqueos.</div>
                )}
              </div>
              <DsLegend items={LEGEND} />
            </div>
            <div className={loading ? 'opacity-60 transition-opacity' : ''}>
              <WeekCalendar days={weekDays(monday)} reservations={weekItems} schedules={zone?.schedules ?? []} today={today} selectedId={selected} onSelect={setSelected} />
            </div>
            {!loading && weekItems.length === 0 && <p className="text-center text-xs text-[#8a8580] m-0">Sin reservas esta semana.</p>}
          </>
        ) : (
          <>
            <DsChips ariaLabel="Estado de la reserva" chips={STATUS_FILTERS.map((f) => ({ id: f.id, label: f.label }))} active={estado} onChange={(id) => setParams({ estado: id === 'all' ? null : id })} />
            <DsTable
              ariaLabel="Reservas"
              columns={columns}
              rows={listItems}
              rowKey={(r) => r.id}
              onRowClick={(r) => setSelected(r.id)}
              selectedKey={selected}
              loading={loading && listItems.length === 0}
              empty="No hay reservas con estos filtros"
              minWidth={900}
              footer={listTotal > 0 ? <Pagination total={listTotal} totalPages={listPages} disabled={loading} /> : undefined}
            />
          </>
        )}
      </DsBody>

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
