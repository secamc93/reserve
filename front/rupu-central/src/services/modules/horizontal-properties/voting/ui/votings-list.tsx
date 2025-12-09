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
import { activateVotingAction } from '../../infrastructure/actions/activate-voting.action';
import { deactivateVotingAction } from '../../infrastructure/actions/deactivate-voting.action';
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
  InformationCircleIcon,
  ListBulletIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  StopIcon,
  BoltIcon,
  ChevronDownIcon,
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
  color?: string;
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
      <div className="flex flex-wrap items-center justify-between gap-3 px-6">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            🗳️ Votaciones ({votings.length})
          </h3>
          <p className="text-sm text-white/80 mt-1">
            Gestiona las votaciones del grupo{' '}
            <span className="font-medium text-white">{groupName}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">

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
        <div className="space-y-4 px-6 pb-6">
          {votings.map((voting) => {
            const isExpanded = expandedVoting === voting.id;
            const options = votingOptions[voting.id];
            const optionList = options ?? [];
            const optionsLoaded = options !== undefined;
            const typeBadge = getVotingTypeBadge(voting.votingType);

            // Calculate stats for chart
            const votes = votingVotes[voting.id] || [];
            const totalVotes = votes.length;

            // Generate chart data
            let currentAngle = 0;
            const chartSegments = optionList.map((option, index) => {
              const optionVotes = votes.filter(v => v.votingOptionId === option.id).length;
              const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
              const degrees = (percentage / 100) * 360;
              const start = currentAngle;
              const end = currentAngle + degrees;
              currentAngle = end;

              // Colors for segments
              const defaultColors = ['#3B82F6', '#6B7280', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
              const color = option.color || defaultColors[index % defaultColors.length];

              return { ...option, percentage, color, start, end, count: optionVotes };
            });

            const gradientString = totalVotes === 0
              ? '#E5E7EB 0deg 360deg'
              : chartSegments.map(s => `${s.color} ${s.start}deg ${s.end}deg`).join(', ');

            return (
              <div
                key={voting.id}
                className="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  {/* Fila 1: Título centrado */}
                  <div className="flex items-center justify-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 text-center">
                      {voting.displayOrder}. {voting.title}
                    </h3>
                  </div>

                  {/* Fila 2: Badge + Información + Botones */}
                  <div className="flex items-center justify-between gap-3">
                    {/* Lado izquierdo: Badge + Info */}
                    <div className="flex items-center gap-3 flex-1 flex-wrap">
                      {/* Badge de estado */}
                      <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold whitespace-nowrap ${voting.isActive
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                        }`}>
                        {voting.isActive ? 'Activa' : 'Inactiva'}
                      </span>

                      {/* Información en una fila con efectos */}
                      <div className="flex items-center gap-3 text-sm flex-wrap">
                        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 shadow-sm text-gray-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="font-semibold">% Requerido:</span>
                          <span className="font-medium">{voting.requiredPercentage}%</span>
                        </span>
                        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 shadow-sm text-gray-700">
                          <InformationCircleIcon className="w-4 h-4" />
                          <span className="font-semibold">Abstención:</span>
                          <span className="font-medium">{voting.allowAbstention ? 'Permitida' : 'No permitida'}</span>
                        </span>
                        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 shadow-sm text-gray-700">
                          <ListBulletIcon className="w-4 h-4" />
                          <span className="font-semibold">Tipo:</span>
                          <span className="font-medium">{typeBadge.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Lado derecho: Botón de votación + Botones de acción */}
                    <div className="flex items-center gap-2">
                      {/* Botón de votación en vivo */}
                      <button
                        onClick={() => handleLiveVoting(voting)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 font-semibold text-white transition-all ${voting.isActive
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-800 hover:bg-gray-900'
                          }`}
                      >
                        {voting.isActive ? (
                          <>
                            <BoltIcon className="w-4 h-4 animate-pulse" />
                            Votación en Vivo
                          </>
                        ) : (
                          <>
                            <PlayIcon className="w-4 h-4" />
                            Iniciar Votación
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleEditClick(voting)}
                        className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                        title="Editar votación"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => voting.isActive ? handleDeactivateVoting(voting) : handleActivateVoting(voting)}
                        className={`p-2 rounded-lg transition-colors ${voting.isActive
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        title={voting.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {voting.isActive ? (
                          <StopIcon className="w-5 h-5" />
                        ) : (
                          <PlayIcon className="w-5 h-5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteClick(voting)}
                        className="p-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
                        title="Eliminar votación"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleToggleVoting(voting.id)}
                        className="p-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-all"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        title={isExpanded ? 'Contraer' : 'Ver detalles y resultados'}
                      >
                        <ChevronDownIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content (Results) */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Chart */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h4 className="font-semibold mb-6 text-gray-800">Resultados de Votación ({totalVotes} votos)</h4>

                        <div className="flex flex-col items-center">
                          {/* Donut Chart */}
                          <div
                            className="relative w-56 h-56 rounded-full shadow-inner"
                            style={{ background: `conic-gradient(${gradientString})` }}
                          >
                            <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center flex-col shadow-sm">
                              <span className="text-3xl font-bold text-gray-800">{totalVotes}</span>
                              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Votos Totales</span>
                            </div>
                          </div>

                          {/* Legend */}
                          <div className="flex flex-wrap justify-center gap-4 mt-8 w-full">
                            {chartSegments.map((segment) => (
                              <div key={segment.id} className="flex items-center gap-2 text-sm">
                                <span
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: segment.color }}
                                ></span>
                                <span className="text-gray-600">{segment.optionText}:</span>
                                <span className="font-bold text-gray-900">{segment.percentage.toFixed(1)}%</span>
                                <span className="text-gray-400 text-xs">({segment.count} votos)</span>
                              </div>
                            ))}
                            {totalVotes === 0 && (
                              <span className="text-gray-400 text-sm italic">Sin votos registrados</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Individual Votes Table */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                          <h4 className="font-semibold text-gray-800">Votos Individuales</h4>
                          <button
                            onClick={() => handleViewVotes(voting)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Ver todos
                          </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-0">
                          {votes.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                              No hay votos registrados
                            </div>
                          ) : (
                            <table className="w-full text-sm text-left">
                              <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 shadow-sm">
                                <tr>
                                  <th className="px-4 py-3 font-medium">ID</th>
                                  <th className="px-4 py-3 font-medium">Opción</th>
                                  <th className="px-4 py-3 font-medium">Fecha</th>
                                  <th className="px-4 py-3 font-medium">Unidad</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {votes.map((vote) => {
                                  const option = optionList.find(o => o.id === vote.votingOptionId);
                                  const segment = chartSegments.find(s => s.id === option?.id);

                                  return (
                                    <tr key={vote.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-4 py-3 font-medium text-emerald-600">#{vote.id}</td>
                                      <td className="px-4 py-3">
                                        <span
                                          className="inline-block w-2 h-2 rounded-full mr-2"
                                          style={{ backgroundColor: segment?.color || '#ccc' }}
                                        ></span>
                                        {option?.optionText || 'Desconocido'}
                                      </td>
                                      <td className="px-4 py-3 text-gray-500">
                                        {new Date(vote.votedAt).toLocaleString('es-ES', {
                                          day: '2-digit', month: '2-digit', year: 'numeric',
                                          hour: '2-digit', minute: '2-digit'
                                        })}
                                      </td>
                                      <td className="px-4 py-3 text-gray-600">
                                        Unidad #{vote.propertyUnitId}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </div>
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


