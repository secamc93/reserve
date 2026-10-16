'use client';

/**
 * V1 · Visitas de hoy / V4 · móvil ("PH - Visitas y Paquetes").
 * Escritorio: pestañas Hoy · Dentro · Esperadas · Salieron · Semana · Todas con conteos,
 * "Escanear QR" y "+ Nueva visita"; tres tarjetas del día; tipo + buscador; tabla densa con una
 * acción por fila según el estado y ⋮ con el resto. Teléfono: título con conteos, buscador con QR,
 * chips, tarjetas con "Entrada" y "+ Visita no programada" fijo abajo.
 * Filtros y paginación en la URL.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DsBody,
  DsChips,
  DsEyebrow,
  DsPage,
  DsSearch,
  DsSectionHeader,
  VtDialog,
  VtIcon,
  VtMenu,
  VtNotice,
  dsMono,
  vtBtn,
  vtInput,
  vtLabel,
} from '@/shared/ui/ds';
import { Pagination, usePaginationParams } from '@shared/ui/pagination';
import { getVisitTypesAction, getVisitsAction, getVisitsSummaryAction, registerExitAction } from '../infrastructure/actions';
import type { Visit, VisitListDTO, VisitType, VisitsSummary } from '../domain';
import { DenseTable, type DenseColumn } from './dense-table';
import { EntryDialog } from './entry-dialog';
import { DEFAULT_GATE, VisitDetailPanel, parkingReservationHref } from './visit-detail-panel';
import { VisitFormModal } from './visit-form-modal';
import { useBusinessToken } from './use-business-token';
import { patchQuery, readVisitsFilters, visitsQueryFor, type VisitsTab } from './visits-filters';
import {
  EXCEEDS_COLOR,
  entryExitText,
  formatClock,
  formatDoc,
  formatDuration,
  formatWallDay,
  formatWallTime,
  todayInProperty,
  unitLabel,
  visitActions,
  visitStateOf,
  visitStatusDisplay,
} from './visit-state';

interface VisitsTableProps {
  businessId: number;
}

type Notice = { tone: 'ok' | 'error'; text: string } | null;

const FOOTER_LABEL: Record<VisitsTab, (n: number) => string> = {
  today: (n) => `${n} visitas hoy`,
  inside: (n) => `${n} dentro ahora`,
  expected: (n) => `${n} esperadas hoy`,
  left: (n) => `${n} salieron hoy`,
  week: (n) => `${n} visitas esta semana`,
  all: (n) => `${n} visitas`,
};

export function VisitsTable({ businessId }: VisitsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const getToken = useBusinessToken(businessId);
  const today = todayInProperty();
  // Clave de texto: los filtros solo cambian cuando cambia la URL, no en cada render
  const qsKey = searchParams?.toString() ?? '';
  const filters = useMemo(() => readVisitsFilters(new URLSearchParams(qsKey)), [qsKey]);
  const query = useMemo(() => visitsQueryFor(filters, today), [filters, today]);
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
  const [entryRow, setEntryRow] = useState<VisitListDTO | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [walkIn, setWalkIn] = useState(false);
  const [editTarget, setEditTarget] = useState<{ visit: Visit; visitorName: string; visitorDni: string } | undefined>();
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState('');
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
    try {
      const token = await getToken();
      setSummary(await getVisitsSummaryAction({ businessId, token, date: today }));
    } catch {
      setSummary(null);
    }
  }, [businessId, today, getToken]);

  useEffect(() => {
    loadList();
  }, [loadList]);
  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Tipos de visita para el filtro "Tipo"
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        setTypes((await getVisitTypesAction({ token })).filter((t) => t.isActive));
      } catch {
        /* el filtro por tipo queda vacío */
      }
    })();
  }, [getToken]);

  // Al recargar, el panel abierto toma la fila nueva (estado y horas al día)
  useEffect(() => {
    setSelected((cur) => (cur ? visits.find((v) => v.id === cur.id) ?? cur : cur));
  }, [visits]);

  const reload = useCallback(() => {
    loadList();
    loadSummary();
  }, [loadList, loadSummary]);

  const registerExit = async (v: VisitListDTO) => {
    setRowBusy(v.id);
    try {
      const token = await getToken();
      await registerExitAction({ businessId, visitId: v.id, data: { gate: v.entryGate || DEFAULT_GATE }, token });
      showNotice({ tone: 'ok', text: `Salida de ${v.visitorName} registrada · ${formatClock(new Date().toISOString())}` });
      reload();
    } catch (e) {
      showNotice({ tone: 'error', text: e instanceof Error ? e.message : 'No se pudo registrar la salida' });
    } finally {
      setRowBusy(null);
    }
  };

  const openNew = (unscheduled = false) => {
    setEditTarget(undefined);
    setWalkIn(unscheduled);
    setFormOpen(true);
  };

  const submitCode = () => {
    if (!code.trim()) return;
    navigate({ tab: 'all', q: code.trim() });
    setCodeOpen(false);
    setCode('');
  };

  const tabs: { id: VisitsTab; label: string; count?: number }[] = [
    { id: 'today', label: 'Hoy', count: summary?.total },
    { id: 'inside', label: 'Dentro', count: summary?.insideNow },
    { id: 'expected', label: 'Esperadas', count: summary?.expected },
    { id: 'left', label: 'Salieron', count: summary?.left },
    { id: 'week', label: 'Semana' },
    { id: 'all', label: 'Todas' },
  ];
  const showsDay = filters.tab === 'week' || filters.tab === 'all' || filters.tab === 'inside';

  const columns: DenseColumn<VisitListDTO>[] = [
    {
      key: 'visitor',
      label: 'Visitante',
      width: 'minmax(190px,1.4fr)',
      render: (v) => (
        <div className="min-w-0">
          <div className="font-medium truncate">{v.visitorName}</div>
          <div className={`${dsMono} text-[11px] text-[#8a8580] truncate`}>{[formatDoc(v.visitorDni), v.visitorVehiclePlate].filter(Boolean).join(' · ')}</div>
        </div>
      ),
    },
    { key: 'unit', label: 'Unidad', width: '100px', render: (v) => <span className={`${dsMono} text-xs`}>{unitLabel(v.propertyUnitBlock, v.propertyUnitNumber)}</span> },
    { key: 'type', label: 'Tipo', width: 'minmax(90px,.7fr)', render: (v) => <span className="text-[#4b4a46] truncate">{v.visitTypeName}</span> },
    { key: 'state', label: 'Estado', width: '120px', render: (v) => <StatusDot v={v} /> },
    {
      key: 'scheduled',
      label: 'Programada',
      width: showsDay ? '110px' : '80px',
      render: (v) => (
        <span className={`${dsMono} text-xs`}>{showsDay ? `${formatWallDay(v.scheduledDate)} ${formatWallTime(v.scheduledStartTime)}` : formatWallTime(v.scheduledStartTime) || '—'}</span>
      ),
    },
    {
      key: 'inout',
      label: 'Entrada / Salida',
      width: '150px',
      render: (v) => {
        const text = entryExitText(v);
        return text ? (
          <span className={`${dsMono} text-xs`} style={{ color: v.exceedsTime && !v.actualExitTime ? EXCEEDS_COLOR : undefined }}>
            {text}
          </span>
        ) : (
          <span className="text-[#c9c6c0]">—</span>
        );
      },
    },
    {
      key: 'action',
      label: <span className="sr-only">Acción</span>,
      width: '190px',
      align: 'right',
      render: (v) => {
        const state = visitStateOf(v);
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <RowAction v={v} busy={rowBusy === v.id} onEnter={() => setEntryRow(v)} onExit={() => registerExit(v)} onView={() => setSelected(v)} />
            <VtMenu
              label={`Más acciones de ${v.visitorName}`}
              items={[
                { label: 'Ver detalle', onSelect: () => setSelected(v) },
                ...(state === 'expected' || state === 'inside'
                  ? [{ label: 'Reservar parqueadero', onSelect: () => router.push(parkingReservationHref(businessId, v.id)) }]
                  : []),
              ]}
            />
          </div>
        );
      },
    },
  ];

  const insideNow = summary?.insideNow ?? 0;
  const expectedToday = summary?.expected ?? 0;
  const next = summary?.nextExpectedAt
    ? `próxima ${formatWallTime(summary.nextExpectedAt)} · ${unitLabel(summary.nextUnitBlock, summary.nextUnitNumber)}`
    : 'sin más por hoy';

  return (
    <DsPage>
      <div className="hidden md:block">
        <DsSectionHeader<VisitsTab>
          ariaLabel="Vistas de visitas"
          tabs={tabs}
          active={filters.tab}
          onChange={(tab) => navigate({ tab: tab === 'today' ? undefined : tab })}
          actions={
            <>
              <button type="button" className={vtBtn.secondary} onClick={() => setCodeOpen(true)}>
                <VtIcon name="qr" size={15} /> Escanear QR
              </button>
              <button type="button" className={vtBtn.primary} onClick={() => openNew(false)}>
                + Nueva visita
              </button>
            </>
          }
        />
      </div>

      {/* Teléfono (V4): título con conteos, buscador con QR y chips */}
      <div className="md:hidden px-4 pt-4 flex flex-col gap-3">
        <div>
          <h1 className="m-0 text-[22px] font-semibold tracking-[-.015em]">Visitas</h1>
          <div className={`${dsMono} text-xs text-[#8a8580]`}>
            {insideNow} dentro · {expectedToday} esperadas
          </div>
        </div>
        <div className="flex items-center h-11 rounded-lg border border-[#d6d3cd] bg-white pl-3 pr-1 gap-2 text-[#8a8580] focus-within:border-[#1a1a1a]">
          <VtIcon name="search" size={16} />
          <input
            type="search"
            aria-label="Buscar visita en el teléfono"
            placeholder="Nombre, documento, unidad, placa"
            className="flex-1 min-w-0 bg-transparent outline-none text-base text-[#1a1a1a]"
            value={searchDraft}
            onChange={(e) => onSearch(e.target.value)}
          />
          <button type="button" aria-label="Escanear código QR" onClick={() => setCodeOpen(true)} className="w-9 h-9 rounded-md bg-[#1a1a1a] text-white flex items-center justify-center">
            <VtIcon name="qr" size={16} />
          </button>
        </div>
        <DsChips<VisitsTab>
          ariaLabel="Estado de la visita (teléfono)"
          chips={[
            { id: 'expected', label: 'Esperadas', count: summary?.expected },
            { id: 'inside', label: 'Dentro', count: summary?.insideNow },
            { id: 'left', label: 'Salieron', count: summary?.left },
          ]}
          active={filters.tab}
          onChange={(tab) => navigate({ tab: tab === filters.tab ? undefined : tab })}
        />
      </div>

      <DsBody className="max-md:pb-32">
        {/* Tarjetas del día */}
        <div className="hidden md:grid grid-cols-3 gap-3">
          <Kpi
            label="Dentro ahora"
            value={insideNow}
            sub={summary && summary.exceeded > 0 ? `${summary.exceeded} excede${summary.exceeded > 1 ? 'n' : ''} su tiempo` : 'todos en su tiempo'}
            subColor={summary && summary.exceeded > 0 ? EXCEEDS_COLOR : undefined}
          />
          <Kpi label="Esperadas hoy" value={expectedToday} sub={next} />
          <Kpi label="Salieron hoy" value={summary?.left ?? 0} sub={summary?.avgStayMinutes != null ? `promedio ${formatDuration(summary.avgStayMinutes)}` : 'sin salidas aún'} />
        </div>

        {/* Filtros solo a la derecha */}
        <div className="hidden md:flex justify-end items-center gap-2">
          <select
            aria-label="Tipo de visita"
            className={`${vtInput} h-[30px]! text-xs w-[170px]`}
            value={filters.typeId ?? ''}
            onChange={(e) => navigate({ type: e.target.value || undefined })}
          >
            <option value="">Tipo: todos</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                Tipo: {t.name}
              </option>
            ))}
          </select>
          <DsSearch value={searchDraft} onChange={onSearch} placeholder="Nombre, documento, unidad, placa" className="md:w-60" ariaLabel="Buscar visita" />
        </div>

        {notice && <VtNotice tone={notice.tone}>{notice.text}</VtNotice>}

        <div className="hidden md:block">
          <DenseTable
            ariaLabel="Visitas"
            columns={columns}
            rows={visits}
            rowKey={(v) => v.id}
            loading={loading}
            onRowClick={setSelected}
            selectedKey={selected?.id ?? null}
            rowStyle={(v) => (v.exceedsTime && !v.actualExitTime ? { background: '#fdf4f1' } : undefined)}
            minWidth={980}
            empty={emptyText(filters.tab, filters.q)}
            footer={
              <div className="flex items-center justify-between gap-3">
                <span className={`${dsMono} text-[11px] text-[#8a8580] whitespace-nowrap`}>{FOOTER_LABEL[filters.tab](total)}</span>
                <Pagination total={total} totalPages={totalPages} className="border-t-0! bg-transparent! px-0! py-1!" />
              </div>
            }
          />
        </div>

        {/* Teléfono: tarjetas con la acción a mano */}
        <div className="md:hidden flex flex-col gap-2" aria-label="Visitas (lista)">
          {loading ? (
            <div className="py-10 text-center text-sm text-[#8a8580]">Cargando…</div>
          ) : visits.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#8a8580]">{emptyText(filters.tab, filters.q)}</div>
          ) : (
            visits.map((v) => (
              <VisitCard key={v.id} v={v} busy={rowBusy === v.id} onOpen={() => setSelected(v)} onEnter={() => setEntryRow(v)} onExit={() => registerExit(v)} />
            ))
          )}
          {totalPages > 1 && (
            <div className="rounded-[10px] overflow-hidden border border-[#e4e2dd]">
              <Pagination total={total} totalPages={totalPages} />
            </div>
          )}
        </div>
      </DsBody>

      {/* Teléfono: visita no programada, fija abajo (sobre la barra de navegación) */}
      <div className="md:hidden fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] px-4 z-30">
        <button type="button" className="w-full h-[52px] rounded-[10px] border-[1.5px] border-[#1a1a1a] bg-white text-[15px] font-semibold" onClick={() => openNew(true)}>
          + Visita no programada
        </button>
      </div>

      <VisitDetailPanel
        businessId={businessId}
        row={selected}
        onClose={() => setSelected(null)}
        onRequestEntry={(row) => setEntryRow(row)}
        onChanged={(text) => {
          showNotice({ tone: 'ok', text });
          reload();
        }}
        onEdit={(visit, row) => {
          setEditTarget({ visit, visitorName: row.visitorName, visitorDni: row.visitorDni });
          setWalkIn(false);
          setFormOpen(true);
        }}
      />

      <EntryDialog
        businessId={businessId}
        row={entryRow}
        onClose={() => setEntryRow(null)}
        onDone={(text) => {
          setEntryRow(null);
          showNotice({ tone: 'ok', text });
          reload();
        }}
      />

      <VisitFormModal
        open={formOpen}
        businessId={businessId}
        edit={editTarget}
        unscheduled={walkIn}
        onClose={() => setFormOpen(false)}
        onSaved={(text) => {
          setFormOpen(false);
          setEditTarget(undefined);
          showNotice({ tone: 'ok', text });
          reload();
        }}
      />

      <VtDialog
        open={codeOpen}
        onClose={() => setCodeOpen(false)}
        eyebrow="Escanear QR"
        title="Buscar por código"
        subtitle="Sin lector conectado: escribe el código de autorización o el del QR"
        footer={
          <>
            <button type="button" className={vtBtn.secondary} onClick={() => setCodeOpen(false)}>
              Cancelar
            </button>
            <button type="button" className={vtBtn.primary} disabled={!code.trim()} onClick={submitCode}>
              Buscar
            </button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitCode();
          }}
        >
          <label htmlFor="visit-code" className={vtLabel}>
            Código
          </label>
          <input id="visit-code" className={`${vtInput} ${dsMono}`} autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} placeholder="7K2M" />
        </form>
      </VtDialog>
    </DsPage>
  );
}

