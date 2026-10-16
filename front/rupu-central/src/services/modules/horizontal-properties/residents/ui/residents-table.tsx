/**
 * R1 · Residentes (Patrón A · Lista): cabecera secundaria con pestañas Todos, una por tipo
 * (ids reales del catálogo), Sin correo e Inactivos, y acciones Importar · Edición masiva ·
 * Nuevo residente; selector de torre y buscador "Nombre, documento, unidad"; tabla densa
 * (residente con avatar y documento, unidad, tipo, contacto, desde, estado) y paginación en
 * la URL. Clic en una fila → R4 (panel lateral de detalle).
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TokenStorage } from '@shared/config';
import {
  DS,
  DsBody,
  DsPage,
  DsSearch,
  DsSectionHeader,
  DsStatus,
  DsTable,
  VtMenu,
  VtNotice,
  dsMono,
  vtBtn,
  type DsColumn,
} from '@shared/ui/ds';
import { Pagination, usePaginationParams } from '@shared/ui/pagination';
import { deleteResidentAction, getResidentsAction, getResidentsSummaryAction } from '../infrastructure/actions';
import type { Resident, ResidentsSummary } from '../domain';
import { RESIDENT_TAB_ALL, buildResidentTabs, formatMonthYear, residentTabToFilters, residentTypeOptions } from '../domain';
import { getPropertyUnitsSummaryAction } from '../../units/infrastructure/actions';
import { formatUnitLabel } from '../../units/domain';
import { DsAvatar, DsConfirmDialog, dsSelect, useDebouncedValue, useUrlFilters } from '../../units/ui/kit';
import { CreateResidentModal } from './create-resident-modal';
import { EditResidentModal } from './edit-resident-modal';
import { ImportResidentsModal } from './import-residents-modal';
import { BulkEditResidentsModal } from './bulk-edit-residents-modal';
import { BulkEditResidentsDialog } from './bulk-edit-residents-dialog';
import { ResidentDetailPanel } from './resident-detail-panel';

/** Filtros en la URL: pestaña, torre/bloque y búsqueda. */
const FILTER_KEYS = ['pestana', 'torre', 'q'] as const;

