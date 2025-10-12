/**
 * Componente: Sección de Grupos de Votación
 */

'use client';

import { useState, useEffect } from 'react';
import { Badge, Spinner } from '@shared/ui';
import { CreateVotingGroupModal } from './create-voting-group-modal';
import { VotingsList } from './votings-list';
import { TokenStorage } from '@shared/config';
import { getVotingGroupsAction } from '../../infrastructure/actions';

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
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);

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

  const handleToggleGroup = (groupId: number) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="md" text="Cargando grupos de votación..." />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
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
          <div className="w-full space-y-6">
            {votingGroups.map((group) => {
              const isExpanded = expandedGroupId === group.id;
              
              return (
                <div
                  key={group.id}
                  className="w-full card hover:shadow-lg transition-shadow p-6"
                >
                  {/* Header del Grupo */}
                  <div
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => handleToggleGroup(group.id)}
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {group.name}
                        </h3>
                        <Badge type={group.isActive ? 'success' : 'error'}>
                          {group.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                        {group.description}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="flex items-center gap-1 text-gray-600">
                          <span>📅</span>
                          <span className="font-medium">Inicio:</span>
                          <span>{new Date(group.votingStartDate).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <span>📅</span>
                          <span className="font-medium">Fin:</span>
                          <span>{new Date(group.votingEndDate).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                        </div>
                        {group.requiresQuorum && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <span>📊</span>
                            <span className="font-medium">Quórum:</span>
                            <span>{group.quorumPercentage}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className="text-gray-400 hover:text-gray-600 transition-transform flex-shrink-0"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Votaciones del Grupo (Expandible) */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <VotingsList
                        hpId={businessId}
                        groupId={group.id}
                        groupName={group.name}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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