function emptyText(tab: VisitsTab, q: string): string {
  if (q) return `Ninguna visita coincide con “${q}”`;
  switch (tab) {
    case 'inside':
      return 'No hay visitantes dentro';
    case 'expected':
      return 'No hay más visitas esperadas hoy';
    case 'left':
      return 'Nadie ha salido hoy';
    case 'week':
      return 'No hay visitas esta semana';
    case 'all':
      return 'No hay visitas registradas';
    default:
      return 'No hay visitas programadas hoy';
  }
}

function Kpi({ label, value, sub, subColor }: { label: string; value: number; sub: string; subColor?: string }) {
  return (
    <section aria-label={label} className="bg-white border border-[#e4e2dd] rounded-[10px] px-[18px] py-3.5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <DsEyebrow>{label}</DsEyebrow>
        <div className="text-xs mt-1 truncate" style={{ color: subColor ?? '#8a8580' }}>
          {sub}
        </div>
      </div>
      <div className={`${dsMono} text-[30px] font-medium leading-none`}>{value}</div>
    </section>
  );
}

function StatusDot({ v }: { v: VisitListDTO }) {
  const s = visitStatusDisplay(v);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: s.color }}>
      <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

/** Una sola acción por fila según el estado: entrada (negro), salida (borde) o ver. */
function RowAction({ v, busy, onEnter, onExit, onView }: { v: VisitListDTO; busy: boolean; onEnter: () => void; onExit: () => void; onView: () => void }) {
  const a = visitActions(v);
  if (a.canEnter) {
    return (
      <button type="button" className={`${vtBtn.primary} h-[30px]! px-3! text-xs!`} disabled={busy} onClick={onEnter} aria-label={`Registrar entrada de ${v.visitorName}`}>
        Registrar entrada
      </button>
    );
  }
  if (a.canExit) {
    return (
      <button type="button" className={vtBtn.small} disabled={busy} onClick={onExit} aria-label={`Registrar salida de ${v.visitorName}`}>
        {busy ? 'Registrando…' : 'Registrar salida'}
      </button>
    );
  }
  return (
    <button type="button" className={vtBtn.small} onClick={onView} aria-label={`Ver visita de ${v.visitorName}`}>
      Ver
    </button>
  );
}

