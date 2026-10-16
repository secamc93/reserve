'use client';

/**
 * P1 · Paquetes / P4 · móvil ("PH - Visitas y Paquetes", Patrón A · Lista).
 * Por entregar primero, del más antiguo al más reciente, con su antigüedad (más de 3 días en
 * alerta). Chips por grupo con conteos, buscador, tabla densa en escritorio y tarjetas con
 * "Entregar" a mano en teléfono. Filtros y paginación en la URL.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DsBody,
  DsChips,
  DsPage,
  DsSearch,
  DsSectionHeader,
  DsStatus,
  DsTable,
  DsToolbar,
  VtNotice,
  dsMono,
  vtBtn,
  type DsColumn,
} from '@/shared/ui/ds';
import { Pagination, usePaginationParams } from '@shared/ui/pagination';
import { getPackagesAction, getPackagesSummaryAction } from '../infrastructure/actions';
import type { PackageListDTO, PackageStatusGroup, PackagesSummary } from '../domain';
import { PackageDetailPanel } from './package-detail-panel';
import { ReceivePackageModal } from './receive-package-modal';
import { useBusinessToken } from './use-business-token';
import { packagesQueryFor, patchQuery, readPackagesFilters } from './packages-filters';
import {
  AGE_COLOR,
  PACKAGE_GROUP_META,
  PACKAGE_GROUP_ORDER,
  ageLevel,
  formatAge,
  formatDateTime,
  packageActions,
  packageAgeHours,
  packageGroupOf,
  packageStatusLabel,
  unitLabel,
} from './package-state';

interface PackagesTableProps {
  businessId: number;
}

type Notice = { tone: 'ok' | 'error'; text: string } | null;

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
  const [selected, setSelected] = useState<{ row: PackageListDTO; deliver: boolean } | null>(null);
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

  const chipCount = (g: PackageStatusGroup) => (summary ? (g === 'pending' ? summary.pending : g === 'delivered' ? summary.delivered : summary.closed) : undefined);
  const chips = [{ id: 'all' as const, label: 'Todos', count: summary?.total }, ...PACKAGE_GROUP_ORDER.map((g) => ({ id: g, label: PACKAGE_GROUP_META[g].chip, count: chipCount(g) }))];

  const open = (row: PackageListDTO, deliver = false) => setSelected({ row, deliver });

  const columns: DsColumn<PackageListDTO>[] = [
    { key: 'unit', label: 'Unidad', width: '110px', render: (p) => <span className="font-semibold">{unitLabel(p.propertyUnitBlock, p.propertyUnitNumber)}</span> },
    {
      key: 'for',
      label: 'Para',
      width: 'minmax(150px,1fr)',
      render: (p) => (
        <div className="min-w-0">
          <div className="truncate">{p.residentName || <span className="text-[#8a8580]">Cualquier residente</span>}</div>
          {p.description && <div className="text-[11px] text-[#8a8580] truncate">{p.description}</div>}
        </div>
      ),
    },
    {
      key: 'shipping',
      label: 'Envío',
      width: 'minmax(150px,1fr)',
      render: (p) => (
        <div className="min-w-0">
          <div className="truncate">{p.carrier}</div>
          <div className={`${dsMono} text-[11px] text-[#8a8580] truncate`}>{p.trackingNumber}</div>
        </div>
      ),
    },
    { key: 'received', label: 'Recibido', width: '110px', render: (p) => <span className={`${dsMono} text-xs`}>{formatDateTime(p.receivedAt || p.createdAt)}</span> },
    { key: 'age', label: 'Antigüedad', width: '84px', render: (p) => <Age p={p} /> },
    {
      key: 'state',
      label: 'Estado',
      width: '110px',
      render: (p) => <DsStatus label={packageStatusLabel(p)} color={PACKAGE_GROUP_META[packageGroupOf(p)].color} />,
    },
    {
      key: 'action',
      label: <span className="sr-only">Acción</span>,
      width: '100px',
      align: 'right',
      render: (p) =>
        packageActions(p).canDeliver ? (
          <button
            type="button"
            className={vtBtn.accent}
            onClick={(e) => {
              e.stopPropagation();
              open(p, true);
            }}
            aria-label={`Entregar paquete de ${unitLabel(p.propertyUnitBlock, p.propertyUnitNumber)}`}
          >
            Entregar
          </button>
        ) : null,
    },
  ];

  const empty = filters.q
    ? `Ningún paquete coincide con “${filters.q}”`
    : filters.group === 'pending'
      ? 'No hay paquetes por entregar'
      : 'No hay paquetes registrados';

  return (
    <DsPage>
      <DsSectionHeader
        title={
          <span className="flex items-baseline gap-2">
            Paquetes
            {summary && <span className="text-[13px] font-normal text-[#6b6a66]">{summary.pending} por entregar</span>}
          </span>
        }
        actions={
          <>
            {summary && summary.pendingOverdue > 0 && (
              <button
                type="button"
                onClick={() => navigate({ group: 'pending' })}
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold mr-1"
                style={{ color: AGE_COLOR.overdue }}
              >
                <span className="w-[7px] h-[7px] rounded-full" style={{ background: AGE_COLOR.overdue }} aria-hidden="true" />
                {summary.pendingOverdue} con más de 3 días
              </button>
            )}
            {summary && <span className="hidden md:inline text-xs text-[#4b4a46] mr-2">{summary.deliveredToday} entregados hoy</span>}
            <button type="button" className={vtBtn.primary} onClick={() => setReceiveOpen(true)}>
              + Recibir paquete
            </button>
          </>
        }
      />
      <DsBody>
        <DsToolbar
          left={
            <DsChips<PackageStatusGroup | 'all'>
              ariaLabel="Estado del paquete"
              chips={chips}
              active={filters.group ?? 'all'}
              onChange={(id) => navigate({ group: id === 'all' ? undefined : id })}
            />
          }
          right={<DsSearch value={searchDraft} onChange={onSearch} placeholder="Buscar guía, unidad o residente" />}
        />

        {notice && <VtNotice tone={notice.tone}>{notice.text}</VtNotice>}

        <div className="hidden md:block">
          <DsTable
            ariaLabel="Paquetes"
            columns={columns}
            rows={packages}
            rowKey={(p) => p.id}
            loading={loading}
            onRowClick={(p) => open(p)}
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
            packages.map((p) => <PackageCard key={p.id} p={p} onOpen={() => open(p)} onDeliver={() => open(p, true)} />)
          )}
          <div className="rounded-[10px] overflow-hidden border border-[#e4e2dd]">
            <Pagination total={total} totalPages={totalPages} />
          </div>
        </div>
      </DsBody>

      <PackageDetailPanel
        businessId={businessId}
        row={selected?.row ?? null}
        startDelivering={selected?.deliver}
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

function Age({ p }: { p: PackageListDTO }) {
  const pending = packageGroupOf(p) === 'pending';
  if (!pending) return <span className="text-[#8a8580]">—</span>;
  const hours = packageAgeHours(p);
  const level = ageLevel(hours);
  return (
    <span className={`${dsMono} text-xs ${level === 'fresh' ? '' : 'font-semibold'}`} style={{ color: AGE_COLOR[level] }}>
      {formatAge(hours)}
    </span>
  );
}

function PackageCard({ p, onOpen, onDeliver }: { p: PackageListDTO; onOpen: () => void; onDeliver: () => void }) {
  const group = packageGroupOf(p);
  const meta = PACKAGE_GROUP_META[group];
  const canDeliver = packageActions(p).canDeliver;
  const unit = unitLabel(p.propertyUnitBlock, p.propertyUnitNumber);
  return (
    <article className="bg-white border border-[#e4e2dd] rounded-[10px] overflow-hidden" style={{ borderLeft: `3px solid ${meta.color}` }}>
      <button type="button" onClick={onOpen} className="w-full text-left px-4 pt-3 pb-2.5 flex gap-3 items-start" aria-label={`Ver paquete de ${unit}`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[15px] font-semibold">{unit}</span>
            <Age p={p} />
          </div>
          <div className="text-[13px] text-[#4b4a46] truncate">{p.residentName || 'Cualquier residente'}</div>
          <div className={`${dsMono} text-[11px] text-[#8a8580] truncate mt-0.5`}>
            {p.carrier} · {p.trackingNumber}
          </div>
          <div className="mt-1.5">
            <DsStatus label={packageStatusLabel(p)} color={meta.color} />
          </div>
        </div>
      </button>
      {canDeliver && (
        <div className="px-4 pb-3">
          <button type="button" className={`${vtBtn.primary} w-full`} onClick={onDeliver}>
            Entregar
          </button>
        </div>
      )}
    </article>
  );
}
