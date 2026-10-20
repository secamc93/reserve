/**
 * Componente: Progreso público de la votación (rediseño, opción 1h)
 * Encabezado con participación, fila de la votación con barra apilada por
 * coeficiente + marcador de quórum, leyenda y fichas por unidad.
 */

'use client';

import { Spinner } from '@shared/ui';
import { VotesByUnitSection } from '../components';
import { usePublicVotingResults } from './hooks/use-public-voting-results';
import {
  StackedBar,
  VT,
  votingFontRoot,
  vtMono,
  formatOrder,
  formatPct,
  getQuorumStatus,
  getWinner,
} from '../design';

interface PublicVotingProgressProps {
  votingAuthToken: string;
}

export function PublicVotingProgress({ votingAuthToken }: PublicVotingProgressProps) {
  const {
    loading,
    error,
    isConnected,
    meta,
    quorum,
    palette,
    results,
    residentialUnits,
  } = usePublicVotingResults(votingAuthToken, true);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${votingFontRoot}`} style={{ background: VT.paper }}>
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm" style={{ color: VT.inkSoft }}>Cargando progreso de votación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${votingFontRoot}`} style={{ background: VT.paper }}>
        <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full" style={{ border: `1px solid ${VT.border}` }}>
          <h2 className="text-xl font-semibold mb-3" style={{ color: VT.live }}>Error</h2>
          <p className="text-sm mb-6" style={{ color: VT.inkSoft }}>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-10 max-md:h-11 px-5 rounded-full text-sm font-semibold text-white"
            style={{ background: VT.brand }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { segments, participation, votedUnits, totalUnits } = results;
  const winner = getWinner(segments);
  const status = getQuorumStatus(participation, quorum);

  return (
    <div className={`min-h-screen ${votingFontRoot}`} style={{ background: VT.paper, color: VT.ink }}>
      <div className="max-w-[1100px] mx-auto px-4 sm:px-12 py-8 sm:py-10 flex flex-col gap-7">
        {/* Encabezado */}
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div className="min-w-0">
            <div className={`${vtMono} flex items-center gap-2 text-[11px] font-medium tracking-[.06em] mb-2`} style={{ color: VT.muted }}>
              PROGRESO DE VOTACIÓN
              <span
                className="inline-flex items-center gap-1.5"
                style={{ color: isConnected ? VT.live : VT.muted }}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'animate-pulse' : ''}`}
                  style={{ background: isConnected ? VT.live : VT.muted }}
                />
                {isConnected ? 'EN VIVO' : 'CONECTANDO'}
              </span>
            </div>
            <h1 className="m-0 text-[26px] font-semibold tracking-[-.02em]">{meta?.title || 'Votación'}</h1>
          </div>
          <div className="text-right">
            <div className={`${vtMono} text-[10px] tracking-[.06em]`} style={{ color: VT.muted }}>PARTICIPACIÓN</div>
            <div className={`${vtMono} text-[28px] leading-[1.1] font-semibold tracking-[-.03em]`}>
              {formatPct(participation)}%{' '}
              <span className="text-[13px] font-normal" style={{ color: VT.muted }}>
                · {votedUnits}/{totalUnits}
              </span>
            </div>
          </div>
        </div>

        {/* Fila de la votación */}
        <div className="flex flex-col gap-3">
          <div
            className="bg-white rounded-2xl px-4 sm:px-[22px] py-[18px] grid grid-cols-[32px_1fr_auto] md:grid-cols-[40px_1fr_minmax(200px,300px)_110px] gap-x-4 md:gap-x-[22px] gap-y-3 items-center"
            style={{ border: `1px solid ${VT.border}` }}
          >
            <div className={`${vtMono} text-[13px] font-medium`} style={{ color: VT.muted }}>
              {formatOrder(meta?.display_order ?? 1)}
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold truncate">{meta?.title || 'Votación en curso'}</div>
              <div className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: VT.muted }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: VT.live }} />
                En curso · {votedUnits} {votedUnits === 1 ? 'voto' : 'votos'} ·{' '}
                <span style={{ color: status.fg }}>{status.label}</span>
              </div>
            </div>
            <div className="col-span-3 md:col-span-1 row-start-2 md:row-start-auto">
              <StackedBar segments={segments} quorum={quorum} height={12} radius={3} markerOverflow={4} />
            </div>
            <div
              className={`${vtMono} text-right text-[22px] leading-none font-semibold tracking-[-.03em] col-start-3 row-start-1 md:col-start-auto md:row-start-auto`}
              style={{ color: winner ? winner.color : VT.pendingBorder }}
              title={winner ? `${winner.label}: ${formatPct(winner.pct)}% del coeficiente` : 'Sin votos'}
            >
              {winner ? `${formatPct(winner.pct)}%` : '—'}
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 text-[11px]" style={{ color: VT.inkSoft }}>
          {segments.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[2px]" style={{ background: s.color }} />
              {s.label}
              <span className={vtMono} style={{ color: VT.muted }}>
                {formatPct(s.pct)}% · {s.votes} un.
              </span>
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="w-0.5 h-2.5" style={{ background: VT.accent }} />
            Quórum {quorum}%
          </span>
        </div>

        {/* Estado por unidad (mismas fichas que el panel en vivo, sin acciones) */}
        <div className="bg-white rounded-2xl p-4 sm:p-6" style={{ border: `1px solid ${VT.border}` }}>
          <VotesByUnitSection
            units={residentialUnits}
            title="Votos por unidad"
            fillAvailableSpace={false}
            showVoteButton={false}
            resolveColor={palette.forText}
          />
        </div>

        <p className="text-xs" style={{ color: VT.muted }}>
          Esta información se actualiza automáticamente. Los resultados finales se mostrarán cuando termine la votación.
        </p>
      </div>
    </div>
  );
}
