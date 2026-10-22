'use client';

/**
 * P1 · Paquetes / P4 · móvil ("PH - Visitas y Paquetes").
 * Escritorio: pestañas Por entregar · Entregados hoy · Todos con conteos, "Recordar a residentes"
 * y "+ Recibir paquete"; buscador a la derecha; tabla con unidad, residente, transportadora, guía,
 * días en portería y "Entregar" + ⋮. Teléfono: título con el conteo, buscador grande por unidad,
 * tarjetas con "Entregar" y "+ Recibir paquete" fijo abajo. Filtros y paginación en la URL.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DsBody, DsPage, DsSearch, DsSectionHeader, DsTable, VtMenu, VtNotice, dsMono, vtBtn, type DsColumn } from '@/shared/ui/ds';
import { Pagination, usePaginationParams } from '@shared/ui/pagination';
import { getPackagesAction, getPackagesSummaryAction } from '../infrastructure/actions';
import type { PackageListDTO, PackagesSummary } from '../domain';
import { PackageDetailPanel } from './package-detail-panel';
import { ReceivePackageModal } from './receive-package-modal';
import { useBusinessToken } from './use-business-token';
import { packagesQueryFor, patchQuery, readPackagesFilters, type PackagesTab } from './packages-filters';
import { daysColor, formatDays, packageActions, packageDays, packageGroupOf, unitLabel } from './package-state';

interface PackagesTableProps {
  businessId: number;
}

type Notice = { tone: 'ok' | 'error'; text: string } | null;
type Selection = { row: PackageListDTO; mode: 'detail' | 'deliver' | 'return' } | null;

export function PackagesTable({ businessId }: PackagesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const getToken = useBusinessToken(businessId);
  // Clave de texto: los filtros solo cambian cuando cambia la URL, no en cada render
  const qsKey = searchParams?.toString() ?? '';
  const filters = useMemo(() => readPackagesFilters(new URLSearchParams(qsKey)), [qsKey]);
  const query = useMemo(() => packagesQueryFor(filters), [filters]);
  const { page, pageSize } = usePaginationParams();

  const [packages, setPackages] = useState<PackageListDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PackagesSummary | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [selected, setSelected] = useState<Selection>(null);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(filters.q);

  const navigate = useCallback(
    (patch: Record<string, string | undefined>) => {
      const qs = patchQuery(searchParams, patch);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  useEffect(() => setSearchDraft(filters.q), [filters.q]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSearch = (value: string) => {
    setSearchDraft(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => navigate({ q: value.trim() || undefined }), 350);
  };
  useEffect(() => () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
  }, []);

  const showNotice = useCallback((n: Notice) => {
    setNotice(n);
    if (n?.tone === 'ok') setTimeout(() => setNotice((cur) => (cur === n ? null : cur)), 4000);
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await getPackagesAction({ businessId, token, page, pageSize, ...query });
      setPackages(data.packages);
      setTotal(data.total);
      setTotalPages(Math.max(1, data.totalPages));
    } catch (e) {
      showNotice({ tone: 'error', text: e instanceof Error ? e.message : 'No se pudieron cargar los paquetes' });
    } finally {
      setLoading(false);
    }
  }, [businessId, page, pageSize, query, getToken, showNotice]);

  const loadSummary = useCallback(async () => {
    try {
      const token = await getToken();
      setSummary(await getPackagesSummaryAction({ businessId, token }));
    } catch {
      setSummary(null);
    }
  }, [businessId, getToken]);

  useEffect(() => {
    loadList();
  }, [loadList]);
  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    setSelected((cur) => (cur ? { ...cur, row: packages.find((p) => p.id === cur.row.id) ?? cur.row } : cur));
  }, [packages]);

  const reload = useCallback(() => {
    loadList();
    loadSummary();
  }, [loadList, loadSummary]);

  const tabs: { id: PackagesTab; label: string; count?: number }[] = [
    { id: 'pending', label: 'Por entregar', count: summary?.pending },
    { id: 'today', label: 'Entregados hoy', count: summary?.deliveredToday },
    { id: 'all', label: 'Todos' },
  ];

  const columns: DsColumn<PackageListDTO>[] = [
    { key: 'unit', label: 'Unidad', width: '110px', render: (p) => <span className={`${dsMono} font-semibold`}>{unitLabel(p.propertyUnitBlock, p.propertyUnitNumber)}</span> },
    {
      key: 'resident',
      label: 'Residente',
      width: 'minmax(160px,1.3fr)',
      render: (p) => (
        <div className="min-w-0">
          <div className="truncate">{p.residentName || <span className="text-[#8a8580]">Cualquier residente</span>}</div>
          {p.description && <div className="text-[11px] text-[#8a8580] truncate">{p.description}</div>}
        </div>
      ),
    },
    { key: 'carrier', label: 'Transportadora', width: 'minmax(110px,.8fr)', render: (p) => <span className="truncate">{p.carrier}</span> },
    { key: 'tracking', label: 'Guía', width: 'minmax(110px,.8fr)', render: (p) => <span className={`${dsMono} text-xs truncate`}>{p.trackingNumber || '—'}</span> },
    { key: 'days', label: 'En portería', width: '96px', render: (p) => <Days p={p} /> },
    {
      key: 'action',
      label: <span className="sr-only">Acción</span>,
      width: '130px',
      align: 'right',
      render: (p) => {
        const a = packageActions(p);
        const unit = unitLabel(p.propertyUnitBlock, p.propertyUnitNumber);
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {a.canDeliver ? (
              <button type="button" className={`${vtBtn.primary} h-[30px]! px-3! text-xs!`} onClick={() => setSelected({ row: p, mode: 'deliver' })} aria-label={`Entregar paquete de ${unit}`}>
                Entregar
              </button>
            ) : (
              <button type="button" className={vtBtn.small} onClick={() => setSelected({ row: p, mode: 'detail' })} aria-label={`Ver paquete de ${unit}`}>
                Ver
              </button>
            )}
            <VtMenu
              label={`Más acciones del paquete de ${unit}`}
              items={[
                { label: 'Ver detalle', onSelect: () => setSelected({ row: p, mode: 'detail' }) },
                ...(a.canReturn ? [{ label: 'Devolver', danger: true, onSelect: () => setSelected({ row: p, mode: 'return' }) }] : []),
              ]}
            />
          </div>
        );
      },
    },
  ];

  const empty = filters.q
    ? `Ningún paquete coincide con “${filters.q}”`
    : filters.tab === 'pending'
      ? 'No hay paquetes por entregar'
      : filters.tab === 'today'
        ? 'Hoy no se han entregado paquetes'
        : 'No hay paquetes registrados';

  return (
    <DsPage>
      <div className="hidden md:block">
        <DsSectionHeader<PackagesTab>
          ariaLabel="Vistas de paquetes"
          tabs={tabs}
          active={filters.tab}
          onChange={(tab) => navigate({ tab: tab === 'pending' ? undefined : tab })}
          actions={
            <>
              <span title="Pronto: avisar por WhatsApp y correo a los residentes con paquetes por entregar. Aún no hay servicio de notificaciones.">
                <button type="button" className={vtBtn.secondary} disabled aria-describedby="remind-help">
                  Recordar a residentes
                </button>
              </span>
              <span id="remind-help" className="sr-only">
                Aún no hay servicio de notificaciones para recordar a los residentes.
              </span>
              <button type="button" className={vtBtn.primary} onClick={() => setReceiveOpen(true)}>
                + Recibir paquete
              </button>
            </>
          }
        />
      </div>

      {/* Teléfono (P4): título con el conteo y buscador grande por unidad */}
      <div className="md:hidden px-4 pt-4 flex flex-col gap-3">
        <div>
          <h1 className="m-0 text-[22px] font-semibold tracking-[-.015em]">Paquetes</h1>
          <div className={`${dsMono} text-xs text-[#8a8580]`}>{summary?.pending ?? 0} por entregar</div>
        </div>
        <input
          type="search"
          aria-label="Buscar paquete por unidad"
          placeholder="126"
          inputMode="search"
          className={`${dsMono} h-12 w-full rounded-2xl border-[1.5px] border-[#1a1a1a] bg-white px-3.5 text-lg outline-none`}
          value={searchDraft}
          onChange={(e) => onSearch(e.target.value)}
        />
        {filters.q && !loading && (
          <div className="text-[13px] text-[#4b4a46]">
            {total} {total === 1 ? 'coincidencia' : 'coincidencias'} con «{filters.q}»
          </div>
        )}
      </div>

      <DsBody className="max-md:pb-32">
        <div className="hidden md:flex justify-end">
          <DsSearch value={searchDraft} onChange={onSearch} placeholder="Unidad, residente o guía" className="md:w-[260px]" ariaLabel="Buscar paquete" />
        </div>

        {notice && <VtNotice tone={notice.tone}>{notice.text}</VtNotice>}

        <div className="hidden md:block">
          <DsTable
            ariaLabel="Paquetes"
            columns={columns}
            rows={packages}
            rowKey={(p) => p.id}
            loading={loading}
            onRowClick={(p) => setSelected({ row: p, mode: 'detail' })}
            selectedKey={selected?.row.id ?? null}
            empty={empty}
            minWidth={900}
            footer={<Pagination total={total} totalPages={totalPages} className="border-t-0! bg-transparent! px-0! py-1!" />}
          />
        </div>

        <div className="md:hidden flex flex-col gap-2" aria-label="Paquetes (lista)">
          {loading ? (
            <div className="py-10 text-center text-sm text-[#8a8580]">Cargando…</div>
          ) : packages.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#8a8580]">{empty}</div>
          ) : (
            packages.map((p) => <PackageCard key={p.id} p={p} onOpen={() => setSelected({ row: p, mode: 'detail' })} onDeliver={() => setSelected({ row: p, mode: 'deliver' })} />)
          )}
          {totalPages > 1 && (
            <div className="rounded-2xl overflow-hidden border border-[#e4e2dd]">
              <Pagination total={total} totalPages={totalPages} />
            </div>
          )}
        </div>
      </DsBody>

      {/* Teléfono: recibir paquete, fijo abajo (sobre la barra de navegación) */}
      <div className="md:hidden fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] px-4 z-30">
        <button type="button" className={`${vtBtn.primary} w-full h-[52px]! text-[15px]!`} onClick={() => setReceiveOpen(true)}>
          + Recibir paquete
        </button>
      </div>

      <PackageDetailPanel
        businessId={businessId}
        row={selected?.row ?? null}
        mode={selected?.mode}
        onClose={() => setSelected(null)}
        onChanged={(text) => {
          showNotice({ tone: 'ok', text });
          reload();
        }}
      />

      <ReceivePackageModal
        isOpen={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        businessId={businessId}
        onSuccess={(text) => {
          setReceiveOpen(false);
          showNotice({ tone: 'ok', text });
          reload();
        }}
      />
    </DsPage>
  );
}

