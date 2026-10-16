/**
 * U1 · Unidades por torre/bloque, coeficiente acumulado (Patrón A · Lista).
 * Cabecera secundaria con pestañas "Todas", una por bloque con su conteo, "Sin residente"
 * (y "Locales" / "Inactivas" si aplican) y acciones Importar · Exportar · Nueva unidad;
 * buscador "Número o residente"; tabla densa agrupada por bloque con el coeficiente
 * acumulado del bloque y paginación en la URL.
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DS, DsBody, DsPage, DsSearch, DsSectionHeader, VtIcon, VtNotice, dsMono, vtBtn, type DsColumn } from '@shared/ui/ds';
import { Pagination, usePaginationParams } from '@shared/ui/pagination';
import { fetchAllPages } from '@shared/utils/pagination';
import { deletePropertyUnitAction, getPropertyUnitsAction, getPropertyUnitsSummaryAction } from '../infrastructure/actions';
import {
  PropertyUnit,
  PropertyUnitsSummary,
  UNIT_TAB_ALL,
  blockLabel,
  blockTotals,
  buildUnitTabs,
  formatArea,
  formatCoefficient,
  formatCoefficientPct,
  formatOccupancy,
  formatRoomsBaths,
  formatUnitLabel,
  groupUnitsByBlock,
  unitTabToFilters,
  unitTypeLabel,
  unitsToCsv,
  type GetPropertyUnitsParams,
} from '../domain';
import { getUnitsBusinessToken } from './business-token';
import { CreatePropertyUnitModal } from './create-property-unit-modal';
import { EditPropertyUnitModal } from './edit-property-unit-modal';
import { ImportUnitsModal } from './import-units-modal';
import { DsConfirmDialog, DsGroupedTable, useDebouncedValue, useUrlFilters } from './kit';

/** Filtros en la URL: pestaña (bloque, sin residente…) y búsqueda. */
const FILTER_KEYS = ['pestana', 'q'] as const;

