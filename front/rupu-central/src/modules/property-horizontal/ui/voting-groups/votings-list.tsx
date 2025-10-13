/**
 * Componente: Lista de Votaciones
 */

'use client';

import { useState, useEffect } from 'react';
import { Badge, Spinner } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { getVotingsAction, getVotingOptionsAction, getVotesAction } from '../../infrastructure/actions';
import { CreateVotingModal } from './create-voting-modal';
import { CreateVotingOptionModal } from './create-voting-option-modal';
import { VotesDetailModal } from './votes-detail-modal';
import { VoteModal } from './vote-modal';
import { LiveVotingModal } from './live-voting-modal';

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
  residentId: number;
  votingOptionId: number;
  votedAt: string;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
}

interface VotingsListProps {
  hpId: number;
  groupId: number;
  groupName: string;
}

export function VotingsList({ hpId, groupId, groupName }: VotingsListProps) {
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
  const [selectedVotingForDetails, setSelectedVotingForDetails] = useState<Voting | null>(null);
  const [selectedVotingForLive, setSelectedVotingForLive] = useState<Voting | null>(null);

  useEffect(() => {
    loadVotings();
  }, [hpId, groupId]);

  const loadVotings = async () => {
    setLoading(true);
    try {
      const token = TokenStorage.getToken();
      if (!token) {
        console.error('❌ No se encontró el token');
        return;
      }

      const result = await getVotingsAction({ token, hpId, groupId });
      
      if (result.success && result.data) {
        const sortedVotings = result.data.sort((a, b) => a.displayOrder - b.displayOrder);
        setVotings(sortedVotings);
      }
    } catch (error) {
      console.error('❌ Error al cargar votaciones:', error);
    }
    setLoading(false);
  };

  const loadVotingOptions = async (votingId: number) => {
    try {
      const token = TokenStorage.getToken();
      if (!token) return;

      const result = await getVotingOptionsAction({ token, hpId, groupId, votingId });
      
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
  };

  const loadVotes = async (votingId: number) => {
    try {
      const token = TokenStorage.getToken();
      if (!token) return;

      const result = await getVotesAction({ token, hpId, groupId, votingId });
      
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

  const handleLiveVoting = async (voting: Voting) => {
    // Asegurar que las opciones estén cargadas
    if (!votingOptions[voting.id]) {
      await loadVotingOptions(voting.id);
    }
    // Asegurar que los votos estén cargados
    if (!votingVotes[voting.id]) {
      await loadVotes(voting.id);
    }
    
    setSelectedVotingForLive(voting);
    setShowLiveVotingModal(true);
  };

  const getVotingTypeBadge = (type: string) => {
    const types: Record<string, { label: string; type: 'primary' | 'success' | 'error' }> = {
      simple: { label: 'Simple', type: 'primary' },
      multiple: { label: 'Múltiple', type: 'success' },
      weighted: { label: 'Ponderada', type: 'error' },
    };
    return types[type] || { label: type, type: 'primary' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando votaciones...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header simplificado */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">
          Votaciones ({votings.length})
        </h3>
        <button
          onClick={() => setShowCreateVotingModal(true)}
          className="btn btn-primary btn-sm"
        >
          + Nueva Votación
        </button>
      </div>

      {/* Lista de Votaciones */}
      {votings.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-3">No hay votaciones creadas</p>
          <button
            onClick={() => setShowCreateVotingModal(true)}
            className="btn btn-primary btn-sm"
          >
            Crear Primera Votación
          </button>
        </div>
      ) : (
        <div className="w-full space-y-4">
          {votings.map((voting) => {
            const isExpanded = expandedVoting === voting.id;
            const options = votingOptions[voting.id] || [];
            const typeBadge = getVotingTypeBadge(voting.votingType);

            return (
              <div 
                key={voting.id}
                className="w-full border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
              >
                {/* Voting Header */}
                <div className="space-y-4">
                  <div 
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => handleToggleVoting(voting.id)}
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {voting.displayOrder}. {voting.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed mb-3">
                            {voting.description}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap ml-4">
                          <Badge type={typeBadge.type}>{typeBadge.label}</Badge>
                          {voting.isSecret && (
                            <Badge type="error">Secreta</Badge>
                          )}
                          {!voting.isActive && (
                            <Badge type="error">Inactiva</Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-medium">Requerido:</span>
                          <span className="font-semibold text-gray-900">{voting.requiredPercentage}%</span>
                        </div>
                        {voting.allowAbstention && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-medium">Abstención:</span>
                            <span className="font-semibold text-green-600">Permitida</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-medium">Tipo:</span>
                          <span className="font-semibold text-gray-900">{typeBadge.label}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-medium">Estado:</span>
                          <span className={`font-semibold ${voting.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {voting.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
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

                  {/* Botones de acción */}
                  <div className="flex gap-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLiveVoting(voting);
                      }}
                      className="btn btn-primary flex-1"
                      disabled={!voting.isActive}
                    >
                      🔴 Votación en Vivo
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewVotes(voting);
                      }}
                      className="btn btn-outline flex-1"
                    >
                      📊 Ver Votos
                    </button>
                  </div>
                </div>

                {/* Voting Options (Expandible) */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-200 bg-gray-50 -mx-4 px-4 -mb-4 pb-4 rounded-b-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold text-gray-700">
                        Opciones de Votación ({options.length})
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddOption(voting.id);
                        }}
                        className="btn btn-outline btn-sm text-xs"
                      >
                        + Agregar Opción
                      </button>
                    </div>

                    {options.length === 0 ? (
                      <div className="text-center py-4 bg-white rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 text-sm">
                          No hay opciones. Agrega la primera opción.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full font-semibold text-sm flex-shrink-0">
                                {option.displayOrder}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">
                                  {option.optionText}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {option.optionCode}
                                </p>
                              </div>
                            </div>
                            {!option.isActive && (
                              <Badge type="error" className="flex-shrink-0 ml-2">Inactiva</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sección de Resultados */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 -mx-6 px-6 -mb-6 pb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-semibold text-gray-700">
                        Resultados de Votación ({votingVotes[voting.id]?.length || 0} votos)
                      </h4>
                    </div>

                    {!votingVotes[voting.id] ? (
                      <div className="text-center py-4 bg-white rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 text-sm">
                          No hay votos registrados aún
                        </p>
                      </div>
                    ) : votingVotes[voting.id].length === 0 ? (
                      <div className="text-center py-4 bg-white rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 text-sm">
                          No hay votos registrados aún
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Resumen por opción */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <h5 className="font-medium text-gray-900 mb-3">Resumen por Opción</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {options.map((option) => {
                              const optionVotes = votingVotes[voting.id].filter(vote => vote.votingOptionId === option.id);
                              const percentage = votingVotes[voting.id].length > 0 
                                ? ((optionVotes.length / votingVotes[voting.id].length) * 100).toFixed(1)
                                : '0';
                              
                              return (
                                <div key={option.id} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-900 text-sm">
                                      {option.optionText}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {percentage}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-600">
                                      {optionVotes.length} votos
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Lista de votos individuales */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <h5 className="font-medium text-gray-900 mb-3">Votos Individuales</h5>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {votingVotes[voting.id].map((vote) => {
                              const option = options.find(opt => opt.id === vote.votingOptionId);
                              return (
                                <div key={vote.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                  <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-700 rounded-full font-semibold text-xs">
                                      {vote.id}
                                    </span>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {option?.optionText || 'Opción no encontrada'}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(vote.votedAt).toLocaleString('es-ES')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                      Residente #{vote.residentId}
                                    </p>
                                    {vote.notes && (
                                      <p className="text-xs text-gray-400 truncate max-w-32" title={vote.notes}>
                                        {vote.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
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
        hpId={hpId}
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
          hpId={hpId}
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
          hpId={hpId}
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
          hpId={hpId}
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
          hpId={hpId}
          voting={selectedVotingForLive}
          options={votingOptions[selectedVotingForLive.id] || []}
          votes={votingVotes[selectedVotingForLive.id] || []}
          onVoteSuccess={handleVoteSuccess}
        />
      )}
    </div>
  );
}

