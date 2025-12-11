'use client';

import { useState, useEffect } from 'react';
import { Spinner } from '@shared/ui';
import {
  getPublicVotingOptionsAction,
  getUnitsWithResidentsAction
} from '@/services/modules/horizontal-properties/voting/infrastructure/actions/public-voting';
import { usePublicVotingSSE } from './hooks/use-public-voting-sse';

interface SSEVote {
  id: number;
  voting_id: number;
  resident_id: number;
  voting_option_id: number;
  voted_at: string;
  option_text?: string;
  option_code?: string;
  option_color?: string;
}
import { VotesByUnitSection } from '../components';
import type { ResidentialUnit } from '../components';

interface VotingOption {
  id: number;
  option_text: string;
  option_code: string;
  color?: string; // ✅ Color de la opción
}

interface UnitWithResident {
  property_unit_id: number;
  property_unit_number: string;
  resident_id: number | null;
  resident_name: string | null;
  participation_coefficient?: number; // Coeficiente de participación (opcional)
}

interface PublicVote {
  id: number;
  voting_id: number;
  resident_id: number;
  voting_option_id: number;
  voted_at: string;
  option_text?: string;
  option_code?: string;
  option_color?: string;
}

interface PublicVotingProgressProps {
  votingAuthToken: string;
}

interface VoteProgress {
  optionId: number;
  optionText: string;
  optionCode: string;
  voteCount: number;
  percentage: number; // Porcentaje principal (por coeficiente)
  coefficientSum?: number;
  percentageByCoefficient?: number;
  percentageByCount?: number;
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
    color?: string;
  };
  votedAt?: string;
}

export function PublicVotingProgress({ votingAuthToken }: PublicVotingProgressProps) {
  const [options, setOptions] = useState<VotingOption[]>([]);
  const [units, setUnits] = useState<UnitWithResident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook SSE para actualizaciones en tiempo real
  const {
    votes: sseVotes,
    totalVotes: sseTotalVotes,
    isConnected,
    connectionStatus
  } = usePublicVotingSSE(votingAuthToken, true);

  // Usar solo votos del SSE (incluye precarga inicial)
  const currentVotes = sseVotes;
  const currentTotalVotes = sseTotalVotes;

  // Log solo para SSE
  if (sseVotes.length > 0) {
    console.log('📡 SSE - Votos:', sseVotes.length, '| Colores:', sseVotes.some(v => v.option_color) ? 'Sí' : 'No');
  }

  // Calcular estadísticas básicas
  const totalUnits = units.length;
  const totalVotes = currentTotalVotes;
  const participationPercentage = totalUnits > 0 ? (totalVotes / totalUnits) * 100 : 0;

  // Calcular progreso de votación con coeficientes
  const totalCoefficient = 100; // Suma total de coeficientes (normalizada a 100)
  const defaultCoefficient = units.length > 0 ? totalCoefficient / units.length : 1; // Coeficiente por defecto igual para todas

  const voteProgress: VoteProgress[] = options.map(option => {
    // Filtrar votos por esta opción
    const votesForOption = currentVotes.filter(vote => vote.voting_option_id === option.id);

    // Calcular suma de coeficientes de las unidades que votaron por esta opción
    const coefficientSum = votesForOption.reduce((sum, vote) => {
      // Buscar la unidad correspondiente al voto
      const unit = units.find(u => u.property_unit_id === vote.property_unit_id);
      const coefficient = unit?.participation_coefficient || defaultCoefficient;
      return sum + coefficient;
    }, 0);

    const voteCount = votesForOption.length;

    // Porcentaje por coeficiente (el válido legalmente)
    const percentageByCoefficient = (coefficientSum / totalCoefficient) * 100;

    // Porcentaje por cantidad de votos (participación efectiva)
    const percentageByCount = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

    return {
      optionId: option.id,
      optionText: option.option_text,
      optionCode: option.option_code,
      voteCount,
      percentage: percentageByCoefficient, // Usar porcentaje por coeficiente como principal
      coefficientSum,
      percentageByCoefficient,
      percentageByCount
    };
  });

  // Calcular estado de votación por unidad
  const unitVoteStatus: UnitVoteStatus[] = units.map(unit => {
    const unitVote = currentVotes.find(vote => vote.property_unit_id === unit.property_unit_id);
    const hasVoted = !!unitVote;

    let votedOption = undefined;
    if (hasVoted && unitVote) {
      // Buscar la opción correspondiente para obtener el color si no viene del SSE
      const matchedOption = options.find(opt => opt.id === unitVote.voting_option_id);

      // Validar si los datos del SSE son válidos
      const sseDataValid = unitVote.option_text &&
        unitVote.option_text !== 'undefined' &&
        unitVote.option_text !== 'null' &&
        unitVote.option_color &&
        unitVote.option_color !== 'undefined' &&
        unitVote.option_color !== 'null';

      if (sseDataValid) {
        // ✅ Usar datos válidos del SSE
        votedOption = {
          id: unitVote.voting_option_id,
          text: unitVote.option_text!,
          code: unitVote.option_code || '',
          color: unitVote.option_color
        };
      } else if (matchedOption) {
        // ⚠️ Datos del SSE inválidos o sin color, usar opción de la lista
        votedOption = {
          id: matchedOption.id,
          text: matchedOption.option_text,
          code: matchedOption.option_code,
          color: matchedOption.color // ✅ Usar el color de la opción cargada
        };
      }
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

  // Mapear a formato reutilizable de tarjetas simples como en votación en vivo
  const residentialUnits: ResidentialUnit[] = unitVoteStatus.map((unit, index) => {
    // Buscar la unidad original para obtener el coeficiente
    const originalUnit = units.find(u => u.property_unit_id === unit.unitId);

    return {
      id: index + 1,
      number: unit.unitNumber,
      resident: unit.residentName || 'Sin residente',
      propertyUnitId: unit.unitId,
      residentId: null,
      hasVoted: unit.hasVoted,
      votedOption: unit.votedOption?.text,
      votedOptionId: unit.votedOption?.id,
      votedOptionColor: unit.votedOption?.color, // Usar el color del SSE
      participationCoefficient: originalUnit?.participation_coefficient || defaultCoefficient,
    };
  });

  useEffect(() => {
    const loadVotingProgress = async () => {
      try {
        setLoading(true);

        // Cargar solo opciones y unidades (los votos vienen del SSE)
        const [optionsResult, unitsResult] = await Promise.all([
          getPublicVotingOptionsAction({ publicToken: votingAuthToken }),
          getUnitsWithResidentsAction({ publicToken: votingAuthToken })
        ]);


        if (optionsResult.success && optionsResult.data) {
          setOptions(optionsResult.data.options);
        }

        if (unitsResult.success && unitsResult.data) {
          setUnits(unitsResult.data);
        }

        // Los votos se cargan automáticamente desde el SSE


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
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${isConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
                }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
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

        {/* Estado por unidad - Reutiliza las mismas tarjetas simples de la votación en vivo */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <VotesByUnitSection
            units={residentialUnits}
            title="🏠 Votos por Unidad"
            showPreviewNote={false}
            showScaleControl={true}
            fillAvailableSpace={false}
          />
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