function VisitCard({ v, busy, onOpen, onEnter, onExit }: { v: VisitListDTO; busy: boolean; onOpen: () => void; onEnter: () => void; onExit: () => void }) {
  const a = visitActions(v);
  const s = visitStatusDisplay(v);
  const state = visitStateOf(v);
  return (
    <article className="bg-white border border-[#e4e2dd] rounded-[10px] px-4 py-3 flex items-center gap-3" style={s.exceeds ? { background: '#fdf4f1' } : undefined}>
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left" aria-label={`Ver visita de ${v.visitorName}`}>
        <div className="text-[15px] font-semibold truncate">{v.visitorName}</div>
        <div className="text-[13px] text-[#4b4a46] truncate">
          {[unitLabel(v.propertyUnitBlock, v.propertyUnitNumber), v.visitTypeName, formatWallTime(v.scheduledStartTime)].filter(Boolean).join(' · ')}
        </div>
        {state !== 'expected' && (
          <div className={`${dsMono} text-[11px] mt-0.5`} style={{ color: s.color }}>
            {s.label}
            {v.actualEntryTime ? ` · ${entryExitText(v)}` : ''}
          </div>
        )}
      </button>
      {a.canEnter && (
        <button type="button" className={`${vtBtn.primary} h-11! px-4!`} disabled={busy} onClick={onEnter} aria-label={`Registrar entrada de ${v.visitorName}`}>
          Entrada
        </button>
      )}
      {a.canExit && (
        <button type="button" className={`${vtBtn.secondary} h-11! px-4!`} disabled={busy} onClick={onExit} aria-label={`Registrar salida de ${v.visitorName}`}>
          Salida
        </button>
      )}
    </article>
  );
}
