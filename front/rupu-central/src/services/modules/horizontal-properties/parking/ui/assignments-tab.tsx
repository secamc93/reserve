/**
 * K3 · Asignaciones: lista con vigencia. Chips por estado (vigentes, vencen en 30 días,
 * vencidas, unidades sin cupo), buscador por placa / unidad / residente / cupo y paginación en
 * la URL. "Unidades sin cupo" lista las unidades activas sin asignación para asignarles uno.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { DsChips, DsPlate, DsSearch, DsTable, DsToolbar, VtMenu, dsMono, type DsColumn } from '@shared/ui/ds';
import { PaginationControls, usePaginationParams } from '@shared/ui/pagination';
import { fetchAllPages } from '@shared/utils/pagination';
import { getPropertyUnitsAction } from '../../units/infrastructure/actions';
import { getParkingAssignmentsAction } from '../infrastructure/actions';
import type { AssignmentStatusFilter, ParkingAssignmentListDTO, ParkingAssignmentSummary } from '../domain';
import { parkingToken } from './use-parking-data';
import { assignmentStatus, formatRange, unitLabel, vehicleLabel } from './parking-view-model';

type Chip = AssignmentStatusFilter | 'no-slot';

interface UnitWithoutSlot {
  id: number;
  number: string;
  block?: string;
}

interface AssignmentsTabProps {
  businessId: number;
  today: Date;
  summary: ParkingAssignmentSummary | null;
  /** Cambia cuando hay que volver a cargar (después de asignar, editar o liberar). */
  version: number;
  onEdit: (a: ParkingAssignmentListDTO) => void;
  onRelease: (a: ParkingAssignmentListDTO) => void;
  onAssignUnit: (unit: UnitWithoutSlot) => void;
}

export function AssignmentsTab({ businessId, today, summary, version, onEdit, onRelease, onAssignUnit }: AssignmentsTabProps) {
  const [chip, setChip] = useState<Chip>('active');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const { page, pageSize, setPage, setPageSize } = usePaginationParams();
  const [rows, setRows] = useState<ParkingAssignmentListDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [units, setUnits] = useState<UnitWithoutSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // El buscador espera a que se deje de escribir.
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let alive = true;
    const token = parkingToken();
    setLoading(true);
    setError(null);
    (async () => {
      try {
        if (chip === 'no-slot') {
          const [allUnits, active] = await Promise.all([
            fetchAllPages((p, size) =>
              getPropertyUnitsAction({ businessId, token, page: p, pageSize: size, isActive: true }).then((r) => ({ items: r.units, total: r.total, totalPages: r.totalPages })),
            ),
            fetchAllPages((p, size) =>
              getParkingAssignmentsAction({ businessId, token, isActive: true, page: p, pageSize: size }).then((r) => ({ items: r.data, total: r.total, totalPages: r.totalPages })),
            ),
          ]);
          const withSlot = new Set(active.map((a) => a.propertyUnitId).filter(Boolean));
          const q = query.toLowerCase();
          const list = allUnits
            .filter((u) => !withSlot.has(u.id))
            .filter((u) => !q || unitLabel(u.block, u.number).toLowerCase().includes(q))
            .map((u) => ({ id: u.id, number: u.number, block: u.block }));
          if (alive) setUnits(list);
        } else {
          const res = await getParkingAssignmentsAction({ businessId, token, status: chip, q: query || undefined, page, pageSize });
          if (!alive) return;
          setRows(res.data);
          setTotal(res.total);
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'No se pudieron cargar las asignaciones');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [businessId, chip, query, page, pageSize, version]);

  const changeChip = (c: Chip) => {
    setChip(c);
    setPage(1);
  };

  const columns: DsColumn<ParkingAssignmentListDTO>[] = useMemo(
    () => [
      { key: 'slot', label: 'Cupo', width: '90px', render: (a) => <span className={`${dsMono} font-semibold`}>{a.parkingSlotNumber}</span> },
      { key: 'plate', label: 'Placa', width: '110px', render: (a) => <DsPlate>{a.vehiclePlate}</DsPlate> },
      { key: 'car', label: 'Vehículo', width: '1fr', render: (a) => <span className="text-[#4b4a46] truncate">{vehicleLabel(a.vehicleBrand, a.vehicleModel, a.vehicleColor)}</span> },
      {
        key: 'unit',
        label: 'Unidad / residente',
        width: '1fr',
        render: (a) => (
          <span className="truncate">
            <span className={`${dsMono} text-xs`}>{unitLabel(a.propertyUnitBlock, a.propertyUnitNumber)}</span>
            {a.residentName && <span className="text-[#4b4a46]"> · {a.residentName}</span>}
          </span>
        ),
      },
      { key: 'range', label: 'Vigencia', width: '200px', render: (a) => <span className={`${dsMono} text-xs text-[#4b4a46]`}>{formatRange(a.startDate, a.endDate)}</span> },
      {
        key: 'status',
        label: 'Estado',
        width: '130px',
        render: (a) => {
          const s = assignmentStatus(a, today);
          return <span className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>;
        },
      },
      {
        key: 'actions',
        label: '',
        width: '44px',
        align: 'right',
        render: (a) => (
          <VtMenu
            label={`Acciones de la asignación ${a.parkingSlotNumber}`}
            size={28}
            items={[
              { label: 'Editar asignación', onSelect: () => onEdit(a) },
              { label: 'Liberar cupo', onSelect: () => onRelease(a), danger: true },
            ]}
          />
        ),
      },
    ],
    [today, onEdit, onRelease],
  );

  const unitColumns: DsColumn<UnitWithoutSlot>[] = [
    { key: 'unit', label: 'Unidad', width: '1fr', render: (u) => <span className={`${dsMono} font-semibold`}>{unitLabel(u.block, u.number)}</span> },
    {
      key: 'action',
      label: '',
      width: '140px',
      align: 'right',
      render: (u) => (
        <button type="button" onClick={() => onAssignUnit(u)} className="h-7 px-3 rounded-xl border border-[#d6d3cd] bg-white text-xs font-medium hover:bg-[#f5f5f4]">
          Asignar cupo
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3.5">
      <DsToolbar
        left={
          <DsChips
            ariaLabel="Filtrar asignaciones"
            active={chip}
            onChange={changeChip}
            chips={[
              { id: 'active', label: 'Vigentes', count: summary?.active },
              { id: 'expiring', label: 'Vencen en 30 días', count: summary?.expiring30 },
              { id: 'expired', label: 'Vencidas', count: summary?.expired },
              { id: 'no-slot', label: 'Unidades sin cupo', count: summary?.unitsWithoutSlot },
            ]}
          />
        }
        right={
          <DsSearch
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder={chip === 'no-slot' ? 'Buscar unidad' : 'Placa, unidad o residente'}
          />
        }
      />
      {error && <p role="alert" className="text-sm text-[#c8382d]">{error}</p>}
      {chip === 'no-slot' ? (
        <DsTable ariaLabel="Unidades sin cupo" columns={unitColumns} rows={units} rowKey={(u) => u.id} loading={loading} empty="Todas las unidades tienen cupo" minWidth={360} />
      ) : (
        <DsTable
          ariaLabel="Asignaciones"
          columns={columns}
          rows={rows}
          rowKey={(a) => a.id}
          loading={loading}
          empty={query ? 'Ninguna asignación coincide con la búsqueda' : 'No hay asignaciones en este estado'}
          footer={
            total > 0 ? (
              <PaginationControls page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} disabled={loading} />
            ) : undefined
          }
        />
      )}
    </div>
  );
}
