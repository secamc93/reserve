/**
 * Componente: Tarjeta de Voto
 * Muestra información de un voto en formato de tarjeta con colores adaptativos
 */

import React from 'react';
import { ResidentialUnit } from './votes-by-unit-section';

interface VoteCardProps {
  unit: ResidentialUnit;
  onVote?: (unit: ResidentialUnit) => void;
  onDeleteVote?: (unit: ResidentialUnit) => void;
  votingActive?: boolean;
}

export function VoteCard({ unit, onVote, onDeleteVote, votingActive = false }: VoteCardProps) {
  // Determinar colores según el estado del voto
  const getVoteColors = () => {
    if (!unit.hasVoted) {
      // Pendiente - Gris
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        badge: 'bg-gray-100 text-gray-800',
        accent: 'border-gray-300'
      };
    }

    const voteOption = (unit.votedOption || '').toUpperCase();
    
    if (voteOption === 'SI' || voteOption === 'SÍ' || voteOption === 'YES') {
      // Voto positivo - Verde
      return {
        bg: 'bg-green-50',
        border: 'border-green-300',
        text: 'text-green-900',
        badge: 'bg-green-100 text-green-800',
        accent: 'border-green-400'
      };
    } else if (voteOption === 'NO') {
      // Voto negativo - Rojo
      return {
        bg: 'bg-red-50',
        border: 'border-red-300',
        text: 'text-red-900',
        badge: 'bg-red-100 text-red-800',
        accent: 'border-red-400'
      };
    } else if (voteOption.includes('ABSTENCIÓN') || voteOption.includes('ABSTENCION') || voteOption === 'ABSTENCIÓN') {
      // Abstención - Amarillo/Naranja
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        text: 'text-yellow-900',
        badge: 'bg-yellow-100 text-yellow-800',
        accent: 'border-yellow-400'
      };
    } else {
      // Otro tipo de voto - Azul
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        text: 'text-blue-900',
        badge: 'bg-blue-100 text-blue-800',
        accent: 'border-blue-400'
      };
    }
  };

  const colors = getVoteColors();

  return (
    <div className={`relative rounded-lg border-2 ${colors.border} ${colors.bg} p-4 hover:shadow-md transition-all duration-200`}>
      {/* Badge de estado en la esquina superior derecha */}
      <div className="absolute top-3 right-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
          {unit.hasVoted ? (unit.votedOption || 'Votado') : 'Pendiente'}
        </span>
      </div>

      {/* Contenido principal */}
      <div className="pr-20">
        {/* Número de unidad */}
        <div className="mb-3">
          <div className={`text-xs font-semibold uppercase tracking-wider ${colors.text} opacity-70 mb-1`}>
            Unidad
          </div>
          <div className={`text-xl font-bold ${colors.text}`}>
            {unit.number}
          </div>
        </div>

        {/* Residente */}
        <div className="mb-3">
          <div className={`text-xs font-semibold uppercase tracking-wider ${colors.text} opacity-70 mb-1`}>
            Residente
          </div>
          <div className={`text-sm font-medium ${colors.text}`}>
            {unit.resident || 'Sin asignar'}
          </div>
        </div>

        {/* Coeficiente de participación */}
        <div className="mb-4">
          <div className={`text-xs font-semibold uppercase tracking-wider ${colors.text} opacity-70 mb-1`}>
            Coeficiente
          </div>
          <div className={`text-base font-semibold ${colors.text}`}>
            {unit.participationCoefficient.toFixed(3)}%
          </div>
        </div>

        {/* Barra visual del coeficiente */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${colors.accent.replace('border-', 'bg-')}`}
              style={{ width: `${Math.min(unit.participationCoefficient * 10, 100)}%` }}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="pt-3 border-t border-gray-200">
          {unit.hasVoted ? (
            onDeleteVote && (
              <button
                onClick={() => onDeleteVote(unit)}
                disabled={!votingActive}
                className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  votingActive
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Eliminar Voto
              </button>
            )
          ) : (
            onVote && (
              <button
                onClick={() => onVote(unit)}
                disabled={!votingActive}
                className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  votingActive
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Registrar Voto
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}


