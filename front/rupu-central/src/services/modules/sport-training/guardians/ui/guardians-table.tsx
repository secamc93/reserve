/**
 * Guardians Table Component
 * Tabla de tutores con paginacion y filtros
 */
'use client';

import { useState } from 'react';
import { Guardian } from '../domain';
import { Table, Button, Badge } from '@shared/ui';
import { CreateGuardianModal } from './create-guardian-modal';
import type { TableColumn } from '@shared/ui';

interface GuardiansTableProps {
  initialData: {
    data: Guardian[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  businessId: number;
}

export function GuardiansTable({ initialData, businessId }: GuardiansTableProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const columns: TableColumn<Guardian>[] = [
    {
      key: 'fullName',
      label: 'Nombre Completo',
      render: (_, guardian) => (
        <div>
          <div className="font-medium text-gray-900">
            {guardian.firstName} {guardian.lastName}
          </div>
          <div className="text-sm text-gray-500">{guardian.documentNumber}</div>
        </div>
      ),
    },
    {
      key: 'relationship',
      label: 'Parentesco',
      render: (_, guardian) => (
        <span className="text-sm text-gray-700">{guardian.relationship || '-'}</span>
      ),
    },
    {
      key: 'contact',
      label: 'Contacto',
      render: (_, guardian) => (
        <div className="text-sm">
          <div>{guardian.email}</div>
          <div className="text-gray-500">{guardian.phone}</div>
        </div>
      ),
    },
    {
      key: 'permissions',
      label: 'Permisos',
      render: (_, guardian) => (
        <div className="flex flex-wrap gap-1">
          {guardian.canBookSessions && <Badge type="primary">Reservar</Badge>}
          {guardian.canAccessRecords && <Badge type="primary">Ver Registros</Badge>}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (_, guardian) => (
        <Badge type={guardian.isActive ? 'success' : 'danger'}>
          {guardian.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, guardian) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => (window.location.href = `/sport-training/guardians/${guardian.id}`)}
        >
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
            <h2 className="text-2xl font-bold text-gray-900">Tutores</h2>
            <p className="text-gray-600 mt-1">{initialData.total} tutores registrados</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>Agregar Tutor</Button>
        </div>

        <Table
          columns={columns}
          data={initialData.data}
          pagination={{
            currentPage: initialData.page,
            itemsPerPage: initialData.pageSize,
            totalItems: initialData.total,
            totalPages: initialData.totalPages,
            onPageChange: (page) => {
              console.log('Page change:', page);
            },
          }}
        />
      </div>

      {showCreateModal && (
        <CreateGuardianModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          businessId={businessId}
        />
      )}
    </>
  );
}