export function PropertyUnitsTable({ businessId }: { businessId: number }) {
  const { page, pageSize } = usePaginationParams();
  const { values, setFilters } = useUrlFilters(FILTER_KEYS);
  const tab = values.pestana || UNIT_TAB_ALL;
  const tabFilters = useMemo(() => unitTabToFilters(tab), [tab]);
  const [search, setSearch] = useDebouncedValue(values.q, (q) => setFilters({ q }));

  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [summary, setSummary] = useState<PropertyUnitsSummary | null>(null);
  const [notice, setNotice] = useState<{ tone: 'error' | 'ok'; text: string } | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState<PropertyUnit | null>(null);
  const [toDelete, setToDelete] = useState<PropertyUnit | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const requestRef = useRef(0);

  const listParams = useCallback(
    (token: string): GetPropertyUnitsParams => ({
      businessId,
      token,
      query: values.q.trim() || undefined,
      groupByBlock: true,
      ...tabFilters,
    }),
    [businessId, values.q, tabFilters],
  );

  const loadUnits = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    try {
      const token = await getUnitsBusinessToken(businessId);
      const data = await getPropertyUnitsAction({ ...listParams(token), page, pageSize });
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
  }, [businessId, listParams, page, pageSize]);

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

  const exportCsv = async () => {
    setExporting(true);
    try {
      const token = await getUnitsBusinessToken(businessId);
      const all = await fetchAllPages((p, size) =>
        getPropertyUnitsAction({ ...listParams(token), page: p, pageSize: size }).then((r) => ({ items: r.units, total: r.total, totalPages: r.totalPages })),
      );
      const blob = new Blob([unitsToCsv(all)], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unidades-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setNotice({ tone: 'error', text: 'No se pudo exportar las unidades' });
    } finally {
      setExporting(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const token = await getUnitsBusinessToken(businessId);
      await deletePropertyUnitAction({ businessId, unitId: toDelete.id, token });
      setNotice({ tone: 'ok', text: `${formatUnitLabel(toDelete.number, toDelete.block)} eliminada` });
      setToDelete(null);
      setEditing(null);
      refresh();
    } catch (err) {
      setDeleteError(err instanceof Error && err.message ? err.message : 'No se pudo eliminar la unidad');
    } finally {
      setDeleting(false);
    }
  };

  const tabs = buildUnitTabs(summary);
  const blocks = (summary?.blocks ?? []).map((b) => b.block).filter((b) => b.trim() !== '');

  const columns: DsColumn<PropertyUnit>[] = [
    {
      key: 'unit',
      label: 'Unidad',
      width: 'minmax(110px,1fr)',
      render: (u) => <span className={`${dsMono} font-semibold truncate`}>{formatUnitLabel(u.number, u.block)}</span>,
    },
    { key: 'type', label: 'Tipo', width: '110px', render: (u) => <span className="text-[#4b4a46] truncate">{unitTypeLabel(u.unitType)}</span> },
    { key: 'floor', label: 'Piso', width: '52px', render: (u) => <span className={`${dsMono} text-xs`}>{u.floor ?? '—'}</span> },
    { key: 'area', label: 'Área', width: '84px', render: (u) => <span className={`${dsMono} text-xs`}>{formatArea(u.area)}</span> },
    { key: 'rooms', label: 'Hab/Bañ', width: '70px', render: (u) => <span className={`${dsMono} text-xs`}>{formatRoomsBaths(u.bedrooms, u.bathrooms)}</span> },
    {
      key: 'coef',
      label: 'Coef.',
      width: '84px',
      align: 'right',
      render: (u) => <span className={`${dsMono} text-xs font-medium`}>{formatCoefficient(u.coefficient)}</span>,
    },
    {
      key: 'resident',
      label: 'Residente principal',
      width: 'minmax(160px,1.5fr)',
      render: (u) =>
        u.residentsCount ? (
          <span className="truncate" title={u.mainResidentName}>{formatOccupancy(u.residentsCount, u.mainResidentName)}</span>
        ) : (
          <span className="font-medium" style={{ color: DS.accent }}>Sin residente</span>
        ),
    },
    {
      key: 'edit',
      label: '',
      width: '28px',
      align: 'right',
      render: (u) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setEditing(u);
          }}
          className="inline-flex items-center justify-center w-7 h-7 max-md:w-11 max-md:h-11 rounded-md border border-[#d6d3cd] bg-white text-[#4b4a46] hover:bg-[#f5f5f4]"
          aria-label={`Editar ${formatUnitLabel(u.number, u.block)}`}
          title="Editar"
        >
          <VtIcon name="edit" size={14} />
        </button>
      ),
    },
  ];

  const groups = groupUnitsByBlock(units).map((g) => {
    const totals = blockTotals(summary, g.block);
    return {
      key: g.block || '__sin_bloque__',
      label: `${blockLabel(g.block)} · ${totals?.total ?? g.units.length} unidades`,
      right: totals ? `coef. ${formatCoefficientPct(totals.coefficientSum)}` : undefined,
      rows: g.units,
    };
  });

  return (
    <DsPage>
      <DsSectionHeader<string>
        ariaLabel="Unidades por bloque"
        tabs={tabs.map((t) => ({ id: t.id, label: t.label, count: t.count }))}
        active={tab}
        onChange={(id) => setFilters({ pestana: id === UNIT_TAB_ALL ? null : id })}
        actions={
          <>
            <button type="button" className={vtBtn.secondary} onClick={() => setShowImport(true)}>Importar Excel</button>
            <button type="button" className={vtBtn.secondary} onClick={exportCsv} disabled={exporting}>
              {exporting ? 'Exportando…' : 'Exportar'}
            </button>
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

        <div className="flex justify-end">
          <DsSearch value={search} onChange={setSearch} placeholder="Número o residente" ariaLabel="Buscar por número o residente" className="md:w-[220px]" />
        </div>

        <DsGroupedTable
          ariaLabel="Unidades"
          columns={columns}
          groups={groups}
          rowKey={(u) => u.id}
          onRowClick={(u) => setEditing(u)}
          loading={loading}
          minWidth={880}
          empty={
            values.q || tab !== UNIT_TAB_ALL ? (
              <span>
                Ninguna unidad coincide.{' '}
                <button type="button" className="underline text-[#1a1a1a]" onClick={() => setFilters({ q: null, pestana: null })}>
                  Ver todas
                </button>
              </span>
            ) : (
              'Aún no hay unidades. Créalas una a una o impórtalas desde Excel.'
            )
          }
          footer={<Pagination total={total} totalPages={totalPages} disabled={loading} className="border-t-0! bg-transparent! px-0!" />}
        />
      </DsBody>

      {showCreate && (
        <CreatePropertyUnitModal
          businessId={businessId}
          blocks={blocks}
          coefficientSum={summary?.coefficientSum}
          defaultBlock={tabFilters.block}
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
          blocks={blocks}
          coefficientSum={summary?.coefficientSum}
          onClose={() => setEditing(null)}
          onDelete={(u) => {
            setDeleteError(null);
            setToDelete(u);
          }}
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
