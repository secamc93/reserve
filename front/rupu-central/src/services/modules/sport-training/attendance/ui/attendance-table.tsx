'use client';

import { AttendanceRecord } from '../domain';
import { Table, Badge } from '@shared/ui';
import type { TableColumn } from '@shared/ui';

interface Props {
  data: AttendanceRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function AttendanceTable({ data, total, page, pageSize, totalPages }: Props) {
  const columns: TableColumn<AttendanceRecord>[] = [
    { key: 'player', label: 'Jugador', render: (_, r) => <span className="font-medium">{r.playerName}</span> },
    {
      key: 'status', label: 'Estado',
      render: (_, r) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: r.statusColor }}>
          {r.statusName}
        </span>
      ),
    },
    { key: 'checkIn', label: 'Hora Entrada', render: (_, r) => <span>{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '-'}</span> },
    {
      key: 'rating', label: 'Calificacion',
      render: (_, r) => r.performanceRating ? (
        <div className="flex items-center gap-1">
          <span className="font-medium">{r.performanceRating}</span>
          <span className="text-yellow-500">/5</span>
        </div>
      ) : <span>-</span>,
    },
    { key: 'coach', label: 'Registrado por', render: (_, r) => <span>{r.recordedByCoachName || '-'}</span> },
    { key: 'recordedAt', label: 'Fecha Registro', render: (_, r) => <span className="text-sm">{new Date(r.recordedAt).toLocaleString()}</span> },
  ];

  return (
    <Table columns={columns} data={data} pagination={{
      currentPage: page, itemsPerPage: pageSize,
      totalItems: total, totalPages,
      onPageChange: (p) => console.log('Page:', p),
    }} />
  );
}
