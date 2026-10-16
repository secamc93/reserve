/**
 * R1 · Residentes (Patrón A · Lista): cabecera secundaria con pestañas por estado (Todos,
 * Activos, Inactivos) y acciones (Edición masiva, Importar Excel, Nuevo residente); chips por
 * tipo (ids reales del catálogo), buscador por nombre / unidad / documento, filtro de
 * principales, tabla densa y paginación en la URL. Clic en una fila → R3 (panel lateral).
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TokenStorage } from '@shared/config';
import {
  DS,
  DsBody,
  DsChips,
  DsPage,
  DsSearch,
  DsSectionHeader,
  DsStatus,
  DsTable,
  DsTag,
  DsToolbar,
  VtMenu,
  VtNotice,
  dsMono,
  vtBtn,
  type DsColumn,
} from '@shared/ui/ds';
import { Pagination, usePaginationParams } from '@shared/ui/pagination';
import { deleteResidentAction, getResidentsAction, getResidentsSummaryAction } from '../infrastructure/actions';
import type { Resident, ResidentsSummary } from '../domain';
import {
  ALL_TYPES,
  RESIDENT_SEARCH_FIELDS,
  buildResidentTypeChips,
  parseSearchField,
  parseStatusFilter,
  residentTypeOptions,
  resolveResidentSearch,
  statusToIsActive,
  type ResidentStatusFilter,
} from '../domain';
import { formatUnitLabel } from '../../units/domain';
import { DsConfirmDialog, dsSelect, useDebouncedValue, useUrlFilters } from '../../units/ui/kit';
import { CreateResidentModal } from './create-resident-modal';
import { EditResidentModal } from './edit-resident-modal';
import { ImportResidentsModal } from './import-residents-modal';
import { BulkEditResidentsModal } from './bulk-edit-residents-modal';
import { ResidentDetailPanel } from './resident-detail-panel';

/** Filtros en la URL: estado (pestaña), tipo, campo y texto de búsqueda, principales. */
const FILTER_KEYS = ['estado', 'tipo', 'campo', 'q', 'principal'] as const;

