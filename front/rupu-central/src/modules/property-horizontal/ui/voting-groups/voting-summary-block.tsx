'use client';
import { VotingOption } from '../../domain/entities';

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

interface VotingSummaryBlockProps {
  voting: Voting;
  options: VotingOption[];
  votingDetails: {
    total_units: number;
    units_voted: number;
    units_pending: number;
    units: Array<{
      property_unit_number: string;
      participation_coefficient: number;
      resident_name: string | null;
      resident_id: number | null;
      has_voted: boolean;
      option_text: string | null;
      option_code: string | null;
      option_color: string | null;
      voted_at: string | null;
    }>;
  } | null;
}

export function VotingSummaryBlock({ voting, options, votingDetails }: VotingSummaryBlockProps) {
  if (!votingDetails) {
    return (
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="text-center text-gray-500">
          Cargando estadísticas...
        </div>
      </div>
    );
  }

  // Calcular estadísticas de opciones
  const totalCoefficient = 100;
  const optionStats = options.map(option => {
    const unitsWithOption = votingDetails.units.filter(unit => 
      unit.option_code === option.optionCode && unit.has_voted
    );
    
    const coefficientSum = unitsWithOption.reduce((sum, unit) => 
      sum + unit.participation_coefficient, 0
    );
    
    const percentageByCoefficient = (coefficientSum / totalCoefficient) * 100;
    const votes = unitsWithOption.length;
    const percentageOfVoted = votingDetails.total_units > 0 
      ? (votes / votingDetails.total_units) * 100 
      : 0;
    
    return {
      id: option.id,
      optionText: option.optionText,
      optionCode: option.optionCode,
      coefficientSum,
      percentageByCoefficient,
      votes,
      percentageOfVoted,
      color: option.color || '#3b82f6'
    };
  });

  // Calcular "No Votado"
  const notVotedUnits = votingDetails.units.filter(unit => !unit.has_voted);
  const notVotedCoefficient = notVotedUnits.reduce((sum, unit) => 
    sum + unit.participation_coefficient, 0
  );
  const notVotedPercentage = (notVotedCoefficient / totalCoefficient) * 100;

  // Combinar todas las estadísticas
  const allStats = [
    ...optionStats,
    {
      id: -1,
      optionText: 'No Votado',
      optionCode: 'NOT_VOTED',
      coefficientSum: notVotedCoefficient,
      percentageByCoefficient: notVotedPercentage,
      votes: notVotedUnits.length,
      percentageOfVoted: notVotedPercentage,
      color: '#6b7280'
    }
  ].sort((a, b) => b.coefficientSum - a.coefficientSum);

  // Calcular estadísticas correctas para el resumen
  const totalVotedUnits = optionStats.reduce((sum, option) => sum + option.votes, 0);
  const totalPendingUnits = notVotedUnits.length;
  const totalUnits = totalVotedUnits + totalPendingUnits;
  
  const quorumReached = (100 - notVotedPercentage) >= voting.requiredPercentage;

  return (
    <div className="mb-6 bg-white p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Opciones de Votación - COMPACTAS */}
        <div className="lg:col-span-2 h-full">
          <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-1">
            📊 Opciones de Votación
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {allStats.map((option) => {
              const isNotVoted = option.optionCode === 'NOT_VOTED';
              
              return (
                <div 
                  key={option.id} 
                  className={`bg-white border rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow ${
                    isNotVoted ? 'border-gray-300 bg-gray-50' : 'border-gray-200'
                  }`}
                >
                  {/* Header compacto */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isNotVoted ? (
                        <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">⏳</span>
                        </div>
                      ) : (
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: option.color }}
                        >
                          <span className="text-xs text-white font-bold">1</span>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-xs text-gray-900">{option.optionText}</div>
                        <div className="text-xs text-gray-500">{option.optionCode}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Métricas compactas */}
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div className="bg-blue-50 border border-blue-200 rounded p-1 text-center">
                      <div className="font-bold text-blue-700">{option.percentageByCoefficient.toFixed(1)}%</div>
                      <div className="text-blue-600">Por Coef.</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded p-1 text-center">
                      <div className="font-bold text-green-700">{option.votes}</div>
                      <div className="text-green-600">Unidades</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded p-1 text-center">
                      <div className="font-bold text-purple-700">{option.percentageOfVoted.toFixed(0)}%</div>
                      <div className="text-purple-600">Por Cant.</div>
                    </div>
                  </div>
                  
                  {/* Barra de coeficiente compacta */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Coef:</span>
                      <span>{option.coefficientSum.toFixed(3)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${
                          isNotVoted ? 'bg-gray-400' : ''
                        }`}
                        style={{
                          width: `${Math.min(option.percentageByCoefficient, 100)}%`,
                          backgroundColor: isNotVoted ? '#9ca3af' : option.color
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumen de Estadísticas - COMPACTO */}
        <div className="lg:col-span-1 h-full">
          <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-1">
            📊 Resumen
          </h3>
          
          {/* Estadísticas compactas en una sola fila - distribuidas uniformemente */}
          <div className="grid grid-cols-4 gap-2 text-xs w-full">
            {/* Total Unidades */}
            <div className="bg-gray-50 rounded p-2 border border-gray-200 text-center">
              <span className="text-gray-600 block">Total</span>
              <span className="font-bold text-lg text-gray-900">{totalUnits}</span>
            </div>
            
            {/* Han Votado */}
            <div className="bg-green-50 rounded p-2 border border-green-200 text-center">
              <span className="text-green-600 block">Votados</span>
              <span className="font-bold text-lg text-green-700">
                {totalVotedUnits}
              </span>
              <span className="text-green-600 text-xs">
                ({totalUnits > 0
                  ? ((totalVotedUnits / totalUnits) * 100).toFixed(1)
                  : '0'}%)
              </span>
            </div>
            
            {/* Pendientes */}
            <div className="bg-orange-50 rounded p-2 border border-orange-200 text-center">
              <span className="text-orange-600 block">Pendientes</span>
              <span className="font-bold text-lg text-orange-700">
                {totalPendingUnits}
              </span>
              <span className="text-orange-600 text-xs">
                ({totalUnits > 0
                  ? ((totalPendingUnits / totalUnits) * 100).toFixed(1)
                  : '0'}%)
              </span>
            </div>
            
            {/* % Requerido */}
            <div className="bg-purple-50 rounded p-2 border border-purple-200 text-center">
              <span className="text-purple-600 block">% Requerido</span>
              <span className="font-bold text-lg text-purple-700">{voting.requiredPercentage}%</span>
              <div className="mt-1">
                {(100 - notVotedPercentage) >= voting.requiredPercentage ? (
                  <span className="text-xs text-green-600 font-semibold">✅ Quórum</span>
                ) : (
                  <span className="text-xs text-red-600 font-semibold">
                    ⏳ -{((100 - notVotedPercentage) - voting.requiredPercentage).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
