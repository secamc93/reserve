/**
 * U1 · Unidades (Patrón A · Lista): cabecera secundaria con pestañas "Unidades" y
 * "Por bloque" y acciones (Importar Excel, Nueva unidad); cifras de resumen (unidades,
 * activas, con residentes, suma de coeficientes); chips por bloque (Casa, Dúplex, Local…),
 * buscador por número, filtros de tipo/piso/estado, tabla densa y paginación en la URL.
 * "Por bloque" agrupa las unidades por bloque/torre con su suma de coeficientes.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  VtMenu,
  VtNotice,
  dsMono,
  vtBtn,
  type DsColumn,
} from '@shared/ui/ds';
import { Pagination, usePaginationParams } from '@shared/ui/pagination';
import { deletePropertyUnitAction, getPropertyUnitsAction, getPropertyUnitsSummaryAction } from '../infrastructure/actions';
import {
  ALL_BLOCKS,
  PropertyUnit,
  PropertyUnitsSummary,
  UNIT_TYPE_LABELS,
  buildBlockChips,
  formatCoefficient,
  formatOccupancy,
  formatUnitLabel,
} from '../domain';
import { getUnitsBusinessToken } from './business-token';
import { CreatePropertyUnitModal } from './create-property-unit-modal';
import { EditPropertyUnitModal } from './edit-property-unit-modal';
import { ImportUnitsModal } from './import-units-modal';
import { UnitsByBlock } from './units-by-block';
import { UnitsSummaryStats } from './units-summary-stats';
import { DsConfirmDialog, dsSelect, useDebouncedValue, useUrlFilters } from './kit';

/** Filtros en la URL: vista (lista | bloques), bloque, búsqueda, tipo, piso y estado. */
const FILTER_KEYS = ['vista', 'bloque', 'q', 'tipo', 'piso', 'estado'] as const;

type View = 'list' | 'blocks';