export function ResidentsTable({ businessId }: { businessId: number }) {
  const { page, pageSize } = usePaginationParams();
  const { values, setFilters } = useUrlFilters(FILTER_KEYS);
  const status = parseStatusFilter(values.estado);
  const field = parseSearchField(values.campo);
  const typeId = values.tipo && Number.isFinite(Number(values.tipo)) ? Number(values.tipo) : undefined;
  const onlyMain = values.principal === 'si' ? true : values.principal === 'no' ? false : undefined;
  const [search, setSearch] = useDebouncedValue(values.q, (q) => setFilters({ q }));

  const [residents, setResidents] = useState<Resident[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ResidentsSummary | null>(null);
  const [notice, setNotice] = useState<{ tone: 'error' | 'ok'; text: string } | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
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
        residentTypeId: typeId,
        isActive: statusToIsActive(status),
        isMainResident: onlyMain,
        ...resolveResidentSearch(field, values.q),
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
  }, [businessId, page, pageSize, typeId, status, onlyMain, field, values.q]);

  const loadSummary = useCallback(async () => {
    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) return;
      setSummary(await getResidentsSummaryAction({ businessId, token }));
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
  const hasFilters = Boolean(values.q || values.tipo || values.principal);
  const searchMeta = RESIDENT_SEARCH_FIELDS.find((f) => f.id === field) ?? RESIDENT_SEARCH_FIELDS[0];

  const columns: DsColumn<Resident>[] = [
    {
      key: 'name',
      label: 'Residente',
      width: 'minmax(180px,1.6fr)',
      render: (r) => (
        <div className="min-w-0">
          <div className="font-semibold truncate">{r.name}</div>
          {r.email && <div className="text-[11px] text-[#8a8580] truncate">{r.email}</div>}
        </div>
      ),
    },
    { key: 'unit', label: 'Unidad', width: 'minmax(100px,.8fr)', render: (r) => <span className="truncate">{unitOf(r)}</span> },
    { key: 'type', label: 'Tipo', width: '120px', render: (r) => (r.residentTypeName ? <DsTag>{r.residentTypeName}</DsTag> : <span>—</span>) },
    { key: 'dni', label: 'Documento', width: '120px', render: (r) => <span className={`${dsMono} text-xs truncate`}>{r.dni || '—'}</span> },
    { key: 'phone', label: 'Teléfono', width: '120px', render: (r) => <span className={`${dsMono} text-xs truncate`}>{r.phone || '—'}</span> },
    { key: 'main', label: 'Principal', width: '84px', render: (r) => (r.isMainResident ? <DsTag strong>Principal</DsTag> : <span className="text-[#8a8580]">—</span>) },
    { key: 'status', label: 'Estado', width: '84px', render: (r) => <DsStatus label={r.isActive ? 'Activo' : 'Inactivo'} color={r.isActive ? DS.yes : DS.muted} /> },
    {
      key: 'actions',
      label: '',
      width: '40px',
      align: 'right',
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <VtMenu
            label={`Acciones de ${r.name}`}
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

  return (
    <DsPage>
      <DsSectionHeader<ResidentStatusFilter>
        ariaLabel="Estado de los residentes"
        tabs={[
          { id: 'todos', label: 'Todos', count: summary?.total ?? null },
          { id: 'activos', label: 'Activos', count: summary?.active ?? null },
          { id: 'inactivos', label: 'Inactivos', count: summary?.inactive ?? null },
        ]}
        active={status}
        onChange={(id) => setFilters({ estado: id === 'todos' ? null : id })}
        actions={
          <>
            <button type="button" className={vtBtn.secondary} onClick={() => setShowBulk(true)}>Edición masiva</button>
            <button type="button" className={vtBtn.secondary} onClick={() => setShowImport(true)}>Importar Excel</button>
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

        <DsToolbar
          left={
            <DsChips
              ariaLabel="Filtrar por tipo"
              chips={buildResidentTypeChips(summary)}
              active={values.tipo || ALL_TYPES}
              onChange={(id) => setFilters({ tipo: id === ALL_TYPES ? null : id })}
            />
          }
          right={
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select aria-label="Principal" className={dsSelect} value={values.principal} onChange={(e) => setFilters({ principal: e.target.value })}>
                <option value="">Principales y no</option>
                <option value="si">Solo principales</option>
                <option value="no">No principales</option>
              </select>
              <select aria-label="Buscar por" className={dsSelect} value={field} onChange={(e) => setFilters({ campo: e.target.value === 'name' ? null : e.target.value })}>
                {RESIDENT_SEARCH_FIELDS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
              <DsSearch value={search} onChange={setSearch} placeholder={searchMeta.placeholder} ariaLabel={searchMeta.placeholder} className="md:w-56" />
            </div>
          }
        />

        <DsTable
          ariaLabel="Residentes"
          columns={columns}
          rows={residents}
          rowKey={(r) => r.id}
          onRowClick={(r) => setViewing(r)}
          selectedKey={viewing?.id ?? null}
          loading={loading}
          minWidth={960}
          empty={
            hasFilters ? (
              <span>
                Ningún residente coincide con los filtros.{' '}
                <button type="button" className="underline text-[#1a1a1a]" onClick={() => setFilters({ q: null, tipo: null, principal: null })}>
                  Limpiar filtros
                </button>
              </span>
            ) : status === 'inactivos' ? (
              'No hay residentes inactivos.'
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
        onDelete={askDelete}
      />

      {showCreate && (
        <CreateResidentModal
          businessId={businessId}
          types={types}
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            setNotice({ tone: 'ok', text: 'Residente agregado' });
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
            setViewing(null);
            setNotice({ tone: 'ok', text: 'Residente actualizado' });
            refresh();
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
      <BulkEditResidentsModal isOpen={showBulk} onClose={() => setShowBulk(false)} onSuccess={refresh} businessId={businessId} />
    </DsPage>
  );
}
