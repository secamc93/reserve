/**
 * Z1 · Zonas comunes (/common-areas): cabecera con pestañas (Zonas, Calendario de reservas,
 * Pendientes, Historial) y zonas en tarjetas (3 columnas) con reglas y "Esta semana".
 * Con más de 6 zonas aparecen chips de estado y buscador. Página y filtros viven en la URL.
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Pagination, usePaginationParams } from '@shared/ui/pagination';
import { DsBody, DsCard, DsChips, DsPage, DsSearch, DsToolbar, VtNotice, vtBtn } from '@/shared/ui/ds';
import type { CommonAreaListDTO, ReservationListDTO } from '../domain';
import { getCommonAreaByIdAction, getCommonAreasAction, getReservationsAction, updateCommonAreaAction } from '../infrastructure/actions';
import { AreaCard } from './area-card';
import { AreaFormModal } from './area-form-modal';
import { AreaScheduleModal } from './area-schedule-modal';
import { DeleteAreaModal } from './delete-area-modal';
import { ReservationFormModal } from './reservation-form-modal';
import { ZonesHeader, zonesTabHref } from './zones-header';
import { addDays, areaFormFrom, areaFormToDTO, startOfWeek, toISODate, weekCells, weekDays, weekSummary } from './design';
import { useBusinessToken } from './hooks/use-business-token';

type EstadoFilter = 'all' | 'active' | 'inactive';

const ESTADO_CHIPS: { id: EstadoFilter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'active', label: 'Activas' },
  { id: 'inactive', label: 'Inactivas' },
];

/** Con más zonas que esto se muestran chips y buscador. */
const FILTERS_FROM = 6;

