'use client';

/**
 * V1 · Visitas de hoy / V4 · móvil ("PH - Visitas y Paquetes", Patrón A · Lista).
 * Cabecera con pestañas Hoy / Historial y "Nueva visita"; chips por estado de portería
 * (dentro, esperadas, salieron, canceladas) con conteos del día; buscador; tabla densa en
 * escritorio y tarjetas con la acción principal a mano en teléfono. Filtros y paginación en la URL.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DS,
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
  vtInput,
  type DsColumn,
} from '@/shared/ui/ds';
import { Pagination, usePaginationParams } from '@shared/ui/pagination';
import { getVisitTypesAction, getVisitsAction, getVisitsSummaryAction, registerEntryAction, registerExitAction } from '../infrastructure/actions';
import type { Visit, VisitListDTO, VisitState, VisitType, VisitsSummary } from '../domain';
import { DEFAULT_GATE, VisitDetailPanel } from './visit-detail-panel';
import { VisitFormModal } from './visit-form-modal';
import { useBusinessToken } from './use-business-token';
import { patchQuery, readVisitsFilters, visitsQueryFor, type VisitsTab } from './visits-filters';
import {
  VISIT_STATE_META,
  VISIT_STATE_ORDER,
  formatClock,
  formatDuration,
  formatWallDay,
  formatWallTime,
  minutesBetween,
  todayInProperty,
  unitLabel,
  visitActions,
  visitStateOf,
} from './visit-state';

interface VisitsTableProps {
  businessId: number;
}

type Notice = { tone: 'ok' | 'error'; text: string } | null;

export function VisitsTable({ businessId }: VisitsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const getToken = useBusinessToken(businessId);
  const today = todayInProperty();
  // Clave de texto: los filtros solo cambian cuando cambia la URL, no en cada render
  const qsKey = searchParams?.toString() ?? '';
  const filters = useMemo(() => readVisitsFilters(new URLSearchParams(qsKey), today), [qsKey, today]);
  const query = useMemo(() => visitsQueryFor(filters), [filters]);
  const { page, pageSize } = usePaginationParams();

  const [visits, setVisits] = useState<VisitListDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<VisitsSummary | null>(null);
  const [types, setTypes] = useState<VisitType[]>([]);
  const [notice, setNotice] = useState<Notice>(null);
  const [rowBusy, setRowBusy] = useState<number | null>(null);
  const [selected, setSelected] = useState<VisitListDTO | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{ visit: Visit; visitorName: string; visitorDni: string } | undefined>();
  const [searchDraft, setSearchDraft] = useState(filters.q);

  const navigate = useCallback(
    (patch: Record<string, string | number | undefined>) => {
      const qs = patchQuery(searchParams, patch);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Buscador con espera: escribe en la URL 350 ms después de dejar de teclear
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
      const data = await getVisitsAction({ businessId, token, page, pageSize, ...query });
      setVisits(data.visits);
      setTotal(data.total);
      setTotalPages(Math.max(1, data.totalPages));
    } catch (e) {
      showNotice({ tone: 'error', text: e instanceof Error ? e.message : 'No se pudieron cargar las visitas' });
    } finally {
      setLoading(false);
    }
  }, [businessId, page, pageSize, query, getToken, showNotice]);

  const loadSummary = useCallback(async () => {
    if (filters.tab !== 'today') return;
    try {
      const token = await getToken();
      setSummary(await getVisitsSummaryAction({ businessId, token, date: filters.date }));
    } catch {
      setSummary(null);
    }
  }, [businessId, filters.tab, filters.date, getToken]);

  useEffect(() => {
    loadList();
  }, [loadList]);
  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Tipos de visita para el filtro del historial
  useEffect(() => {
    if (filters.tab !== 'history' || types.length) return;
    (async () => {
      try {
        const token = await getToken();
        setTypes((await getVisitTypesAction({ token })).filter((t) => t.isActive));
      } catch {
        /* el filtro por tipo queda vacío */
      }
    })();
  }, [filters.tab, types.length, getToken]);

  // Al recargar, el panel abierto toma la fila nueva (estado y horas al día)
  useEffect(() => {
    setSelected((cur) => (cur ? visits.find((v) => v.id === cur.id) ?? cur : cur));
  }, [visits]);

  const reload = useCallback(() => {
    loadList();
    loadSummary();
  }, [loadList, loadSummary]);

  const quickAction = async (v: VisitListDTO, kind: 'entry' | 'exit') => {
    setRowBusy(v.id);
    try {
      const token = await getToken();
      if (kind === 'entry') {
        await registerEntryAction({ businessId, visitId: v.id, data: { gate: DEFAULT_GATE, method: 'manual' }, token });
      } else {
        await registerExitAction({ businessId, visitId: v.id, data: { gate: DEFAULT_GATE }, token });
      }
      showNotice({ tone: 'ok', text: `${kind === 'entry' ? 'Entrada' : 'Salida'} de ${v.visitorName} registrada · ${formatClock(new Date().toISOString())}` });
      reload();
    } catch (e) {
      showNotice({ tone: 'error', text: e instanceof Error ? e.message : 'No se pudo registrar' });
    } finally {
      setRowBusy(null);
    }
  };

  const chips = [
    { id: 'all' as const, label: 'Todas', count: filters.tab === 'today' ? summary?.total : undefined },
    ...VISIT_STATE_ORDER.map((s) => ({
      id: s,
      label: VISIT_STATE_META[s].chip,
      count: filters.tab === 'today' && summary ? summary[s] : undefined,
    })),
  ];

  const isToday = filters.tab === 'today';
  const columns: DsColumn<VisitListDTO>[] = [
    {
      key: 'time',
      label: isToday ? 'Hora' : 'Día',
      width: isToday ? '64px' : '120px',
      render: (v) => (
        <span className={`${dsMono} text-xs`}>
          {isToday ? formatWallTime(v.scheduledStartTime) || '—' : `${formatWallDay(v.scheduledDate)} ${formatWallTime(v.scheduledStartTime)}`}
        </span>
      ),
    },
    {
      key: 'visitor',
      label: 'Visitante',
      width: 'minmax(180px,1fr)',
      render: (v) => (
        <div className="min-w-0">
          <div className="font-semibold truncate">{v.visitorName}</div>
          <div className={`${dsMono} text-[11px] text-[#8a8580] truncate`}>
            {v.visitorDni}
            {v.purpose ? ` · ${v.purpose}` : ''}
          </div>
        </div>
      ),
    },
    { key: 'unit', label: 'Unidad', width: '110px', render: (v) => <span className="font-semibold">{unitLabel(v.propertyUnitBlock, v.propertyUnitNumber)}</span> },
    { key: 'type', label: 'Tipo', width: '110px', render: (v) => <span className="text-[#4b4a46] truncate">{v.visitTypeName}</span> },
    {
      key: 'state',
      label: 'Estado',
      width: '100px',
      render: (v) => {
        const m = VISIT_STATE_META[visitStateOf(v)];
        return <DsStatus label={m.label} color={m.color} />;
      },
    },
    { key: 'inout', label: 'Entrada · Salida', width: '140px', render: (v) => <InOut v={v} /> },
    {
      key: 'action',
      label: <span className="sr-only">Acción</span>,
      width: '130px',
      align: 'right',
      render: (v) => <RowAction v={v} busy={rowBusy === v.id} onAction={quickAction} />,
    },
  ];

  return (
    <DsPage>
      <DsSectionHeader<VisitsTab>
        ariaLabel="Vistas de visitas"
        tabs={[
          { id: 'today', label: filters.date === today ? 'Hoy' : formatWallDay(`${filters.date}T00:00:00Z`), count: summary?.total },
          { id: 'history', label: 'Historial' },
        ]}
        active={filters.tab}
        onChange={(tab) => navigate({ tab: tab === 'today' ? undefined : tab, state: undefined, from: undefined, to: undefined, type: undefined, date: undefined })}
        actions={
          <>
            {summary && summary.insideNow > 0 && (
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#4b4a46] mr-1">
                <span className="w-[7px] h-[7px] rounded-full" style={{ background: DS.yes }} aria-hidden="true" />
                {summary.insideNow} dentro ahora
              </span>
            )}
            <button
              type="button"
              className={vtBtn.primary}
              onClick={() => {
                setEditTarget(undefined);
                setFormOpen(true);
              }}
            >
              + Nueva visita
            </button>
          </>
        }
      />
      <DsBody>
        <DsToolbar
          left={
            <DsChips<VisitState | 'all'>
              ariaLabel="Estado de la visita"
              chips={chips}
              active={filters.state ?? 'all'}
              onChange={(id) => navigate({ state: id === 'all' ? undefined : id })}
            />
          }
          right={
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              {isToday ? (
                <input
                  type="date"
                  aria-label="Día"
                  className={`${vtInput} ${dsMono} h-[30px] max-md:h-11 text-xs w-full md:w-[150px]`}
                  value={filters.date}
                  onChange={(e) => navigate({ date: e.target.value && e.target.value !== today ? e.target.value : undefined })}
                />
              ) : (
                <div className="flex gap-2">
                  <input
                    type="date"
                    aria-label="Desde"
                    className={`${vtInput} ${dsMono} h-[30px] max-md:h-11 text-xs flex-1 md:w-[140px]`}
                    value={filters.from}
                    onChange={(e) => navigate({ from: e.target.value || undefined })}
                  />
                  <input
                    type="date"
                    aria-label="Hasta"
                    className={`${vtInput} ${dsMono} h-[30px] max-md:h-11 text-xs flex-1 md:w-[140px]`}
                    value={filters.to}
                    onChange={(e) => navigate({ to: e.target.value || undefined })}
                  />
                  <select
                    aria-label="Tipo de visita"
                    className={`${vtInput} h-[30px] max-md:h-11 text-xs flex-1 md:w-[140px]`}
                    value={filters.typeId ?? ''}
                    onChange={(e) => navigate({ type: e.target.value || undefined })}
                  >
                    <option value="">Todos los tipos</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <DsSearch value={searchDraft} onChange={onSearch} placeholder="Buscar visitante o unidad" />
            </div>
          }
        />

        {notice && <VtNotice tone={notice.tone}>{notice.text}</VtNotice>}

        {/* Escritorio: tabla densa */}
        <div className="hidden md:block">
          <DsTable
            ariaLabel="Visitas"
            columns={columns}
            rows={visits}
            rowKey={(v) => v.id}
            loading={loading}
            onRowClick={setSelected}
            selectedKey={selected?.id ?? null}
            empty={emptyText(filters.tab, filters.state, filters.q)}
            footer={<Pagination total={total} totalPages={totalPages} className="border-t-0! bg-transparent! px-0! py-1!" />}
          />
        </div>

        {/* Teléfono: tarjetas con la acción principal */}
        <div className="md:hidden flex flex-col gap-2" aria-label="Visitas (lista)">
          {loading ? (
            <div className="py-10 text-center text-sm text-[#8a8580]">Cargando…</div>
          ) : visits.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#8a8580]">{emptyText(filters.tab, filters.state, filters.q)}</div>
          ) : (
            visits.map((v) => <VisitCard key={v.id} v={v} isToday={isToday} busy={rowBusy === v.id} onOpen={() => setSelected(v)} onAction={quickAction} />)
          )}
          <div className="rounded-[10px] overflow-hidden border border-[#e4e2dd]">
            <Pagination total={total} totalPages={totalPages} />
          </div>
        </div>
      </DsBody>

      <VisitDetailPanel
        businessId={businessId}
        row={selected}
        onClose={() => setSelected(null)}
        onChanged={(text) => {
          showNotice({ tone: 'ok', text });
          reload();
        }}
        onEdit={(visit, row) => {
          setEditTarget({ visit, visitorName: row.visitorName, visitorDni: row.visitorDni });
          setFormOpen(true);
        }}
      />

      <VisitFormModal
        open={formOpen}
        businessId={businessId}
        edit={editTarget}
        onClose={() => setFormOpen(false)}
        onSaved={(text) => {
          setFormOpen(false);
          setEditTarget(undefined);
          showNotice({ tone: 'ok', text });
          reload();
        }}
      />
    </DsPage>
  );
}

