/** Pestaña Zonas: tabla de zonas con su código, ubicación, cupos y ocupación. */

'use client';

import { DsTable, dsMono, type DsColumn } from '@shared/ui/ds';
import type { ParkingZoneListDTO } from '../domain';
import type { ParkingData } from './use-parking-data';
import { isLiveReservation, slotState, zoneSummary } from './parking-view-model';

export function ZonesTab({ data, loading }: { data: ParkingData; loading: boolean }) {
  const summaryOf = (zone: ParkingZoneListDTO) =>
    zoneSummary(
      data.slots
        .filter((s) => s.parkingZoneId === zone.id)
        .map((s) => slotState(s, (data.reservationsBySlot.get(s.id) ?? []).some(isLiveReservation))),
    );

  const columns: DsColumn<ParkingZoneListDTO>[] = [
    { key: 'name', label: 'Zona', width: '1fr', render: (z) => <span className="font-semibold">{z.name}</span> },
    { key: 'code', label: 'Código', width: '110px', render: (z) => <span className={`${dsMono} text-xs`}>{z.code}</span> },
    { key: 'loc', label: 'Ubicación', width: '1fr', render: (z) => <span className="text-[#4b4a46]">{z.location || '—'}</span> },
    { key: 'slots', label: 'Cupos', width: '80px', align: 'right', render: (z) => <span className={dsMono}>{summaryOf(z).total}</span> },
    {
      key: 'occ',
      label: 'Ocupación',
      width: '200px',
      render: (z) => {
        const s = summaryOf(z);
        return (
          <div className="w-full flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[#efedea] rounded-full">
              <div className="h-full bg-[#18A0AE] rounded-full" style={{ width: `${s.pct}%` }} />
            </div>
            <span className={`${dsMono} text-xs text-[#4b4a46] w-10 text-right`}>{s.pct}%</span>
          </div>
        );
      },
    },
    {
      key: 'state',
      label: 'Estado',
      width: '90px',
      render: (z) => <span className="text-xs font-semibold" style={{ color: z.isActive ? '#1f8a4c' : '#8a8580' }}>{z.isActive ? 'Activa' : 'Inactiva'}</span>,
    },
  ];

  return <DsTable ariaLabel="Zonas de parqueo" columns={columns} rows={data.zones} rowKey={(z) => z.id} loading={loading} empty="Aún no hay zonas" minWidth={760} />;
}
