/**
 * Componente: Sección de Grupos de Votación
 */

'use client';

import { useState, useEffect } from 'react';
import { Table, Badge, Spinner, type TableColumn } from '@shared/ui';
import { CreateVotingGroupModal } from './create-voting-group-modal';
import { TokenStorage } from '@shared/config';
import { getVotingGroupsAction } from '../infrastructure/actions/get-voting-groups.action';

interface VotingGroup {
  id: number;
  businessId: number;
  name: string;
  description: string;
  votingStartDate: string;
  votingEndDate: string;
  isActive: boolean;
  requiresQuorum: boolean;
  quorumPercentage: number;
  createdByUserId: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface VotingGroupsSectionProps {
  businessId: number;
}

export function VotingGroupsSection({ businessId }: VotingGroupsSectionProps) {
  const [votingGroups, setVotingGroups] = useState<VotingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadVotingGroups();
  }, [businessId]);

  const loadVotingGroups = async () => {
    setLoading(true);
    try {
      const token = TokenStorage.getToken();
      if (!token) {
        console.error('❌ No hay token disponible');
        setLoading(false);
        return;
      }

      const result = await getVotingGroupsAction({
        token,
        businessId,
      });

      if (result.success && result.data) {
        setVotingGroups(result.data);
      } else {
        console.error('❌ Error en la respuesta:', result.error);
      }
    } catch (error) {
      console.error('❌ Error al cargar grupos de votación:', error);
    }
    setLoading(false);
  };

  const handleCreateSuccess = () => {
    console.log('✅ Grupo de votación creado exitosamente');
    loadVotingGroups();
  };

  const columns: TableColumn<VotingGroup>[] = [
    { key: 'id', label: 'ID', width: '80px', align: 'center' },
    { key: 'name', label: 'Nombre', width: '250px' },
    { 
      key: 'description', 
      label: 'Descripción',
      render: (value) => (
        <span className="text-sm text-gray-600">{value}</span>
      )
    },
    {
      key: 'votingStartDate',
      label: 'Inicio',
      width: '140px',
      render: (value) => new Date(value).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    {
      key: 'votingEndDate',
      label: 'Fin',
      width: '140px',
      render: (value) => new Date(value).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    {
      key: 'isActive',
      label: 'Estado',
      width: '100px',
      align: 'center',
      render: (value) => (
        <Badge type={value ? 'success' : 'error'}>
          {value ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      key: 'requiresQuorum',
      label: 'Quórum',
      width: '120px',
      align: 'center',
      render: (value, row) => (
        value ? (
          <span className="text-sm text-gray-700">
            {row.quorumPercentage}%
          </span>
        ) : (
          <span className="text-sm text-gray-500">No requerido</span>
        )
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="md" text="Cargando grupos de votación..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary ml-auto"
        >
          + Crear Grupo de Votación
        </button>
      </div>

      {/* Contenido */}
      <div>
        {votingGroups.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay grupos de votación creados
            </h3>
            <p className="text-gray-600 mb-4">
              Crea tu primer grupo de votación para comenzar
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-sm"
            >
              Crear Primer Grupo
            </button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={votingGroups}
            loading={loading}
            emptyMessage="No hay grupos de votación disponibles"
            keyExtractor={(row) => row.id}
          />
        )}
      </div>

      {/* Modal de creación */}
      <CreateVotingGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        businessId={businessId}
      />
    </div>
  );
}

