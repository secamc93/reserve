/**
 * Coaches Table Component
 * Tabla de entrenadores con paginación y filtros
 */
'use client';

import { useState } from 'react';
import { Coach } from '../domain';
import { deleteCoachAction } from '../infrastructure/actions';
import { Table, Button, Badge, ConfirmModal } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { CreateCoachModal } from './create-coach-modal';
import type { TableColumn } from '@shared/ui';

interface CoachesTableProps {
  initialData: {
    data: Coach[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  businessId: number;
}

export function CoachesTable({ initialData, businessId }: CoachesTableProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; coach?: Coach }>({ show: false });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteModal.coach) return;

    setIsDeleting(true);
    const token = TokenStorage.getBusinessToken();

    if (!token) {
      alert('No se encontró token de autenticación');
      setIsDeleting(false);
      return;
    }

    const result = await deleteCoachAction({
      businessId,
      coachId: deleteModal.coach.id,
      token,
    });

    setIsDeleting(false);

    if (result.success) {
      setDeleteModal({ show: false });
      window.location.reload();
    } else {
      alert(result.message || 'Error al eliminar el entrenador');
    }
  };

  const columns: TableColumn<Coach>[] = [
    {
      key: 'fullName',
      label: 'Nombre Completo',
      render: (_, coach) => (
        <div>
          <div className="font-medium text-gray-900">
            {coach.firstName} {coach.lastName}
          </div>
          <div className="text-sm text-gray-500">{coach.documentNumber}</div>
        </div>
      ),
    },
    {
      key: 'specialties',
      label: 'Especialidades',
      render: (_, coach) => (
        <div className="flex flex-wrap gap-1">
          {coach.specialties.length > 0 ? (
            coach.specialties.map((specialty) => (
              <Badge key={specialty.id} type="primary">
                {specialty.specialtyName}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-400">Sin especialidades</span>
          )}
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contacto',
      render: (_, coach) => (
        <div className="text-sm">
          <div>{coach.email}</div>
          <div className="text-gray-500">{coach.phone}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (_, coach) => (
        <Badge type={coach.isActive ? 'success' : 'danger'}>
          {coach.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, coach) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => (window.location.href = `/sport-training/coaches/${coach.id}`)}
          >
            Ver
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setDeleteModal({ show: true, coach })}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Entrenadores</h2>
            <p className="text-gray-600 mt-1">
              {initialData.total} entrenadores registrados
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            Agregar Entrenador
          </Button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={initialData.data}
          pagination={{
            currentPage: initialData.page,
            itemsPerPage: initialData.pageSize,
            totalItems: initialData.total,
            totalPages: initialData.totalPages,
            onPageChange: (page) => {
              // TODO: Implement page change handler
              console.log('Page change:', page);
            },
          }}
        />
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateCoachModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          businessId={businessId}
        />
      )}

      {/* Delete Confirmation */}
      {deleteModal.show && deleteModal.coach && (
        <ConfirmModal
          isOpen={deleteModal.show}
          onClose={() => setDeleteModal({ show: false })}
          title="Eliminar Entrenador"
          message={`¿Estás seguro de eliminar a ${deleteModal.coach.firstName} ${deleteModal.coach.lastName}? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
