/**
 * Z1 · Zonas comunes (/common-areas): cabecera con pestañas Zonas / Reservas, chips de
 * estado, buscador y zonas en tarjetas con capacidad, reglas y horario.
 * Página, tamaño, estado y búsqueda viven en la URL (?page, ?page_size, ?estado, ?q).
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Pagination, usePaginationParams } from '@shared/ui/pagination';
import { DsBody, DsCard, DsChips, DsPage, DsSearch, DsSectionHeader, DsToolbar, VtNotice, vtBtn } from '@/shared/ui/ds';
import type { CommonAreaListDTO } from '../domain';
import { getCommonAreaByIdAction, getCommonAreasAction, updateCommonAreaAction } from '../infrastructure/actions';
import { AreaCard } from './area-card';
import { AreaFormModal } from './area-form-modal';
import { AreaScheduleModal } from './area-schedule-modal';
import { DeleteAreaModal } from './delete-area-modal';
import { areaFormFrom, areaFormToDTO } from './design';
import { useBusinessToken } from './hooks/use-business-token';

type EstadoFilter = 'all' | 'active' | 'inactive';

const ESTADO_CHIPS: { id: EstadoFilter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'active', label: 'Activas' },
  { id: 'inactive', label: 'Inactivas' },
];

export function CommonAreasScreen({ businessId }: { businessId: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, pageSize } = usePaginationParams();
  const getToken = useBusinessToken(businessId);

  const estadoParam = searchParams.get('estado');
  const estado: EstadoFilter = estadoParam === 'active' || estadoParam === 'inactive' ? estadoParam : 'all';
  const q = searchParams.get('q') ?? '';

  const [search, setSearch] = useState(q);
  const [areas, setAreas] = useState<CommonAreaListDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [formArea, setFormArea] = useState<number | null | 'new'>(null);
  const [scheduleArea, setScheduleArea] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState<{ id: number; name: string } | null>(null);

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

  // Búsqueda con espera corta antes de tocar la URL.
  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => setParams({ q: search.trim() || null }), 300);
    return () => clearTimeout(t);
  }, [search, q, setParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const result = await getCommonAreasAction({
        token,
        businessId,
        page,
        pageSize,
        isActive: estado === 'all' ? undefined : estado === 'active',
        search: q || undefined,
      });
      if (!result.success) throw new Error(result.error);
      setAreas(result.data.data);
      setTotal(result.data.total);
      setTotalPages(result.data.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando zonas comunes');
    } finally {
      setLoading(false);
    }
  }, [getToken, businessId, page, pageSize, estado, q]);

  useEffect(() => {
    load();
  }, [load]);

  const done = (message: string) => {
    setFormArea(null);
    setScheduleArea(null);
    setDeleting(null);
    setNotice(message);
    load();
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

  const base = `/properties/${businessId}/common-areas`;

  return (
    <DsPage>
      <DsSectionHeader
        ariaLabel="Zonas comunes"
        tabs={[
          { id: 'zones', label: 'Zonas', count: loading ? null : total },
          { id: 'reservations', label: 'Reservas' },
        ]}
        active="zones"
        onChange={(id) => id === 'reservations' && router.push(`${base}/reservations`)}
        actions={
          <button type="button" className={vtBtn.primary} onClick={() => setFormArea('new')}>
            + Nueva zona
          </button>
        }
      />
      <DsBody>
        <DsToolbar
          left={<DsChips ariaLabel="Estado de la zona" chips={ESTADO_CHIPS} active={estado} onChange={(id) => setParams({ estado: id === 'all' ? null : id })} />}
          right={<DsSearch value={search} onChange={setSearch} placeholder="Buscar zona o ubicación" />}
        />

        {error && <VtNotice>{error}</VtNotice>}
        {notice && !error && <VtNotice tone="ok">{notice}</VtNotice>}

        {loading && areas.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#8a8580]">Cargando zonas…</div>
        ) : areas.length === 0 ? (
          <DsCard className="px-6 py-12 text-center">
            <div className="text-[15px] font-semibold">{q || estado !== 'all' ? 'No hay zonas con estos filtros' : 'Aún no hay zonas comunes'}</div>
            <p className="text-[13px] text-[#8a8580] mt-1 mb-4">Crea el salón, la piscina, el BBQ… con su capacidad, horario y reglas.</p>
            {!q && estado === 'all' && (
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
                reservationsHref={`${base}/reservations?zona=${area.id}`}
                busy={busyId === area.id}
                onEdit={() => setFormArea(area.id)}
                onSchedule={() => setScheduleArea({ id: area.id, name: area.name })}
                onToggleActive={() => toggleActive(area)}
                onDelete={() => setDeleting({ id: area.id, name: area.name })}
              />
            ))}
          </div>
        )}

        {total > 0 && (
          <div className="bg-white border border-[#e4e2dd] rounded-[10px] px-[18px] py-2">
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
    </DsPage>
  );
}
