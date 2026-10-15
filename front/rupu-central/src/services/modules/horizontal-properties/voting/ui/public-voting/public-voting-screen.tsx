/**
 * R3 · Votar (opción 1f): botones grandes con el color de la opción y "Confirmar voto" fijo abajo.
 * R4 · Progreso en vivo (opción 1g): confirmación + barra por coeficiente. Usa
 * `percentage_by_coefficient` del back (voting-info, consulta periódica: sirve con token de
 * grupo e individual). Cuando el administrador cierra el punto, vuelve a la lista (token de grupo).
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Spinner } from '@shared/ui';
import {
  getUnitsWithResidentsAction,
  getVotingInfoAction,
  submitPublicVoteAction,
  type GetVotingInfoResult,
} from '@/services/modules/horizontal-properties/voting/infrastructure/actions/public-voting';
import {
  StackedBar,
  VT,
  VtIcon,
  VtNotice,
  buildOptionPalette,
  formatOrder,
  formatPct,
  getOptionKind,
  getQuorumStatus,
  getWinner,
  publicVoteErrorMessage,
  resolveQuorum,
  resultsFromBackend,
  votingFontRoot,
  vtMono,
} from '../design';
import { VOTING_TIME_ZONE } from '../design/status';

type VotingInfo = NonNullable<GetVotingInfoResult['data']>;

/** Cada cuánto se refresca el progreso (ms). */
const REFRESH_MS = 4000;

interface PublicVotingScreenProps {
  votingAuthToken: string;
  residentData: { id: number; name: string; unitNumber: string };
  selectedVotingId?: number | null;
  /** "01 / 04" (si se conoce el total de votaciones del grupo). */
  orderLabel?: string;
  /** Token de grupo: hay lista a la que volver. */
  isGroupToken?: boolean;
  /** Volver a la lista de puntos (R2). */
  onBack?: () => void;
  /** Detalle por unidad (vista 1h; solo con token individual). */
  onSuccess: () => void;
  onError: (error: string) => void;
}

const formatTime = (iso?: string) => {
  const date = iso ? new Date(iso) : new Date();
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('es-CO', { timeZone: VOTING_TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false });
};

