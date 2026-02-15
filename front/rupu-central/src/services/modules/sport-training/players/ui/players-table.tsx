/**
 * Players Table Component
 * Tabla de jugadores con paginación y filtros
 */
'use client';

import { useState } from 'react';
import { Player } from '../domain';
import { deletePlayerAction } from '../infrastructure/actions';
import { Table, Button, Badge, ConfirmModal } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { CreatePlayerModal } from './create-player-modal';
import type { TableColumn } from '@shared/ui';

interface PlayersTableProps {
  initialData: {
    data: Player[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  businessId: number;
}

export function PlayersTable({ initialData, businessId }: PlayersTableProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; player?: Player }>({ show: false });
  const [isDeleting, setIsDeleting] = useState(false);

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleDelete = async () => {
    if (!deleteModal.player) return;

    setIsDeleting(true);
    const token = TokenStorage.getBusinessToken();

    if (!token) {
      alert('No se encontró token de autenticación');
      setIsDeleting(false);
      return;
    }

    const result = await deletePlayerAction({
      businessId,
      playerId: deleteModal.player.id,
      token,
    });

    setIsDeleting(false);

    if (result.success) {
      setDeleteModal({ show: false });
      window.location.reload(); // Recargar para actualizar la lista
    } else {
      alert(result.message || 'Error al eliminar el jugador');
    }
  };

  const columns: TableColumn<Player>[] = [
    {
      key: 'fullName',
      label: 'Nombre Completo',
      render: (_, player) => (
        <div>
          <div className="font-medium text-gray-900">
            {player.firstName} {player.lastName}
          </div>
          <div className="text-sm text-gray-500">{player.documentNumber}</div>
        </div>
      ),
    },
    {
      key: 'age',
      label: 'Edad',
      render: (_, player) => (
        <span className="text-gray-900">{calculateAge(player.birthDate)} años</span>
      ),
    },
    {
      key: 'skillLevel',
      label: 'Nivel',
      render: (_, player) => (
        <Badge type="info">{player.skillLevelName}</Badge>
      ),
    },
    {
      key: 'contact',
      label: 'Contacto',
      render: (_, player) => (
        <div className="text-sm">
          {player.email && <div>{player.email}</div>}
          {player.phone && <div className="text-gray-500">{player.phone}</div>}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (_, player) => (
        <Badge type={player.isActive ? 'success' : 'danger'}>
          {player.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, player) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => (window.location.href = `/sport-training/players/${player.id}`)}
          >
            Ver
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setDeleteModal({ show: true, player })}
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
            <h2 className="text-2xl font-bold text-gray-900">Jugadores</h2>
            <p className="text-gray-600 mt-1">
              {initialData.total} jugadores registrados
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            Agregar Jugador
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
        <CreatePlayerModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          businessId={businessId}
        />
      )}

      {/* Delete Confirmation */}
      {deleteModal.show && deleteModal.player && (
        <ConfirmModal
          isOpen={deleteModal.show}
          onClose={() => setDeleteModal({ show: false })}
          title="Eliminar Jugador"
          message={`¿Estás seguro de eliminar a ${deleteModal.player.firstName} ${deleteModal.player.lastName}? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
