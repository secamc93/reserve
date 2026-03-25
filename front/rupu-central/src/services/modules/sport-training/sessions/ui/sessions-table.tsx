'use client';

import { useState } from 'react';
import { TrainingSession } from '../domain';
import { Table, Button, Badge } from '@shared/ui';
import { CreateSessionModal } from './create-session-modal';
import type { TableColumn } from '@shared/ui';

const statusColors: Record<string, string> = {
  scheduled: 'primary', in_progress: 'warning', completed: 'success', cancelled: 'danger',
};
const statusLabels: Record<string, string> = {
  scheduled: 'Programada', in_progress: 'En Curso', completed: 'Completada', cancelled: 'Cancelada',
};

interface SessionsTableProps {
  initialData: { data: TrainingSession[]; total: number; page: number; pageSize: number; totalPages: number; };
  businessId: number;
}

export function SessionsTable({ initialData, businessId }: SessionsTableProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const columns: TableColumn<TrainingSession>[] = [
    {
      key: 'type', label: 'Tipo',
      render: (_, s) => (
        <div>
          <div className="font-medium">{s.sessionTypeName}</div>
          <Badge type={s.sessionMode === 'group' ? 'primary' : 'warning'}>{s.sessionMode === 'group' ? 'Grupal' : 'Individual'}</Badge>
        </div>
      ),
    },
    { key: 'coach', label: 'Entrenador', render: (_, s) => <span>{s.coachName}</span> },
    {
      key: 'schedule', label: 'Horario',
      render: (_, s) => (
        <div className="text-sm">
          <div>{new Date(s.scheduledDate).toLocaleDateString()}</div>
          <div className="text-gray-500">{s.startTime?.slice(11, 16)} - {s.endTime?.slice(11, 16)}</div>
        </div>
      ),
    },
    { key: 'location', label: 'Ubicacion', render: (_, s) => <span>{s.location || '-'}{s.field ? ` / ${s.field}` : ''}</span> },
    {
      key: 'participants', label: 'Participantes',
      render: (_, s) => <span>{s.currentParticipants}/{s.maxParticipants || '-'}</span>,
    },
    {
      key: 'status', label: 'Estado',
      render: (_, s) => <Badge type={(statusColors[s.status] as any) || 'primary'}>{statusLabels[s.status] || s.status}</Badge>,
    },
    { key: 'price', label: 'Precio', render: (_, s) => <span>{s.price ? `$${s.price}` : '-'}</span> },
    {
      key: 'actions', label: 'Acciones',
      render: (_, s) => (
        <Button size="sm" variant="outline" onClick={() => (window.location.href = `/sport-training/sessions/${s.id}`)}>Ver</Button>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sesiones de Entrenamiento</h2>
            <p className="text-gray-600 mt-1">{initialData.total} sesiones registradas</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>Crear Sesion</Button>
        </div>
        <Table columns={columns} data={initialData.data} pagination={{
          currentPage: initialData.page, itemsPerPage: initialData.pageSize,
          totalItems: initialData.total, totalPages: initialData.totalPages,
          onPageChange: (page) => console.log('Page:', page),
        }} />
      </div>
      {showCreateModal && <CreateSessionModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} businessId={businessId} />}
    </>
  );
}