export function ResidentsTable({ businessId }: { businessId: number }) {
  const { page, pageSize } = usePaginationParams();
  const { values, setFilters } = useUrlFilters(FILTER_KEYS);
  const tab = values.pestana || RESIDENT_TAB_ALL;
  const tabFilters = useMemo(() => residentTabToFilters(tab), [tab]);
  const [search, setSearch] = useDebouncedValue(values.q, (q) => setFilters({ q }));

  const [residents, setResidents] = useState<Resident[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ResidentsSummary | null>(null);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [notice, setNotice] = useState<{ tone: 'error' | 'ok'; text: string } | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [showBulkExcel, setShowBulkExcel] = useState(false);
  const [editing, setEditing] = useState<Resident | null>(null);
  const [viewing, setViewing] = useState<Resident | null>(null);
  const [toDelete, setToDelete] = useState<Resident | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const requestRef = useRef(0);
  const types = useMemo(() => residentTypeOptions(summary?.types), [summary]);

  const loadResidents = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) throw new Error('token');
      const data = await getResidentsAction({
        businessId,
        token,
        page,
        pageSize,
        query: values.q.trim() || undefined,
        block: values.torre || undefined,
        ...tabFilters,
      });
      if (requestId !== requestRef.current) return;
      setResidents(data.residents);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      if (requestId !== requestRef.current) return;
      setNotice({ tone: 'error', text: 'No se pudieron cargar los residentes' });
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [businessId, page, pageSize, values.q, values.torre, tabFilters]);

  const loadSummary = useCallback(async () => {
    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) return;
      const [res, units] = await Promise.allSettled([
        getResidentsSummaryAction({ businessId, token }),
        getPropertyUnitsSummaryAction({ businessId, token }),
      ]);
      setSummary(res.status === 'fulfilled' ? res.value : null);
      if (units.status === 'fulfilled') {
        setBlocks(
          [...units.value.blocks]
            .filter((b) => b.block.trim() !== '')
            .sort((a, b) => b.total - a.total)
            .map((b) => b.block),
        );
      }
    } catch {
      setSummary(null);
    }
  }, [businessId]);

  useEffect(() => {
    loadResidents();
  }, [loadResidents]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const refresh = useCallback(() => {
    loadResidents();
    loadSummary();
  }, [loadResidents, loadSummary]);

  const askDelete = (r: Resident) => {
    setDeleteError(null);
    setToDelete(r);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) throw new Error('token');
      await deleteResidentAction({ businessId, residentId: toDelete.id, token });
      setNotice({ tone: 'ok', text: `${toDelete.name} eliminado` });
      if (viewing?.id === toDelete.id) setViewing(null);
      setToDelete(null);
      refresh();
    } catch {
      setDeleteError('No se pudo eliminar el residente');
    } finally {
      setDeleting(false);
    }
  };

  const unitOf = (r: Resident) => (r.propertyUnitNumber ? formatUnitLabel(r.propertyUnitNumber, r.propertyUnitBlock) : 'Sin unidad');

  const columns: DsColumn<Resident>[] = [
    {
      key: 'name',
      label: 'Residente',
      width: 'minmax(220px,1.8fr)',
      render: (r) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <DsAvatar name={r.name} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-medium truncate">{r.name}</span>
              {r.isMainResident && <span className="px-1.5 py-0.5 rounded bg-[#1a1a1a] text-white text-[9px] font-semibold tracking-[.06em] shrink-0">PRINCIPAL</span>}
            </div>
            <div className={`${dsMono} text-[11px] text-[#8a8580] truncate`}>{r.dni || '—'}</div>
          </div>
        </div>
      ),
    },
    { key: 'unit', label: 'Unidad', width: '100px', render: (r) => <span className={`${dsMono} text-xs font-medium truncate`}>{unitOf(r)}</span> },
    { key: 'type', label: 'Tipo', width: '110px', render: (r) => <span className="text-[#4b4a46] truncate">{r.residentTypeName || '—'}</span> },
    {
      key: 'contact',
      label: 'Contacto',
      width: 'minmax(170px,1.3fr)',
      render: (r) => (
        <div className="min-w-0">
          {r.email ? (
            <div className="text-xs truncate">{r.email}</div>
          ) : (
            <div className="text-xs font-medium" style={{ color: DS.accent }}>sin correo</div>
          )}
          <div className={`${dsMono} text-[11px] text-[#8a8580] truncate`}>{r.phone || '—'}</div>
        </div>
      ),
    },
    { key: 'since', label: 'Desde', width: '80px', render: (r) => <span className={`${dsMono} text-xs`}>{formatMonthYear(r.since) || '—'}</span> },
    { key: 'status', label: 'Estado', width: '84px', render: (r) => <DsStatus label={r.isActive ? 'Activo' : 'Inactivo'} color={r.isActive ? DS.yes : DS.muted} /> },
    {
      key: 'actions',
      label: '',
      width: '32px',
      align: 'right',
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <VtMenu
            label={`Acciones de ${r.name}`}
            size={28}
            items={[
              { label: 'Ver detalle', onSelect: () => setViewing(r) },
              { label: 'Editar', onSelect: () => setEditing(r) },
              { label: 'Eliminar', danger: true, onSelect: () => askDelete(r) },
            ]}
          />
        </div>
      ),
    },
  ];

  const hasFilters = Boolean(values.q || values.torre || tab !== RESIDENT_TAB_ALL);

  return (
    <DsPage>
      <DsSectionHeader<string>
        ariaLabel="Residentes por tipo"
        tabs={buildResidentTabs(summary)}
        active={tab}
        onChange={(id) => setFilters({ pestana: id === RESIDENT_TAB_ALL ? null : id })}
        actions={
          <>
            <button type="button" className={vtBtn.secondary} onClick={() => setShowImport(true)}>Importar Excel</button>
            <button type="button" className={vtBtn.secondary} onClick={() => setShowBulk(true)}>Edición masiva</button>
            <button type="button" className={vtBtn.primary} onClick={() => setShowCreate(true)}>+ Nuevo residente</button>
          </>
        }
      />
      <DsBody>
        {notice && (
          <div onClick={() => setNotice(null)}>
            <VtNotice tone={notice.tone}>{notice.text}</VtNotice>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2">
          <select aria-label="Torre" className={dsSelect} value={values.torre} onChange={(e) => setFilters({ torre: e.target.value })}>
            <option value="">Torre: todas</option>
            {blocks.map((b) => (
              <option key={b} value={b}>{`Torre: ${b}`}</option>
            ))}
          </select>
          <DsSearch value={search} onChange={setSearch} placeholder="Nombre, documento, unidad" ariaLabel="Buscar por nombre, documento o unidad" className="md:w-[240px]" />
        </div>

        <DsTable
          ariaLabel="Residentes"
          columns={columns}
          rows={residents}
          rowKey={(r) => r.id}
          onRowClick={(r) => setViewing(r)}
          selectedKey={viewing?.id ?? null}
          loading={loading}
          minWidth={900}
          empty={
            hasFilters ? (
              <span>
                Ningún residente coincide.{' '}
                <button type="button" className="underline text-[#1a1a1a]" onClick={() => setFilters({ q: null, torre: null, pestana: null })}>
                  Ver todos
                </button>
              </span>
            ) : (
              'Aún no hay residentes. Agrégalos uno a uno o impórtalos desde Excel.'
            )
          }
          footer={<Pagination total={total} totalPages={totalPages} disabled={loading} className="border-t-0! bg-transparent! px-0!" />}
        />
      </DsBody>

      <ResidentDetailPanel
        businessId={businessId}
        resident={viewing}
        onClose={() => setViewing(null)}
        onEdit={(r) => {
          setViewing(null);
          setEditing(r);
        }}
      />

      {showCreate && (
        <CreateResidentModal
          businessId={businessId}
          types={types}
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            setNotice({ tone: 'ok', text: 'Residente creado' });
            refresh();
          }}
        />
      )}

      {editing && (
        <EditResidentModal
          businessId={businessId}
          resident={editing}
          types={types}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            setNotice({ tone: 'ok', text: 'Residente actualizado' });
            refresh();
          }}
        />
      )}

      {showBulk && (
        <BulkEditResidentsDialog
          businessId={businessId}
          blocks={blocks}
          initialBlock={values.torre || blocks[0]}
          onClose={() => setShowBulk(false)}
          onSuccess={refresh}
          onOpenExcel={() => {
            setShowBulk(false);
            setShowBulkExcel(true);
          }}
        />
      )}

      <DsConfirmDialog
        open={Boolean(toDelete)}
        title={toDelete ? `¿Eliminar a ${toDelete.name}?` : ''}
        message="Esta acción no se puede deshacer."
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onClose={() => !deleting && setToDelete(null)}
      />

      <ImportResidentsModal isOpen={showImport} onClose={() => setShowImport(false)} onSuccess={refresh} businessId={businessId} />
      <BulkEditResidentsModal isOpen={showBulkExcel} onClose={() => setShowBulkExcel(false)} onSuccess={refresh} businessId={businessId} />
    </DsPage>
  );
}