function emptyText(tab: VisitsTab, state: VisitState | undefined, q: string): string {
  if (q) return `Ninguna visita coincide con “${q}”`;
  if (state) return `Sin visitas ${VISIT_STATE_META[state].chip.toLowerCase()}${tab === 'today' ? ' este día' : ''}`;
  return tab === 'today' ? 'No hay visitas programadas este día' : 'No hay visitas registradas';
}

/** "14:32 → 15:10" (salió), "14:32 · 45 min" (dentro) o "—". */
function InOut({ v }: { v: VisitListDTO }) {
  if (!v.actualEntryTime) return <span className="text-[#8a8580]">—</span>;
  const entry = formatClock(v.actualEntryTime);
  if (v.actualExitTime) {
    return (
      <span className={`${dsMono} text-xs`}>
        {entry} → {formatClock(v.actualExitTime)}
      </span>
    );
  }
  return (
    <span className={`${dsMono} text-xs`}>
      {entry} <span className="text-[#8a8580]">· {formatDuration(minutesBetween(v.actualEntryTime))}</span>
    </span>
  );
}

function RowAction({ v, busy, onAction }: { v: VisitListDTO; busy: boolean; onAction: (v: VisitListDTO, kind: 'entry' | 'exit') => void }) {
  const a = visitActions(v);
  if (!a.canEnter && !a.canExit) return null;
  const kind = a.canEnter ? 'entry' : 'exit';
  return (
    <button
      type="button"
      className={kind === 'entry' ? vtBtn.accent : vtBtn.small}
      disabled={busy}
      onClick={(e) => {
        e.stopPropagation();
        onAction(v, kind);
      }}
      aria-label={`${kind === 'entry' ? 'Registrar entrada' : 'Registrar salida'} de ${v.visitorName}`}
    >
      {busy ? '…' : kind === 'entry' ? 'Entrada' : 'Salida'}
    </button>
  );
}

