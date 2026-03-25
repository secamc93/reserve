'use client';

import { useState } from 'react';
import { Booking } from '../domain';
import { Table, Button, Badge } from '@shared/ui';
import { CreateBookingModal } from './create-booking-modal';
import type { TableColumn } from '@shared/ui';

interface Props {
  initialData: { data: Booking[]; total: number; page: number; pageSize: number; totalPages: number; };
  businessId: number;
}

export function BookingsTable({ initialData, businessId }: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const columns: TableColumn<Booking>[] = [
    { key: 'player', label: 'Jugador', render: (_, b) => <span className="font-medium">{b.playerName}</span> },
    { key: 'date', label: 'Fecha Sesion', render: (_, b) => <span>{new Date(b.sessionDate).toLocaleDateString()}</span> },
    { key: 'mode', label: 'Modalidad', render: (_, b) => <Badge type={b.sessionMode === 'group' ? 'primary' : 'warning'}>{b.sessionMode === 'group' ? 'Grupal' : 'Individual'}</Badge> },
    { key: 'location', label: 'Ubicacion', render: (_, b) => <span>{b.location || '-'}</span> },
    {
      key: 'status', label: 'Estado',
      render: (_, b) => <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: b.statusColor }}>{b.statusName}</span>,
    },
    { key: 'paid', label: 'Pago', render: (_, b) => <Badge type={b.isPaid ? 'success' : 'warning'}>{b.isPaid ? 'Pagado' : 'Pendiente'}</Badge> },
    { key: 'price', label: 'Precio', render: (_, b) => <span>{b.price ? `$${b.price}` : '-'}</span> },
    {
      key: 'actions', label: 'Acciones',
      render: (_, b) => <Button size="sm" variant="outline" onClick={() => (window.location.href = `/sport-training/bookings/${b.id}`)}>Ver</Button>,
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reservas</h2>
            <p className="text-gray-600 mt-1">{initialData.total} reservas registradas</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>Crear Reserva</Button>
        </div>
        <Table columns={columns} data={initialData.data} pagination={{
          currentPage: initialData.page, itemsPerPage: initialData.pageSize,
          totalItems: initialData.total, totalPages: initialData.totalPages,
          onPageChange: (page) => console.log('Page:', page),
        }} />
      </div>
      {showCreateModal && <CreateBookingModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} businessId={businessId} />}
    </>
  );
}
