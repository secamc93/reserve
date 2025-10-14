'use client';

import { useState, useEffect } from 'react';
import { Spinner } from '@shared/ui';
import { 
  getPublicVotingOptionsAction,
  getUnitsWithResidentsAction,
  getPublicVotesAction
} from '@/modules/property-horizontal/infrastructure/actions/public-voting';
import { usePublicVotingSSE } from './hooks/use-public-voting-sse';

interface VotingOption {
  id: number;
  option_text: string;
  option_code: string;
}

interface UnitWithResident {
  property_unit_id: number;
  property_unit_number: string;
  resident_id: number | null;
  resident_name: string | null;
}

interface PublicVote {
  id: number;
  voting_id: number;
  resident_id: number;
  voting_option_id: number;
  voted_at: string;
}

interface PublicVotingProgressProps {
  votingAuthToken: string;
}

interface VoteProgress {
  optionId: number;
  optionText: string;
  optionCode: string;
  voteCount: number;
  percentage: number;
}

interface UnitVoteStatus {
  unitId: number;
  unitNumber: string;
  residentName: string | null;
  hasVoted: boolean;
  votedOption?: {
    id: number;
    text: string;
    code: string;
  };
  votedAt?: string;
}

export function PublicVotingProgress({ votingAuthToken }: PublicVotingProgressProps) {
  const [options, setOptions] = useState<VotingOption[]>([]);
  const [units, setUnits] = useState<UnitWithResident[]>([]);
  const [votes, setVotes] = useState<PublicVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook SSE para actualizaciones en tiempo real
  const { 
    votes: sseVotes, 
    totalVotes: sseTotalVotes, 
    isConnected, 
    connectionStatus 
  } = usePublicVotingSSE(votingAuthToken, true);

  // Usar votos de SSE si están disponibles, sino usar votos iniciales
  const currentVotes = sseVotes.length > 0 ? sseVotes : votes;
  const currentTotalVotes = sseTotalVotes > 0 ? sseTotalVotes : votes.length;

  // Calcular progreso de votación
  const voteProgress: VoteProgress[] = options.map(option => {
    console.log('🔍 [PROGRESS] Procesando opción:', option);
    const voteCount = currentVotes.filter(vote => vote.voting_option_id === option.id).length;
    const totalVotes = currentTotalVotes;
    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
    
    return {
      optionId: option.id,
      optionText: option.option_text,
      optionCode: option.option_code,
      voteCount,
      percentage
    };
  });

  // Calcular estado de votación por unidad
  const unitVoteStatus: UnitVoteStatus[] = units.map(unit => {
    console.log('🔍 [PROGRESS] Procesando unidad:', unit);
    const unitVote = currentVotes.find(vote => vote.resident_id === unit.resident_id);
    const hasVoted = !!unitVote;
    
    let votedOption = undefined;
    if (hasVoted && unitVote) {
      const option = options.find(opt => opt.id === unitVote.voting_option_id);
      votedOption = option ? {
        id: option.id,
        text: option.option_text,
        code: option.option_code
      } : undefined;
    }

    return {
      unitId: unit.property_unit_id,
      unitNumber: unit.property_unit_number,
      residentName: unit.resident_name,
      hasVoted,
      votedOption,
      votedAt: unitVote?.voted_at
    };
  });

  const totalUnits = units.length;
  const totalVotes = currentTotalVotes;
  const participationPercentage = totalUnits > 0 ? (totalVotes / totalUnits) * 100 : 0;

  useEffect(() => {
    const loadVotingProgress = async () => {
      try {
        console.log('📊 [PROGRESS] Cargando progreso de votación...');
        setLoading(true);

        // Cargar datos en paralelo
        const [optionsResult, unitsResult, votesResult] = await Promise.all([
          getPublicVotingOptionsAction({ publicToken: votingAuthToken }),
          getUnitsWithResidentsAction({ publicToken: votingAuthToken }),
          getPublicVotesAction({ publicToken: votingAuthToken })
        ]);

        console.log('📥 [PROGRESS] Resultados:', {
          options: optionsResult.success,
          units: unitsResult.success,
          votes: votesResult.success,
          optionsData: optionsResult.data,
          unitsData: unitsResult.data,
          votesData: votesResult.data
        });

        if (optionsResult.success && optionsResult.data) {
          setOptions(optionsResult.data.options);
        }

        if (unitsResult.success && unitsResult.data) {
          setUnits(unitsResult.data);
        }

        if (votesResult.success && votesResult.data) {
          setVotes(votesResult.data);
        }

        console.log('✅ [PROGRESS] Progreso cargado:', {
          options: optionsResult.data?.options?.length || 0,
          units: unitsResult.data?.length || 0,
          votes: votesResult.data?.length || 0
        });

      } catch (err) {
        console.error('❌ [PROGRESS] Error cargando progreso:', err);
        setError('Error al cargar el progreso de votación');
      } finally {
        setLoading(false);
      }
    };

        loadVotingProgress();
      }, [votingAuthToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando progreso de votación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Progreso de Votación
            </h1>
            <p className="text-gray-600">
              Sigue el desarrollo de la votación en tiempo real
            </p>
            
            {/* Indicador de conexión SSE */}
            <div className="mt-4 flex items-center justify-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                }`}></div>
                {isConnected ? 'Conectado en tiempo real' : 'Conectando...'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumen de participación */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📈 Resumen de Participación
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de unidades:</span>
                <span className="font-semibold">{totalUnits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Votos emitidos:</span>
                <span className="font-semibold text-blue-600">{totalVotes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Participación:</span>
                <span className="font-semibold text-green-600">
                  {participationPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${participationPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Resultados por opción */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              🗳️ Resultados por Opción
            </h2>
            <div className="space-y-4">
              {voteProgress.map((progress, index) => (
                <div key={progress.optionId || `option-${index}`} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">
                      {progress.optionText}
                    </span>
                    <span className="text-sm text-gray-600">
                      {progress.voteCount} votos ({progress.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Estado por unidad - Estilo de votación en vivo */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              🏠 Votos por Unidad
            </h2>
          </div>
          
          {/* Cuadrícula de Unidades Residenciales con scroll independiente */}
          <div className="h-[60vh] overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 px-4 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 pb-4">
              {unitVoteStatus.map((unit, index) => {
                // Colores por defecto según si votó o no
                const colors = unit.hasVoted ? {
                  bg: 'bg-green-50',
                  border: 'border-green-300',
                  iconBg: 'bg-green-100',
                  iconText: 'text-green-700',
                  badge: 'success' as const
                } : {
                  bg: 'bg-white',
                  border: 'border-gray-300',
                  iconBg: 'bg-gray-100',
                  iconText: 'text-gray-500',
                  badge: 'error' as const
                };

                return (
                  <div 
                    key={unit.unitId || `unit-${index}`}
                    className={`p-4 rounded-xl border-2 text-center transition-all hover:shadow-md ${colors.bg} ${colors.border}`}
                  >
                    <div className={`w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full font-bold text-lg ${colors.iconBg} ${colors.iconText}`}>
                      {unit.unitNumber}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm mb-1 truncate" title={unit.residentName || 'Sin residente'}>
                      {unit.residentName || 'Sin residente'}
                    </p>
                    <p className="text-gray-500 text-xs mb-2">Unidad {unit.unitNumber}</p>
                    {unit.hasVoted && unit.votedOption ? (
                      <div className="space-y-1">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          colors.badge === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          ✅ {unit.votedOption.text}
                        </div>
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        ⏳ Pendiente
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">💡</span>
            <p className="text-sm text-blue-800">
              Esta información se actualiza automáticamente. Los resultados finales se mostrarán cuando termine la votación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