function VisitCard({
  v,
  isToday,
  busy,
  onOpen,
  onAction,
}: {
  v: VisitListDTO;
  isToday: boolean;
  busy: boolean;
  onOpen: () => void;
  onAction: (v: VisitListDTO, kind: 'entry' | 'exit') => void;
}) {
  const m = VISIT_STATE_META[visitStateOf(v)];
  const a = visitActions(v);
  return (
    <article className="bg-white border border-[#e4e2dd] rounded-[10px] overflow-hidden" style={{ borderLeft: `3px solid ${m.color}` }}>
      <button type="button" onClick={onOpen} className="w-full text-left px-4 pt-3 pb-2.5 flex gap-3 items-start" aria-label={`Ver visita de ${v.visitorName}`}>
        <div className={`${dsMono} text-xs pt-0.5 w-[52px] shrink-0`}>
          {isToday ? formatWallTime(v.scheduledStartTime) || '—' : formatWallDay(v.scheduledDate)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold truncate">{v.visitorName}</div>
          <div className="text-[13px] text-[#4b4a46] truncate">
            {unitLabel(v.propertyUnitBlock, v.propertyUnitNumber)} · {v.visitTypeName}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <DsStatus label={m.label} color={m.color} />
            <InOut v={v} />
          </div>
        </div>
      </button>
      {(a.canEnter || a.canExit) && (
        <div className="px-4 pb-3">
          <button
            type="button"
            className={`${a.canEnter ? vtBtn.primary : vtBtn.secondary} w-full`}
            disabled={busy}
            onClick={() => onAction(v, a.canEnter ? 'entry' : 'exit')}
          >
            {busy ? 'Registrando…' : a.canEnter ? 'Registrar entrada' : 'Registrar salida'}
          </button>
        </div>
      )}
    </article>
  );
}
