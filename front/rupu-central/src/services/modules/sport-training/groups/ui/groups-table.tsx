'use client';

import { useState } from 'react';
import { TrainingGroup } from '../domain';
import { Table, Button, Badge } from '@shared/ui';
import { CreateGroupModal } from './create-group-modal';
import type { TableColumn } from '@shared/ui';

interface GroupsTableProps {
  initialData: { data: TrainingGroup[]; total: number; page: number; pageSize: number; totalPages: number; };
  businessId: number;
}

export function GroupsTable({ initialData, businessId }: GroupsTableProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const columns: TableColumn<TrainingGroup>[] = [
    {
      key: 'name', label: 'Grupo',
      render: (_, g) => (
        <div>
          <div className="font-medium text-gray-900">{g.name}</div>
          {g.code && <div className="text-sm text-gray-500">{g.code}</div>}
        </div>
      ),
    },
    { key: 'category', label: 'Categoria', render: (_, g) => <span>{g.category || '-'}</span> },
    { key: 'coach', label: 'Entrenador', render: (_, g) => <span>{g.coachName}</span> },
    {
      key: 'capacity', label: 'Capacidad',
      render: (_, g) => (
        <span className={g.currentCapacity >= g.maxCapacity ? 'text-red-600 font-medium' : ''}>
          {g.currentCapacity}/{g.maxCapacity}
        </span>
      ),
    },
    { key: 'skillLevel', label: 'Nivel', render: (_, g) => <span>{g.skillLevelName || '-'}</span> },
    {
      key: 'status', label: 'Estado',
      render: (_, g) => <Badge type={g.isActive ? 'success' : 'danger'}>{g.isActive ? 'Activo' : 'Inactivo'}</Badge>,
    },
    {
      key: 'actions', label: 'Acciones',
      render: (_, g) => (
        <Button size="sm" variant="outline" onClick={() => (window.location.href = `/sport-training/groups/${g.id}`)}>
          Ver
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Grupos de Entrenamiento</h2>
            <p className="text-gray-600 mt-1">{initialData.total} grupos registrados</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>Crear Grupo</Button>
        </div>
        <Table columns={columns} data={initialData.data} pagination={{
          currentPage: initialData.page, itemsPerPage: initialData.pageSize,
          totalItems: initialData.total, totalPages: initialData.totalPages,
          onPageChange: (page) => console.log('Page:', page),
        }} />
      </div>
      {showCreateModal && <CreateGroupModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} businessId={businessId} />}
    </>
  );
}
