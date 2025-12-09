/**
 * Componente: Sección de Grupos de Votación
 */

'use client';

import { useState, useEffect } from 'react';
import { Badge, Spinner } from '@shared/ui';
import { CreateVotingGroupModal } from './create-voting-group-modal';
import { EditVotingGroupModal } from './edit-voting-group-modal';
import { DeleteVotingGroupModal } from './delete-voting-group-modal';
import { VotingsList } from './votings-list';
import { AttendanceManagement } from '../../attendance/ui/attendance-management';
import { TokenStorage } from '@shared/config';
import { getVotingGroupsAction } from '../infrastructure/actions';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<VotingGroup | null>(null); // Still needed for edit/delete modals
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);
  const [attendanceGroupId, setAttendanceGroupId] = useState<number | null>(null);
  const [userToken, setUserToken] = useState<string>('');

  useEffect(() => {
    loadVotingGroups();
  }, [businessId]);

  useEffect(() => {
    const token = TokenStorage.getBusinessToken();
    if (token) {
      setUserToken(token);
    }
  }, []);

  const loadVotingGroups = async () => {
    setLoading(true);
    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) {
        console.error('❌ No hay business token disponible. Debe seleccionar un negocio primero.');
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

  const handleEditClick = (group: VotingGroup) => {
    setSelectedGroup(group);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    console.log('✅ Grupo de votación editado exitosamente');
    loadVotingGroups();
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setSelectedGroup(null);
  };

  const handleDeleteClick = (group: VotingGroup) => {
    setSelectedGroup(group);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    console.log('✅ Grupo de votación eliminado exitosamente');
    loadVotingGroups();
  };

  const handleDeleteClose = () => {
    setShowDeleteModal(false);
    setSelectedGroup(null);
  };

  const handleAttendanceToggle = (group: VotingGroup) => {
    setAttendanceGroupId(prev => (prev === group.id ? null : group.id));
    setExpandedGroupId(group.id);
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
                  className="w-full rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`,
                  }}
                >
                  {/* Header del Grupo */}
                  <div className="p-6">
                    {/* Fila 1: Título centrado */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <h3 className="text-2xl font-bold text-white text-center">
                          {group.name}
                        </h3>
                      </div>
                    </div>

                    {/* Fila 2: Badge + Información + Botones */}
                    <div className="flex items-center justify-between gap-4">
                      {/* Lado izquierdo: Badge + Info */}
                      <div className="flex items-center gap-3 flex-1">
                        {/* Badge de estado */}
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold whitespace-nowrap ${group.isActive
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                          }`}>
                          {group.isActive ? 'Activa' : 'Inactiva'}
                        </span>

                        {/* Información en una fila con efectos */}
                        <div className="flex items-center gap-3 text-sm flex-wrap">
                          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 shadow-md text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-semibold">Inicio:</span>
                            <span className="font-medium">{new Date(group.votingStartDate).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                          </span>
                          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 shadow-md text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-semibold">Fin:</span>
                            <span className="font-medium">{new Date(group.votingEndDate).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                          </span>
                          {group.requiresQuorum && (
                            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 shadow-md text-white">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              <span className="font-semibold">Quórum:</span>
                              <span className="font-medium">{group.quorumPercentage}% (7/10)</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 shadow-md text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <span className="font-semibold">Cantidad de votaciones:</span>
                            <span className="font-medium">-</span>
                          </span>

                        </div>
                      </div>

                      {/* Lado derecho: Botones de acción */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(group);
                          }}
                          className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                          title="Editar grupo"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(group);
                          }}
                          className="p-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
                          title="Eliminar grupo"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleToggleGroup(group.id)}
                          className="p-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-all"
                          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          title={isExpanded ? 'Contraer' : 'Expandir'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Votaciones del Grupo (Expandible) */}
                  {isExpanded && (
                    <div className="mt-4 space-y-6 pt-4 border-t border-white/20">
                      {/* Descripción del grupo con efecto visual */}
                      {group.description && (
                        <div className="px-6">
                          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-md">
                            <p className="text-white/90 text-sm leading-relaxed">
                              <span className="font-semibold text-white">Descripción: </span>
                              {group.description}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Gestión de Asistencia - Siempre visible */}
                      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mx-6">
                        {userToken ? (
                          <AttendanceManagement
                            votingGroupId={group.id}
                            votingGroupName={group.name}
                            token={userToken}
                            businessId={businessId}
                            useRoutes={false}
                          />
                        ) : (
                          <div className="text-sm text-gray-500">
                            Selecciona un negocio para cargar las listas de asistencia.
                          </div>
                        )}
                      </div>

                      <VotingsList
                        businessId={businessId}
                        groupId={group.id}
                        groupName={group.name}
                        onToggleAttendance={() => handleAttendanceToggle(group)}
                        isAttendanceVisible={attendanceGroupId === group.id}
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

      {/* Modal de edición */}
      {selectedGroup && (
        <EditVotingGroupModal
          isOpen={showEditModal}
          onClose={handleEditClose}
          onSuccess={handleEditSuccess}
          businessId={businessId}
          group={selectedGroup}
        />
      )}

      {/* Modal de eliminación */}
      {selectedGroup && (
        <DeleteVotingGroupModal
          isOpen={showDeleteModal}
          onClose={handleDeleteClose}
          onSuccess={handleDeleteSuccess}
          businessId={businessId}
          group={selectedGroup}
        />
      )}

      {/* Modal de gestión de asistencia - Removed, now using routes */}
    </div>
  );
}