/** Días en portería ("hoy", "1 día", "6 días"); en entregados, cuánto estuvo. */
function Days({ p }: { p: PackageListDTO }) {
  const days = packageDays(p);
  const pending = packageGroupOf(p) === 'pending';
  return (
    <span className={`${dsMono} text-xs font-semibold`} style={{ color: pending ? daysColor(days) : '#8a8580' }}>
      {formatDays(days)}
    </span>
  );
}

function PackageCard({ p, onOpen, onDeliver }: { p: PackageListDTO; onOpen: () => void; onDeliver: () => void }) {
  const canDeliver = packageActions(p).canDeliver;
  const unit = unitLabel(p.propertyUnitBlock, p.propertyUnitNumber);
  const days = packageDays(p);
  const pending = packageGroupOf(p) === 'pending';
  return (
    <article className="bg-white border border-[#e4e2dd] rounded-2xl px-4 py-3 flex items-center gap-3">
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left" aria-label={`Ver paquete de ${unit}`}>
        <div className={`${dsMono} text-base font-semibold`}>{unit}</div>
        <div className="text-[13px] text-[#4b4a46] truncate">{p.residentName || 'Cualquier residente'}</div>
        <div className="text-xs truncate">
          <span className="text-[#8a8580]">{p.carrier} · </span>
          <span style={{ color: pending ? daysColor(days) : '#8a8580' }}>{formatDays(days)}</span>
        </div>
      </button>
      {canDeliver && (
        <button type="button" className={`${vtBtn.primary} h-11! px-4!`} onClick={onDeliver} aria-label={`Entregar paquete de ${unit}`}>
          Entregar
        </button>
      )}
    </article>
  );
}
