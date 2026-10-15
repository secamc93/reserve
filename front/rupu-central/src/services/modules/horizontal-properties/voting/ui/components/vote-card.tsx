/**
 * Componente: Ficha de unidad (rediseño, opción 1a)
 * Ficha compacta coloreada por el voto:
 *  - con voto: fondo y borde del color de la opción, texto blanco
 *  - sin voto: blanco con borde gris (sólido = asistió, punteado = sin asistencia)
 * Clic: registra voto (pendiente) o abre la anulación (ya votó), igual que antes.
 */

import React from 'react';
import { ResidentialUnit } from './votes-by-unit-section';
import { VT, vtMono, resolveOptionColor, formatCoef } from '../design';

interface VoteCardProps {
  unit: ResidentialUnit;
  onVote?: (unit: ResidentialUnit) => void;
  onDeleteVote?: (unit: ResidentialUnit) => void;
  votingActive?: boolean;
  /** Texto a mostrar en la ficha (por defecto, el número de unidad). */
  label?: string;
  /** Resolución de color por texto de opción (paleta de la pantalla). */
  resolveColor?: (optionText?: string, fallbackColor?: string) => string;
}

export function VoteCard({ unit, onVote, onDeleteVote, votingActive = false, label, resolveColor }: VoteCardProps) {
  const noAttendance = unit.hasAttendance === false && !unit.hasVoted;
  const voteColor = unit.hasVoted
    ? resolveColor
      ? resolveColor(unit.votedOption, unit.votedOptionColor)
      : resolveOptionColor(unit.votedOption, null, unit.votedOptionColor)
    : null;

  const style: React.CSSProperties = voteColor
    ? { background: voteColor, border: `1px solid ${voteColor}`, color: '#fff' }
    : {
        background: '#fff',
        border: `1px ${noAttendance ? 'dashed' : 'solid'} ${noAttendance ? VT.pendingBorder : VT.borderStrong}`,
        color: VT.muted,
      };

  const action = unit.hasVoted ? onDeleteVote : onVote;
  const clickable = !!action && votingActive;

  const status = unit.hasVoted
    ? `Votó: ${unit.votedOption || 'registrado'}`
    : noAttendance
      ? 'Sin asistencia'
      : 'Pendiente';
  const hint = clickable ? (unit.hasVoted ? ' · clic para anular el voto' : ' · clic para registrar voto') : '';
  const title = `${unit.number} · ${unit.resident} · coef ${formatCoef(unit.participationCoefficient || 0)}% · ${status}${hint}`;

  const className = `h-[34px] min-w-0 rounded-[5px] flex items-center justify-center px-1 text-[11px] font-medium tracking-[-.02em] truncate ${vtMono} transition-[transform,box-shadow] duration-150`;

  if (!clickable) {
    return (
      <div className={className} style={style} title={title}>
        <span className="truncate">{label ?? unit.number}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => action?.(unit)}
      className={`${className} cursor-pointer hover:-translate-y-px hover:shadow-[0_2px_6px_rgba(0,0,0,.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#c8603f]`}
      style={style}
      title={title}
      aria-label={title}
    >
      <span className="truncate">{label ?? unit.number}</span>
    </button>
  );
}