export function PublicVotingScreen({
  votingAuthToken,
  residentData,
  selectedVotingId,
  orderLabel,
  isGroupToken = false,
  onBack,
  onSuccess,
  onError,
}: PublicVotingScreenProps) {
  const [info, setInfo] = useState<VotingInfo | null>(null);
  const [totalUnits, setTotalUnits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closedNotice, setClosedNotice] = useState(false);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  const fetchInfo = useCallback(async () => {
    const result = await getVotingInfoAction({ votingAuthToken, votingId: selectedVotingId || undefined });
    if (!result.success || !result.data || !Array.isArray(result.data.options)) {
      throw new Error(result.error || result.message || 'Error al cargar la votación');
    }
    return result.data;
  }, [votingAuthToken, selectedVotingId]);

  // Carga inicial (opciones, si ya votó) y total de unidades (para "pendiente · N un.")
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [data, units] = await Promise.all([
          fetchInfo(),
          getUnitsWithResidentsAction({ publicToken: votingAuthToken }).catch(() => null),
        ]);
        if (cancelled) return;
        setInfo(data);
        setTotalUnits(units?.success && Array.isArray(units.data) ? units.data.length : 0);
      } catch {
        if (!cancelled) onErrorRef.current('Error al cargar la información de la votación');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchInfo, votingAuthToken]);

  const hasVoted = !!info?.has_voted;
  const isOpen = info?.voting.is_active !== false;

  // R4: resultados en vivo mientras el punto siga abierto; al cerrarse vuelve a la lista
  useEffect(() => {
    if (!hasVoted || !isOpen) return;
    const timer = setInterval(async () => {
      try {
        const data = await fetchInfo();
        setInfo(data);
        if (data.voting.is_active === false && isGroupToken && onBackRef.current) {
          setClosedNotice(true);
          setTimeout(() => onBackRef.current?.(), 2500);
        }
      } catch {
        /* se reintenta en el siguiente ciclo */
      }
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [hasVoted, isOpen, fetchInfo, isGroupToken]);

  const handleVote = async () => {
    if (!selectedOptionId || !info) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitPublicVoteAction({
        votingAuthToken,
        votingId: selectedVotingId || info.voting.id,
        votingOptionId: selectedOptionId,
      });
      if (!result.success) {
        setError(publicVoteErrorMessage(result.status, result.message || result.error));
        return;
      }
      setInfo(await fetchInfo());
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !info) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${votingFontRoot}`} style={{ background: VT.paper }}>
        <Spinner size="lg" text="Cargando votación..." />
      </div>
    );
  }

  const options = [...info.options].filter((o) => o.is_active !== false).sort((a, b) => a.display_order - b.display_order);
  const paletteOptions = options.map((o) => ({ id: o.id, text: o.option_text, code: o.option_code, color: o.color }));
  const palette = buildOptionPalette(paletteOptions);
  const order = orderLabel || formatOrder(info.voting.display_order ?? 1);
  const selectedOption = options.find((o) => o.id === selectedOptionId) || null;

  const backButton = (label: string) =>
    onBack ? (
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 hover:text-[#1a1a1a] max-md:min-h-11 max-md:pr-3" aria-label="Volver a la lista de puntos">
        <VtIcon name="back" size={12} />
        {label}
      </button>
    ) : (
      <span>{label}</span>
    );

  // ===================== R4 · Después de votar =====================
  if (hasVoted) {
    const quorum = resolveQuorum(info.voting.required_percentage);
    const results = resultsFromBackend(paletteOptions, info.results, totalUnits);
    const { segments, pending, participation } = results;
    const status = getQuorumStatus(participation, quorum);
    const myVote = info.my_vote;
    const voteColor = myVote ? palette.byId(myVote.voting_option_id) || palette.forText(myVote.option_text) : VT.ink;
    const winner = getWinner(segments);
    const rows = [
      ...segments.map((s) => ({ ...s, pending: false })),
      { key: 'pending', label: 'Pendiente', color: '#fff', pct: pending.pct, votes: pending.votes, coef: pending.coef, pending: true },
    ];

    return (
      <div className={`min-h-screen ${votingFontRoot}`} style={{ background: VT.paper, color: VT.ink }}>
        <div className="max-w-[480px] mx-auto min-h-screen flex flex-col p-[22px]">
          <div className={`${vtMono} flex justify-between items-center text-[11px] font-medium tracking-[.06em]`} style={{ color: VT.muted }}>
            {backButton(`VOTACIÓN ${order}`)}
            {isOpen ? (
              <span className="inline-flex items-center gap-1.5" style={{ color: VT.live }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: VT.live }} />
                EN VIVO
              </span>
            ) : (
              <span>CERRADA</span>
            )}
          </div>

          <div className="mt-[18px] px-4 py-3.5 rounded-[10px] text-white flex items-center gap-3" style={{ background: voteColor }} role="status">
            <VtIcon name="check" size={22} strokeWidth={2.5} />
            <div className="leading-tight min-w-0">
              <div className="text-[15px] font-semibold">
                Tu voto quedó registrado{myVote?.option_text ? `: ${myVote.option_text}` : ''}
              </div>
              <div className="text-xs opacity-85">
                {residentData.unitNumber}
                {myVote?.voted_at ? ` · ${formatTime(myVote.voted_at)}` : ''}
              </div>
            </div>
          </div>

          <h1 className="mt-[26px] mb-0 text-xl leading-tight font-semibold tracking-[-.015em]">{info.voting.title}</h1>

          <div className="mt-[22px]">
            <StackedBar segments={segments} quorum={quorum} height={16} radius={3} markerOverflow={4} />
          </div>
          <div className={`${vtMono} flex justify-between text-[10px] mt-1.5`} style={{ color: VT.muted }}>
            <span>% por coeficiente</span>
            <span style={{ color: VT.accent }}>quórum {quorum}%</span>
          </div>

          <div className="mt-5 flex flex-col">
            {rows.map((r) => (
              <div key={r.key} className="grid grid-cols-[12px_1fr_auto] gap-3 items-center py-3" style={{ borderBottom: `1px solid ${VT.border}` }}>
                <span className="w-3 h-3 rounded-[3px]" style={{ background: r.color, border: `1px solid ${r.pending ? VT.pendingBorder : r.color}` }} />
                <span className="text-[15px]" style={{ fontWeight: !r.pending && winner?.key === r.key ? 600 : r.pending ? 400 : 500 }}>
                  {r.label}
                  <span className={`${vtMono} text-[11px] font-normal ml-2`} style={{ color: VT.muted }}>
                    {r.votes} un.
                  </span>
                </span>
                <span className={`${vtMono} text-xl leading-none font-semibold tracking-[-.03em]`}>{formatPct(r.pct)}%</span>
              </div>
            ))}
          </div>

          <div className="mt-[22px] grid grid-cols-2 gap-2.5">
            <div className="bg-white rounded-lg px-3.5 py-3" style={{ border: `1px solid ${VT.border}` }}>
              <div className={`${vtMono} text-[10px] tracking-[.06em]`} style={{ color: VT.muted }}>PARTICIPACIÓN</div>
              <div className={`${vtMono} text-2xl leading-tight font-semibold tracking-[-.03em] mt-1`}>{formatPct(participation)}%</div>
            </div>
            <div className="bg-white rounded-lg px-3.5 py-3" style={{ border: `1px solid ${VT.border}` }}>
              <div className={`${vtMono} text-[10px] tracking-[.06em]`} style={{ color: VT.muted }}>QUÓRUM</div>
              <div className={`${vtMono} text-2xl leading-tight font-semibold tracking-[-.03em] mt-1`} style={{ color: status.fg }}>
                {status.short}
              </div>
            </div>
          </div>

          {closedNotice && (
            <div className="mt-4">
              <VtNotice tone="info">El administrador cerró este punto. Volviendo a la lista…</VtNotice>
            </div>
          )}

          <div className="mt-auto pt-8 flex flex-col items-center gap-3">
            {!isGroupToken && (
              <button
                type="button"
                onClick={onSuccess}
                className="h-10 max-md:h-11 px-4 rounded-lg bg-white text-[13px] font-medium"
                style={{ border: `1px solid ${VT.borderStrong}`, color: VT.inkSoft }}
              >
                Ver detalle por unidad
              </button>
            )}
            {isGroupToken && onBack && !isOpen && (
              <button type="button" onClick={onBack} className="h-10 max-md:h-11 px-4 rounded-lg text-white text-[13px] font-semibold" style={{ background: VT.ink }}>
                Volver a los puntos
              </button>
            )}
            <p className="m-0 text-center text-xs" style={{ color: VT.muted }}>
              {isGroupToken ? 'Se actualiza solo. Al cerrar este punto volverás a la lista.' : 'Se actualiza solo.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===================== R3 · Elegir opción =====================
  return (
    <div className={`min-h-screen ${votingFontRoot}`} style={{ background: VT.paper, color: VT.ink }}>
      <div className="max-w-[480px] mx-auto min-h-screen flex flex-col">
        <div className="px-[22px] pt-[22px] pb-6 flex flex-col gap-[18px] flex-1">
          <div className={`${vtMono} flex justify-between items-center text-[11px] font-medium tracking-[.06em]`} style={{ color: VT.muted }}>
            {backButton(`VOTACIÓN ${order}`)}
            <span>{residentData.unitNumber}</span>
          </div>

          <div>
            <h1 className="m-0 text-2xl leading-tight font-semibold tracking-[-.02em]">{info.voting.title}</h1>
            {info.voting.description && (
              <p className="mt-2.5 mb-0 text-sm leading-normal" style={{ color: VT.inkSoft }}>{info.voting.description}</p>
            )}
          </div>

          {!isOpen && <VtNotice tone="info">Esta votación no está abierta en este momento.</VtNotice>}
          {error && <VtNotice>{error}</VtNotice>}

          <div className="flex flex-col gap-2.5 mt-1.5" role="radiogroup" aria-label="Opciones de voto">
            {options.map((option) => {
              const color = palette.byId(option.id) || palette.forText(option.option_text);
              const isAbstain = getOptionKind(option.option_text, option.option_code) === 'abstain';
              const selected = selectedOptionId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={submitting || !isOpen}
                  onClick={() => setSelectedOptionId(option.id)}
                  className="min-h-[68px] rounded-[10px] flex items-center justify-between px-5 py-3 text-xl font-semibold text-left transition-[box-shadow,background-color] duration-150 disabled:opacity-60"
                  style={
                    selected
                      ? { background: color, color: '#fff', border: `1.5px solid ${color}`, boxShadow: `0 0 0 3px ${VT.paper}, 0 0 0 5px ${color}` }
                      : { background: '#fff', color: isAbstain ? VT.inkSoft : color, border: `1.5px solid ${isAbstain ? VT.pendingBorder : color}` }
                  }
                >
                  <span>{option.option_text}</span>
                  {selected && <VtIcon name="check" size={22} strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sticky bottom-0 px-[22px] pt-4 pb-[26px] bg-white flex flex-col gap-2.5" style={{ borderTop: `1px solid ${VT.border}` }}>
          <button
            type="button"
            onClick={handleVote}
            disabled={!selectedOptionId || submitting || !isOpen}
            className="h-[52px] rounded-[10px] text-white text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: VT.ink }}
          >
            {submitting ? 'Registrando voto…' : selectedOption ? `Confirmar voto: ${selectedOption.option_text}` : 'Selecciona una opción'}
          </button>
          <div className="text-center text-xs" style={{ color: VT.muted }}>Tu voto es definitivo y no se puede cambiar.</div>
        </div>
      </div>
    </div>
  );
}
