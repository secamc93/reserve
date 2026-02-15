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
    // Si no tiene asistencia, mostrar en naranja/amarillo con borde punteado
    if (!unit.hasAttendance && !unit.hasVoted) {
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-300 border-dashed',
        text: 'text-orange-700',
        iconBg: 'bg-orange-500',
        hoverBg: 'hover:bg-orange-100'
      };
    }

    if (!unit.hasVoted) {
      // Pendiente - Gris
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-300',
        text: 'text-gray-700',
        iconBg: 'bg-blue-500',
        hoverBg: 'hover:bg-gray-100'
      };
    }

    const voteOption = (unit.votedOption || '').toUpperCase();

    if (voteOption === 'SI' || voteOption === 'SÍ' || voteOption === 'YES') {
      // Voto positivo - Verde
      return {
        bg: 'bg-green-50',
        border: 'border-green-300',
        text: 'text-green-700',
        iconBg: 'bg-red-500',
        hoverBg: 'hover:bg-green-100'
      };
    } else if (voteOption === 'NO') {
      // Voto negativo - Rojo
      return {
        bg: 'bg-red-50',
        border: 'border-red-300',
        text: 'text-red-700',
        iconBg: 'bg-red-500',
        hoverBg: 'hover:bg-red-100'
      };
    } else if (voteOption.includes('ABSTENCIÓN') || voteOption.includes('ABSTENCION') || voteOption === 'ABSTENCIÓN') {
      // Abstención - Amarillo
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        text: 'text-yellow-700',
        iconBg: 'bg-red-500',
        hoverBg: 'hover:bg-yellow-100'
      };
    } else {
      // Otro tipo de voto - Azul
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        text: 'text-blue-700',
        iconBg: 'bg-red-500',
        hoverBg: 'hover:bg-blue-100'
      };
    }
  };

  const colors = getVoteColors();

  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border-2 ${colors.border} ${colors.bg} ${colors.hoverBg} p-3 transition-all duration-200`}>
      {/* Número de unidad */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-bold ${colors.text} truncate`}>
          {unit.number}
        </div>
        {unit.hasVoted && unit.votedOption && (
          <div className="text-xs text-gray-500 truncate">
            {unit.votedOption}
          </div>
        )}
      </div>

      {/* Botón de acción con icono */}
      <div className="flex-shrink-0">
        {unit.hasVoted ? (
          onDeleteVote && (
            <button
              onClick={() => onDeleteVote(unit)}
              disabled={!votingActive}
              className={`p-2 rounded-lg transition-colors ${
                votingActive
                  ? `${colors.iconBg} text-white hover:opacity-90`
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Eliminar voto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )
        ) : (
          onVote && (
            <button
              onClick={() => onVote(unit)}
              disabled={!votingActive}
              className={`p-2 rounded-lg transition-colors ${
                votingActive
                  ? `${colors.iconBg} text-white hover:opacity-90`
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Registrar voto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </button>
          )
        )}
      </div>
    </div>
  );
}



