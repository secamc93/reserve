/**
 * Componente: Lista de Votaciones
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge, Spinner, ConfirmModal } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { 
  getVotingsAction, 
  getVotingOptionsAction, 
  getVotesAction,
  updateVotingOptionStatusAction,
  deleteVotingOptionAction,
} from '../../infrastructure/actions';
import { activateVotingAction } from '../../infrastructure/actions/voting/activate-voting.action';
import { deactivateVotingAction } from '../../infrastructure/actions/voting/deactivate-voting.action';
import { CreateVotingModal } from './create-voting-modal';
import { EditVotingModal } from './edit-voting-modal';
import { DeleteVotingModal } from './delete-voting-modal';
import { CreateVotingOptionModal } from './create-voting-option-modal';
import { VotesDetailModal } from './votes-detail-modal';
import { VoteModal } from './vote-modal';
import { LiveVotingModal } from './live-voting-modal';
import {
  PlayIcon,
  PauseIcon,
  TrashIcon,
  ChartPieIcon,
  EllipsisHorizontalIcon,
  PlusCircleIcon,
  UserPlusIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';

interface Voting {
  id: number;
  votingGroupId: number;
  title: string;
  description: string;
  votingType: string;
  isSecret: boolean;
  allowAbstention: boolean;
  isActive: boolean;
  displayOrder: number;
  requiredPercentage: number;
  createdAt: string;
  updatedAt: string;
}

interface VotingOption {
  id: number;
  votingId: number;
  optionText: string;
  optionCode: string;
  displayOrder: number;
  isActive: boolean;
}

interface Vote {
  id: number;
  votingId: number;
  propertyUnitId: number;
  votingOptionId: number;
  votedAt: string;
  ipAddress: string;
  userAgent: string;
  notes?: string;
}

interface VotingsListProps {
  businessId: number;
  groupId: number;
  groupName: string;
  onToggleAttendance?: () => void;
  isAttendanceVisible?: boolean;
}

export function VotingsList({
  businessId,
  groupId,
  groupName,
  onToggleAttendance,
  isAttendanceVisible,
}: VotingsListProps) {
  const [loading, setLoading] = useState(false);
  const [votings, setVotings] = useState<Voting[]>([]);
  const [votingOptions, setVotingOptions] = useState<Record<number, VotingOption[]>>({});
  const [votingVotes, setVotingVotes] = useState<Record<number, Vote[]>>({});
  const [expandedVoting, setExpandedVoting] = useState<number | null>(null);
  const [showCreateVotingModal, setShowCreateVotingModal] = useState(false);
  const [showCreateOptionModal, setShowCreateOptionModal] = useState(false);
  const [selectedVotingForOption, setSelectedVotingForOption] = useState<number | null>(null);
  const [showVotesDetailModal, setShowVotesDetailModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showLiveVotingModal, setShowLiveVotingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVotingForDetails, setSelectedVotingForDetails] = useState<Voting | null>(null);
  const [selectedVotingForLive, setSelectedVotingForLive] = useState<Voting | null>(null);
  const [selectedVotingForEdit, setSelectedVotingForEdit] = useState<Voting | null>(null);
  const [selectedVotingForDelete, setSelectedVotingForDelete] = useState<Voting | null>(null);
  const [optionStatusLoadingId, setOptionStatusLoadingId] = useState<number | null>(null);
  const [optionToDelete, setOptionToDelete] = useState<{ votingId: number; option: VotingOption } | null>(null);
  const [showDeleteOptionConfirm, setShowDeleteOptionConfirm] = useState(false);

  useEffect(() => {
    loadVotings();
  }, [businessId, groupId]);

  const loadVotings = async () => {
    setLoading(true);
    try {
      const token = TokenStorage.getToken();
      if (!token) {
        console.error('❌ No se encontró el token');
        return;
      }

      const result = await getVotingsAction({ token, businessId, groupId });
      
      if (result.success && result.data) {
        const sortedVotings = result.data.sort((a, b) => a.displayOrder - b.displayOrder);
        setVotings(sortedVotings);
      }
    } catch (error) {
      console.error('❌ Error al cargar votaciones:', error);
    }
    setLoading(false);
  };

  const loadVotingOptions = useCallback(async (votingId: number) => {
    try {
      const token = TokenStorage.getToken();
      if (!token) return;

      const result = await getVotingOptionsAction({ token, businessId, groupId, votingId });
      
      if (result.success && result.data) {
        const sortedOptions = result.data.sort((a, b) => a.displayOrder - b.displayOrder);
        setVotingOptions(prev => ({
          ...prev,
          [votingId]: sortedOptions
        }));
      }
    } catch (error) {
      console.error('❌ Error al cargar opciones:', error);
    }
  }, [businessId, groupId]);

  useEffect(() => {
    votings.forEach((voting) => {
      if (!votingOptions[voting.id]) {
        loadVotingOptions(voting.id);
      }
    });
  }, [votings, votingOptions, loadVotingOptions]);

  const loadVotes = async (votingId: number) => {
    try {
      const token = TokenStorage.getToken();
      if (!token) return;

      const result = await getVotesAction({ token, businessId, groupId, votingId });
      
      if (result.success && result.data) {
        setVotingVotes(prev => ({
          ...prev,
          [votingId]: result.data || []
        }));
      }
    } catch (error) {
      console.error('❌ Error al cargar votos:', error);
    }
  };

  const handleToggleVoting = async (votingId: number) => {
    if (expandedVoting === votingId) {
      setExpandedVoting(null);
    } else {
      setExpandedVoting(votingId);
      // Si no hemos cargado las opciones, cargarlas
      if (!votingOptions[votingId]) {
        await loadVotingOptions(votingId);
      }
      // Si no hemos cargado los votos, cargarlos
      if (!votingVotes[votingId]) {
        await loadVotes(votingId);
      }
    }
  };

  const handleCreateVotingSuccess = () => {
    loadVotings();
  };

  const handleAddOption = (votingId: number) => {
    setSelectedVotingForOption(votingId);
    setShowCreateOptionModal(true);
  };

  const handleCreateOptionSuccess = () => {
    if (selectedVotingForOption) {
      loadVotingOptions(selectedVotingForOption);
    }
  };

  const handleViewVotes = async (voting: Voting) => {
    // Cargar opciones si no están cargadas
    if (!votingOptions[voting.id]) {
      await loadVotingOptions(voting.id);
    }
    setSelectedVotingForDetails(voting);
    setShowVotesDetailModal(true);
  };

  const handleVote = async (voting: Voting) => {
    // Cargar opciones si no están cargadas
    if (!votingOptions[voting.id]) {
      await loadVotingOptions(voting.id);
    }
    setSelectedVotingForDetails(voting);
    setShowVoteModal(true);
  };

  const handleVoteSuccess = () => {
    console.log('✅ Voto registrado exitosamente');
    // Recargar votos si está abierto el modal de detalles
    if (showVotesDetailModal && selectedVotingForDetails) {
      loadVotes(selectedVotingForDetails.id);
    }
    // También recargar para la votación en vivo si está abierta
    if (showLiveVotingModal && selectedVotingForLive) {
      loadVotes(selectedVotingForLive.id);
    }
  };

  const handleToggleOptionStatus = async (voting: Voting, option: VotingOption) => {
    try {
      const token = TokenStorage.getToken();
      if (!token) throw new Error('Token no disponible');

      setOptionStatusLoadingId(option.id);

      const result = await updateVotingOptionStatusAction({
        token,
        businessId,
        groupId,
        votingId: voting.id,
        optionId: option.id,
        isActive: !option.isActive,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'No se pudo actualizar la opción');
      }

      setVotingOptions(prev => ({
        ...prev,
        [voting.id]: (prev[voting.id] || []).map(opt =>
          opt.id === option.id ? result.data! : opt
        ),
      }));
    } catch (error) {
      console.error('❌ Error al actualizar estado de la opción:', error);
      alert(error instanceof Error ? error.message : 'Error al actualizar la opción');
    } finally {
      setOptionStatusLoadingId(null);
    }
  };

  const handleDeleteOptionRequest = (voting: Voting, option: VotingOption) => {
    setOptionToDelete({ votingId: voting.id, option });
    setShowDeleteOptionConfirm(true);
  };

  const handleDeleteOption = async () => {
    if (!optionToDelete) return;

    try {
      const token = TokenStorage.getToken();
      if (!token) throw new Error('Token no disponible');

      const result = await deleteVotingOptionAction({
        token,
        businessId,
        groupId,
        votingId: optionToDelete.votingId,
        optionId: optionToDelete.option.id,
      });

      if (!result.success) {
        throw new Error(result.error || 'No se pudo eliminar la opción');
      }

      setVotingOptions(prev => ({
        ...prev,
        [optionToDelete.votingId]: (prev[optionToDelete.votingId] || []).filter(
          opt => opt.id !== optionToDelete.option.id
        ),
      }));
    } catch (error) {
      console.error('❌ Error al eliminar opción:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar opción');
    } finally {
      setShowDeleteOptionConfirm(false);
      setOptionToDelete(null);
    }
  };

  const handleLiveVoting = (voting: Voting) => {
    // Navegar a la página de votación en vivo
    window.location.href = `/properties/${businessId}/voting-groups/${groupId}/votings/${voting.id}/live`;
  };

  const handleEditClick = (voting: Voting) => {
    setSelectedVotingForEdit(voting);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    console.log('✅ Votación editada exitosamente');
    loadVotings();
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setSelectedVotingForEdit(null);
  };

  const handleDeleteClick = (voting: Voting) => {
    setSelectedVotingForDelete(voting);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    console.log('✅ Votación eliminada exitosamente');
    loadVotings();
  };

  const handleDeleteClose = () => {
    setShowDeleteModal(false);
    setSelectedVotingForDelete(null);
  };

  const handleActivateVoting = async (voting: Voting) => {
    try {
      const token = TokenStorage.getToken();
      
      if (!token) {
        console.error('❌ No se encontró el token de autenticación');
        return;
      }

      console.log('🔄 Activando votación:', { votingId: voting.id, title: voting.title });

      const result = await activateVotingAction({
        token,
        businessId,
        groupId,
        votingId: voting.id,
      });

      if (result.success) {
        console.log('✅ Votación activada:', result.message);
        // Actualizar la lista de votaciones
        loadVotings();
      } else {
        console.error('❌ Error activando votación:', result.error);
      }
    } catch (err) {
      console.error('❌ Error inesperado activando votación:', err);
    }
  };

  const handleDeactivateVoting = async (voting: Voting) => {
    try {
      const token = TokenStorage.getToken();
      
      if (!token) {
        console.error('❌ No se encontró el token de autenticación');
        return;
      }

      console.log('🔄 Desactivando votación:', { votingId: voting.id, title: voting.title });

      const result = await deactivateVotingAction({
        token,
        businessId,
        groupId,
        votingId: voting.id,
      });

      if (result.success) {
        console.log('✅ Votación desactivada:', result.message);
        // Actualizar la lista de votaciones
        loadVotings();
      } else {
        console.error('❌ Error desactivando votación:', result.error);
      }
    } catch (err) {
      console.error('❌ Error inesperado desactivando votación:', err);
    }
  };

  const getVotingTypeBadge = (type: string) => {
    const types: Record<string, { label: string; type: 'primary' | 'success' | 'error' }> = {
      simple: { label: 'Simple', type: 'primary' },
      multiple: { label: 'Múltiple', type: 'success' },
      weighted: { label: 'Ponderada', type: 'error' },
    };
    return types[type] || { label: type, type: 'primary' };
  };

  const primaryActionButton =
    'inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60';
  const outlineButton =
    'inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100';
  const dangerButton =
    'inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50';
  const mutedTag =
    'inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600';

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando votaciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Votaciones ({votings.length})
          </h3>
          <p className="text-sm text-gray-500">
            Gestiona las votaciones del grupo{' '}
            <span className="font-medium text-gray-700">{groupName}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onToggleAttendance && (
            <button
              onClick={onToggleAttendance}
              className={`${outlineButton} ${isAttendanceVisible ? 'bg-gray-100 border-gray-400 text-gray-900' : ''}`}
            >
              <span className="text-base leading-none">🗒️</span>
              {isAttendanceVisible ? 'Ocultar asistencia' : 'Listas de asistencia'}
            </button>
          )}
          <button
            onClick={() => setShowCreateVotingModal(true)}
            className={primaryActionButton}
          >
            <span className="text-base leading-none">＋</span>
            Nueva votación
          </button>
        </div>
      </div>

      {votings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-10 text-center">
          <p className="mb-3 text-sm text-gray-500">
            Aún no hay votaciones creadas para este grupo.
          </p>
          <button onClick={() => setShowCreateVotingModal(true)} className={primaryActionButton}>
            Crear primera votación
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {votings.map((voting) => {
            const isExpanded = expandedVoting === voting.id;
            const options = votingOptions[voting.id];
            const optionList = options ?? [];
            const optionsLoaded = options !== undefined;
            const typeBadge = getVotingTypeBadge(voting.votingType);

            return (
              <div
                key={voting.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="flex flex-1 cursor-pointer flex-col gap-3"
                      onClick={() => handleToggleVoting(voting.id)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {voting.displayOrder}. {voting.title}
                          </h3>
                          <Badge type={typeBadge.type}>{typeBadge.label}</Badge>
                          {voting.isSecret && <Badge type="error">Secreta</Badge>}
                          {!voting.isActive && <Badge type="error">Inactiva</Badge>}
                        </div>
                        {voting.description && (
                          <p className="mt-2 text-sm text-gray-600">{voting.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (voting.isActive) {
                            handleLiveVoting(voting);
                          } else {
                            await handleActivateVoting(voting);
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-200"
                      >
                        <PlayCircleIcon className="h-4 w-4" />
                        {voting.isActive ? 'Votación en vivo' : 'Iniciar votación'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(voting);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <UserPlusIcon className="h-4 w-4" />
                        Registrar voto
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewVotes(voting);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <ChartPieIcon className="h-4 w-4" />
                        Resultados
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(voting);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <EllipsisHorizontalIcon className="h-4 w-4" />
                        Acciones
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddOption(voting.id);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        <PlusCircleIcon className="h-4 w-4" />
                        Nueva opción
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(voting);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Eliminar votación
                      </button>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-transform hover:bg-gray-50 hover:text-gray-700"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVoting(voting.id);
                        }}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className={mutedTag}>
                      <span className="text-gray-400">Requerido</span>
                      <span className="font-semibold text-gray-700">{voting.requiredPercentage}%</span>
                    </span>
                    {voting.allowAbstention && (
                      <span className={mutedTag}>
                        <span className="text-gray-400">Abstención</span>
                        <span className="font-semibold text-emerald-600">Permitida</span>
                      </span>
                    )}
                    <span className={mutedTag}>
                      <span className="text-gray-400">Tipo</span>
                      <span className="font-semibold text-gray-700">{typeBadge.label}</span>
                    </span>
                    <span
                      className={`${mutedTag} ${
                        voting.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {voting.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-gray-800">
                        Resumen de votos ({votingVotes[voting.id]?.length || 0})
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewVotes(voting);
                        }}
                        className={outlineButton}
                      >
                        Ver detalle
                      </button>
                    </div>

                    {!votingVotes[voting.id] || votingVotes[voting.id].length === 0 || !optionsLoaded ? (
                      <div className="rounded-lg border border-dashed border-gray-300 bg-white py-6 text-center text-sm text-gray-500">
                        {optionsLoaded ? 'No hay votos registrados aún.' : 'Cargando resultados...'}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {optionList.map((option) => {
                            const totalVotes = votingVotes[voting.id]?.length ?? 0;
                            const optionVotes = (votingVotes[voting.id] || []).filter(
                              (vote) => vote.votingOptionId === option.id
                            );
                            const percentage =
                              totalVotes > 0 ? ((optionVotes.length / totalVotes) * 100).toFixed(1) : '0';

                            return (
                              <div key={option.id} className="rounded-lg bg-gray-50 p-3">
                                <div className="flex items-center justify-between text-sm font-medium text-gray-800">
                                  <span className="truncate pr-2">{option.optionText}</span>
                                  <span className="text-xs text-gray-500">{percentage}%</span>
                                </div>
                                <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
                                  <div
                                    className="h-1.5 rounded-full bg-indigo-500 transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <div className="mt-2 text-xs text-gray-500">{optionVotes.length} voto(s)</div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-3">
                          {(votingVotes[voting.id] || []).map((vote) => {
                            const option = optionList.find((opt) => opt.id === vote.votingOptionId);
                            return (
                              <div
                                key={vote.id}
                                className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                                    {vote.id}
                                  </span>
                                  <div>
                                    <p className="font-medium text-gray-800">
                                      {option?.optionText || 'Opción no encontrada'}
                                    </p>
                                    <p>{new Date(vote.votedAt).toLocaleString('es-ES')}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p>Unidad #{vote.propertyUnitId}</p>
                                  {vote.notes && (
                                    <p className="max-w-[160px] truncate text-gray-400" title={vote.notes}>
                                      {vote.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateVotingModal
        isOpen={showCreateVotingModal}
        onClose={() => setShowCreateVotingModal(false)}
        onSuccess={handleCreateVotingSuccess}
        businessId={businessId}
        groupId={groupId}
      />

      {selectedVotingForOption && (
        <CreateVotingOptionModal
          isOpen={showCreateOptionModal}
          onClose={() => {
            setShowCreateOptionModal(false);
            setSelectedVotingForOption(null);
          }}
          onSuccess={handleCreateOptionSuccess}
          businessId={businessId}
          groupId={groupId}
          votingId={selectedVotingForOption}
        />
      )}

      {/* Modal Ver Votos */}
      {selectedVotingForDetails && (
        <VotesDetailModal
          isOpen={showVotesDetailModal}
          onClose={() => {
            setShowVotesDetailModal(false);
            setSelectedVotingForDetails(null);
          }}
          businessId={businessId}
          groupId={groupId}
          votingId={selectedVotingForDetails.id}
          votingTitle={selectedVotingForDetails.title}
          options={votingOptions[selectedVotingForDetails.id] || []}
        />
      )}

      {/* Modal Votar */}
      {selectedVotingForDetails && (
        <VoteModal
          isOpen={showVoteModal}
          onClose={() => {
            setShowVoteModal(false);
            setSelectedVotingForDetails(null);
          }}
          onSuccess={handleVoteSuccess}
          businessId={businessId}
          groupId={groupId}
          votingId={selectedVotingForDetails.id}
          votingTitle={selectedVotingForDetails.title}
          votingType={selectedVotingForDetails.votingType}
          allowAbstention={selectedVotingForDetails.allowAbstention}
          options={votingOptions[selectedVotingForDetails.id] || []}
        />
      )}

      {/* Modal Votación en Vivo */}
      {selectedVotingForLive && (
        <LiveVotingModal
          isOpen={showLiveVotingModal}
          onClose={() => {
            setShowLiveVotingModal(false);
            setSelectedVotingForLive(null);
          }}
          businessId={businessId}
          voting={selectedVotingForLive}
          options={votingOptions[selectedVotingForLive.id] || []}
          votes={votingVotes[selectedVotingForLive.id] || []}
          onVoteSuccess={handleVoteSuccess}
        />
      )}

      {/* Modal Editar Votación */}
      {selectedVotingForEdit && (
        <EditVotingModal
          isOpen={showEditModal}
          onClose={handleEditClose}
          onSuccess={handleEditSuccess}
          businessId={businessId}
          groupId={groupId}
          voting={selectedVotingForEdit as any}
        />
      )}

      {/* Modal Eliminar Votación */}
      {selectedVotingForDelete && (
        <DeleteVotingModal
          isOpen={showDeleteModal}
          onClose={handleDeleteClose}
          onSuccess={handleDeleteSuccess}
          businessId={businessId}
          groupId={groupId}
          voting={selectedVotingForDelete as any}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteOptionConfirm}
        onClose={() => {
          setShowDeleteOptionConfirm(false);
          setOptionToDelete(null);
        }}
        onConfirm={handleDeleteOption}
        title="Eliminar opción"
        message={
          optionToDelete
            ? `¿Deseas eliminar la opción "${optionToDelete.option.optionText}"? Esta acción es permanente.`
            : '¿Deseas eliminar esta opción de votación?'
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}