export function PropertyUnitsTable({ businessId }: { businessId: number }) {
  const { page, pageSize } = usePaginationParams();
  const { values, setFilters } = useUrlFilters(FILTER_KEYS);
  const view: View = values.vista === 'bloques' ? 'blocks' : 'list';
  const floor = values.piso.trim() !== '' && Number.isFinite(Number(values.piso)) ? Number(values.piso) : undefined;
  const isActive = values.estado === 'activas' ? true : values.estado === 'inactivas' ? false : undefined;

  const [search, setSearch] = useDebouncedValue(values.q, (q) => setFilters({ q }));
  const [floorDraft, setFloorDraft] = useDebouncedValue(values.piso, (piso) => setFilters({ piso }));

  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PropertyUnitsSummary | null>(null);
  const [notice, setNotice] = useState<{ tone: 'error' | 'ok'; text: string } | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState<PropertyUnit | null>(null);
  const [toDelete, setToDelete] = useState<PropertyUnit | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const requestRef = useRef(0);

  const loadUnits = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    try {
      const token = await getUnitsBusinessToken(businessId);
      const data = await getPropertyUnitsAction({
        businessId,
        token,
        page,
        pageSize,
        number: values.q.trim() || undefined,
        block: values.bloque || undefined,
        unitType: values.tipo || undefined,
        floor,
        isActive,
      });
      if (requestId !== requestRef.current) return;
      setUnits(data.units);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      if (requestId !== requestRef.current) return;
      setNotice({ tone: 'error', text: 'No se pudieron cargar las unidades' });
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [businessId, page, pageSize, values.q, values.bloque, values.tipo, floor, isActive]);

  const loadSummary = useCallback(async () => {
    try {
      const token = await getUnitsBusinessToken(businessId);
      setSummary(await getPropertyUnitsSummaryAction({ businessId, token }));
    } catch {
      setSummary(null);
    }
  }, [businessId]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const refresh = useCallback(() => {
    loadUnits();
    loadSummary();
  }, [loadUnits, loadSummary]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const token = await getUnitsBusinessToken(businessId);
      await deletePropertyUnitAction({ businessId, unitId: toDelete.id, token });
      setNotice({ tone: 'ok', text: `${formatUnitLabel(toDelete.number, toDelete.block)} eliminada` });
      setToDelete(null);
      refresh();
    } catch (err) {
      setDeleteError(err instanceof Error && err.message ? err.message : 'No se pudo eliminar la unidad');
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = Boolean(values.q || values.bloque || values.tipo || values.piso || values.estado);

  const columns: DsColumn<PropertyUnit>[] = [
    {
      key: 'unit',
      label: 'Unidad',
      width: 'minmax(120px,1.1fr)',
      render: (u) => <span className="font-semibold truncate">{formatUnitLabel(u.number, u.block)}</span>,
    },
    { key: 'type', label: 'Tipo', width: '120px', render: (u) => <span className="text-[#4b4a46]">{UNIT_TYPE_LABELS[u.unitType] || u.unitType}</span> },
    { key: 'floor', label: 'Piso', width: '56px', align: 'right', render: (u) => <span className={`${dsMono} text-xs`}>{u.floor ?? '—'}</span> },
    { key: 'area', label: 'Área m²', width: '80px', align: 'right', render: (u) => <span className={`${dsMono} text-xs`}>{u.area ?? '—'}</span> },
    {
      key: 'coef',
      label: 'Coeficiente',
      width: '100px',
      align: 'right',
      render: (u) => <span className={`${dsMono} text-xs font-medium`}>{formatCoefficient(u.coefficient)}</span>,
    },
    {
      key: 'residents',
      label: 'Residentes',
      width: 'minmax(150px,1.4fr)',
      render: (u) => (
        <span className={`truncate ${u.residentsCount ? '' : 'text-[#8a8580]'}`} title={u.mainResidentName}>
          {formatOccupancy(u.residentsCount, u.mainResidentName)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      width: '88px',
      render: (u) => <DsStatus label={u.isActive ? 'Activa' : 'Inactiva'} color={u.isActive ? DS.yes : DS.muted} />,
    },
    {
      key: 'actions',
      label: '',
      width: '40px',
      align: 'right',
      render: (u) => (
        <div onClick={(e) => e.stopPropagation()}>
          <VtMenu
            label={`Acciones de ${formatUnitLabel(u.number, u.block)}`}
            items={[
              { label: 'Editar', onSelect: () => setEditing(u) },
              { label: 'Eliminar', danger: true, onSelect: () => { setDeleteError(null); setToDelete(u); } },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <DsPage>
      <DsSectionHeader<View>
        ariaLabel="Vistas de unidades"
        tabs={[
          { id: 'list', label: 'Unidades', count: summary?.total ?? null },
          { id: 'blocks', label: 'Por bloque', count: summary ? summary.blocks.length : null },
        ]}
        active={view}
        onChange={(id) => setFilters({ vista: id === 'blocks' ? 'bloques' : null })}
        actions={
          <>
            <button type="button" className={vtBtn.secondary} onClick={() => setShowImport(true)}>Importar Excel</button>
            <button type="button" className={vtBtn.primary} onClick={() => setShowCreate(true)}>+ Nueva unidad</button>
          </>
        }
      />
      <DsBody>
        {notice && (
          <div onClick={() => setNotice(null)}>
            <VtNotice tone={notice.tone}>{notice.text}</VtNotice>
          </div>
        )}

        <UnitsSummaryStats summary={summary} />

        {view === 'blocks' ? (
          <UnitsByBlock
            summary={summary}
            onSelectBlock={(block) => setFilters({ vista: null, bloque: block })}
          />
        ) : (
          <>
            <DsToolbar
              left={
                <DsChips
                  ariaLabel="Filtrar por bloque"
                  chips={buildBlockChips(summary)}
                  active={values.bloque || ALL_BLOCKS}
                  onChange={(id) => setFilters({ bloque: id === ALL_BLOCKS ? null : id })}
                />
              }
              right={
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <select aria-label="Tipo de unidad" className={dsSelect} value={values.tipo} onChange={(e) => setFilters({ tipo: e.target.value })}>
                    <option value="">Todos los tipos</option>
                    {Object.entries(UNIT_TYPE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                  <input
                    aria-label="Piso"
                    placeholder="Piso"
                    inputMode="numeric"
                    className={`${dsSelect} w-16`}
                    value={floorDraft}
                    onChange={(e) => setFloorDraft(e.target.value)}
                  />
                  <select aria-label="Estado" className={dsSelect} value={values.estado} onChange={(e) => setFilters({ estado: e.target.value })}>
                    <option value="">Todas</option>
                    <option value="activas">Activas</option>
                    <option value="inactivas">Inactivas</option>
                  </select>
                  <DsSearch value={search} onChange={setSearch} placeholder="Buscar por número" ariaLabel="Buscar unidad por número" className="md:w-48" />
                </div>
              }
            />

            <DsTable
              ariaLabel="Unidades"
              columns={columns}
              rows={units}
              rowKey={(u) => u.id}
              onRowClick={(u) => setEditing(u)}
              loading={loading}
              minWidth={900}
              empty={
                hasFilters ? (
                  <span>
                    Ninguna unidad coincide con los filtros.{' '}
                    <button
                      type="button"
                      className="underline text-[#1a1a1a]"
                      onClick={() => setFilters({ q: null, bloque: null, tipo: null, piso: null, estado: null })}
                    >
                      Limpiar filtros
                    </button>
                  </span>
                ) : (
                  'Aún no hay unidades. Créalas una a una o impórtalas desde Excel.'
                )
              }
              footer={<Pagination total={total} totalPages={totalPages} disabled={loading} className="border-t-0! bg-transparent! px-0!" />}
            />
          </>
        )}
      </DsBody>

      {showCreate && (
        <CreatePropertyUnitModal
          businessId={businessId}
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            setNotice({ tone: 'ok', text: 'Unidad creada' });
            refresh();
          }}
        />
      )}

      {editing && (
        <EditPropertyUnitModal
          businessId={businessId}
          unit={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null);
            setNotice({ tone: 'ok', text: 'Unidad actualizada' });
            refresh();
          }}
        />
      )}

      <DsConfirmDialog
        open={Boolean(toDelete)}
        title={toDelete ? `¿Eliminar ${formatUnitLabel(toDelete.number, toDelete.block)}?` : ''}
        message="Esta acción no se puede deshacer. Una unidad con residentes registrados no se puede eliminar."
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onClose={() => !deleting && setToDelete(null)}
      />

      <ImportUnitsModal isOpen={showImport} onClose={() => setShowImport(false)} onSuccess={refresh} businessId={businessId} />
    </DsPage>
  );
}