export function CommonAreasScreen({ businessId }: { businessId: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, pageSize } = usePaginationParams();
  const getToken = useBusinessToken(businessId);

  const estadoParam = searchParams.get('estado');
  const estado: EstadoFilter = estadoParam === 'active' || estadoParam === 'inactive' ? estadoParam : 'all';
  const q = searchParams.get('q') ?? '';
  const filtering = estado !== 'all' || q !== '';

  const today = toISODate(new Date());
  const monday = startOfWeek(today);
  const days = useMemo(() => weekDays(monday), [monday]);

  const [search, setSearch] = useState(q);
  const [areas, setAreas] = useState<CommonAreaListDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [allTotal, setAllTotal] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [week, setWeek] = useState<ReservationListDTO[]>([]);
  const [pendingTotal, setPendingTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [refresh, setRefresh] = useState(0);

  const [formArea, setFormArea] = useState<number | null | 'new'>(null);
  const [scheduleArea, setScheduleArea] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState<{ id: number; name: string } | null>(null);
  const [reserving, setReserving] = useState(false);

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === '') params.delete(k);
        else params.set(k, v);
      }
      params.delete('page');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => setParams({ q: search.trim() || null }), 300);
    return () => clearTimeout(t);
  }, [search, q, setParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const token = await getToken();
        const [list, weekRes, pendingRes] = await Promise.all([
          getCommonAreasAction({ token, businessId, page, pageSize, isActive: estado === 'all' ? undefined : estado === 'active', search: q || undefined }),
          getReservationsAction({ token, businessId, startDate: monday, endDate: addDays(monday, 6), page: 1, pageSize: 200 }),
          getReservationsAction({ token, businessId, status: ['pending'], page: 1, pageSize: 1 }),
        ]);
        if (cancelled) return;
        if (!list.success) throw new Error(list.error);
        setAreas(list.data.data);
        setTotal(list.data.total);
        setTotalPages(list.data.totalPages || 1);
        if (!filtering) setAllTotal(list.data.total);
        setWeek(weekRes.success ? weekRes.data.data : []);
        setPendingTotal(pendingRes.success ? pendingRes.data.total : null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error cargando zonas comunes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken, businessId, page, pageSize, estado, q, filtering, monday, refresh]);

  const done = (message: string) => {
    setFormArea(null);
    setScheduleArea(null);
    setDeleting(null);
    setReserving(false);
    setNotice(message);
    setRefresh((n) => n + 1);
  };

  const toggleActive = async (area: CommonAreaListDTO) => {
    setBusyId(area.id);
    setError(null);
    try {
      const token = await getToken();
      const current = await getCommonAreaByIdAction({ token, businessId, id: area.id });
      if (!current.success) throw new Error(current.error);
      const data = areaFormToDTO({ ...areaFormFrom(current.data), isActive: !current.data.isActive });
      const result = await updateCommonAreaAction({ token, businessId, id: area.id, data });
      if (!result.success) throw new Error(result.error);
      done(result.data.isActive ? `"${area.name}" activada` : `"${area.name}" desactivada`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el estado');
    } finally {
      setBusyId(null);
    }
  };

  const showFilters = filtering || (allTotal ?? 0) > FILTERS_FROM;
  const activeZones = areas.filter((a) => a.isActive);

  return (
    <DsPage>
      <ZonesHeader
        businessId={businessId}
        active="zones"
        zonesCount={allTotal}
        pendingCount={pendingTotal}
        actions={
          <>
            <button type="button" className={vtBtn.secondary} onClick={() => setFormArea('new')}>
              + Nueva zona
            </button>
            <button type="button" className={vtBtn.primary} onClick={() => setReserving(true)} disabled={activeZones.length === 0}>
              + Nueva reserva
            </button>
          </>
        }
      />
      <DsBody>
        {showFilters && (
          <DsToolbar
            left={<DsChips ariaLabel="Estado de la zona" chips={ESTADO_CHIPS} active={estado} onChange={(id) => setParams({ estado: id === 'all' ? null : id })} />}
            right={<DsSearch value={search} onChange={setSearch} placeholder="Buscar zona o ubicación" />}
          />
        )}

        {error && <VtNotice>{error}</VtNotice>}
        {notice && !error && <VtNotice tone="ok">{notice}</VtNotice>}

        {loading && areas.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#8a8580]">Cargando zonas…</div>
        ) : areas.length === 0 ? (
          <DsCard className="px-6 py-12 text-center">
            <div className="text-[15px] font-semibold">{filtering ? 'No hay zonas con estos filtros' : 'Aún no hay zonas comunes'}</div>
            <p className="text-[13px] text-[#8a8580] mt-1 mb-4">Crea el salón, la piscina, el BBQ… con su capacidad, horario y reglas.</p>
            {!filtering && (
              <button type="button" className={vtBtn.primary} onClick={() => setFormArea('new')}>
                + Nueva zona
              </button>
            )}
          </DsCard>
        ) : (
          <div className={`grid gap-3.5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
            {areas.map((area) => (
              <AreaCard
                key={area.id}
                area={area}
                today={today}
                days={days}
                cells={weekCells(area, days, week)}
                summary={weekSummary(area, week, today)}
                busy={busyId === area.id}
                onOpen={() => router.push(`${zonesTabHref(businessId, 'calendar')}?zona=${area.id}`)}
                onEdit={() => setFormArea(area.id)}
                onSchedule={() => setScheduleArea({ id: area.id, name: area.name })}
                onToggleActive={() => toggleActive(area)}
                onDelete={() => setDeleting({ id: area.id, name: area.name })}
              />
            ))}
          </div>
        )}

        {(total > pageSize || page > 1) && (
          <div className="bg-white border border-[#e4e2dd] rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,.04),0_4px_14px_rgba(0,0,0,.05)] px-[18px] py-2">
            <Pagination total={total} totalPages={totalPages} disabled={loading} />
          </div>
        )}
      </DsBody>

      <AreaFormModal
        open={formArea !== null}
        businessId={businessId}
        areaId={formArea === 'new' || formArea === null ? null : formArea}
        getToken={getToken}
        onClose={() => setFormArea(null)}
        onSaved={done}
      />
      <AreaScheduleModal open={scheduleArea !== null} businessId={businessId} area={scheduleArea} getToken={getToken} onClose={() => setScheduleArea(null)} onSaved={done} />
      <DeleteAreaModal businessId={businessId} area={deleting} getToken={getToken} onClose={() => setDeleting(null)} onDeleted={done} />
      <ReservationFormModal
        open={reserving}
        businessId={businessId}
        zones={activeZones}
        defaultDate={today}
        getToken={getToken}
        onClose={() => setReserving(false)}
        onCreated={done}
      />
    </DsPage>
  );
}
