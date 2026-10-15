/**
 * Componente: Pantalla de Votación Pública (celular, por QR)
 * Rediseño: opción 1f (botones grandes con el color de la opción y confirmar
 * fijo abajo) y, después de votar, opción 1g (confirmación + resultado en vivo).
 */

'use client';

import { useState, useEffect } from 'react';
import { Alert, Spinner } from '@shared/ui';
import { getVotingInfoAction, submitPublicVoteAction } from '@/services/modules/horizontal-properties/voting/infrastructure/actions/public-voting';
import { usePublicVotingResults } from './hooks/use-public-voting-results';
import {
  StackedBar,
  VT,
  votingFontRoot,
  vtMono,
  buildOptionPalette,
  formatOrder,
  formatPct,
  getOptionKind,
  getQuorumStatus,
  resolveQuorum,
} from '../design';

interface VotingOption {
  id: number;
  option_text: string;
  option_code: string;
  display_order: number;
}

interface MyVote {
  id: number;
  voting_option_id: number;
  option_text: string;      // ✅ NUEVO
  option_code: string;      // ✅ NUEVO
  voted_at: string;
}

interface VoteResult {
  voting_option_id: number;
  option_text: string;
  vote_count: number;
  percentage: number;
}

interface PublicVotingData {
  id: number;
  title: string;
  description: string;
  voting_type?: string;
  display_order?: number;
  required_percentage?: number;
}

interface PublicVotingScreenProps {
  votingAuthToken: string;
  residentData: {
    id: number;
    name: string;
    unitNumber: string;
  };
  selectedVotingId?: number | null; // Opcional - presente cuando viene de lista de votaciones
  /** Lleva al progreso detallado de la votación (vista 1h). */
  onSuccess: () => void;
  onError: (error: string) => void;
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const formatTime = (iso?: string) => {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export function PublicVotingScreen({
  votingAuthToken,
  residentData,
  selectedVotingId,
  onSuccess,
  onError
}: PublicVotingScreenProps) {
  const [votingData, setVotingData] = useState<PublicVotingData | null>(null);
  const [options, setOptions] = useState<VotingOption[]>([]);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [myVote, setMyVote] = useState<MyVote | null>(null);
  const [, setResults] = useState<VoteResult[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resultado en vivo (1g): se activa solo después de votar
  const live = usePublicVotingResults(votingAuthToken, hasVoted);

  useEffect(() => {
    const loadData = async () => {
      await loadVotingData();
    };
    loadData();
  }, [votingAuthToken]);

  const loadVotingData = async () => {
    try {
      console.log('📊 [VOTING SCREEN] Cargando información de votación...', {
        hasSelectedVotingId: !!selectedVotingId,
        selectedVotingId
      });
      setLoading(true);

      // Para tokens individuales, el backend extrae voting_id del token
      // Para tokens de grupo, pasamos selectedVotingId como query param
      const result = await getVotingInfoAction({
        votingAuthToken,
        votingId: selectedVotingId || undefined
      });

      if (result.success && result.data) {
        // Validar que tengamos las opciones
        if (!result.data.options || !Array.isArray(result.data.options)) {
          console.error('❌ [VOTING SCREEN] Backend no retornó opciones. Estructura recibida:', result.data);
          throw new Error('El backend no retornó las opciones de votación. Por favor, contacte al administrador.');
        }

        setVotingData(result.data.voting);
        setOptions(result.data.options.sort((a: VotingOption, b: VotingOption) => a.display_order - b.display_order));
        setHasVoted(result.data.has_voted);

        // Si el residente ya votó, se muestra la confirmación con el resultado en vivo (1g)
        if (result.data.has_voted) {
          console.log('✅ [VOTING SCREEN] Residente ya votó, mostrando confirmación y resultado en vivo');
          setMyVote(result.data.my_vote || null);
          setResults(result.data.results || []);
        }
      } else {
        console.error('❌ [VOTING SCREEN] Error en la respuesta:', result.error || result.message);
        throw new Error(result.error || result.message || 'Error al cargar datos de votación');
      }
    } catch (err) {
      console.error('❌ [VOTING SCREEN] Error cargando datos de votación:', err);
      onError('Error al cargar la información de la votación');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOptionId) {
      console.warn('⚠️ [VOTE] No se seleccionó ninguna opción');
      setError('Por favor, seleccione una opción para votar');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Para tokens de grupo, necesitamos pasar voting_id explícitamente
      // Para tokens individuales, también lo pasamos (el backend lo validará contra el token)
      const votingIdToSubmit = selectedVotingId || votingData?.id;

      if (!votingIdToSubmit) {
        console.error('❌ [VOTE] No se pudo determinar voting_id');
        setError('Error: No se pudo determinar la votación');
        return;
      }

      const result = await submitPublicVoteAction({
        votingAuthToken,
        votingId: votingIdToSubmit,
        votingOptionId: selectedOptionId,
      });

      if (result.success) {
        console.log('✅ [VOTE] Voto registrado exitosamente');
        const option = options.find((o) => o.id === selectedOptionId);
        setMyVote({
          id: 0,
          voting_option_id: selectedOptionId,
          option_text: option?.option_text || '',
          option_code: option?.option_code || '',
          voted_at: new Date().toISOString(),
        });
        setHasVoted(true);
      } else {
        console.error('❌ [VOTE] Error al registrar voto:', result.error || result.message);
        setError(result.error || result.message || 'Error al registrar el voto');
      }
    } catch (err) {
      console.error('❌ [VOTE] Error registrando voto:', err);
      setError('Error de conexión. Por favor, intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${votingFontRoot}`} style={{ background: VT.paper }}>
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-sm" style={{ color: VT.inkSoft }}>Cargando votación...</p>
        </div>
      </div>
    );
  }

  const palette = buildOptionPalette(
    options.map((o) => ({ id: o.id, text: o.option_text, code: o.option_code }))
  );
  const orderLabel = `VOTACIÓN ${formatOrder(votingData?.display_order ?? 1)}`;
  const selectedOption = options.find((o) => o.id === selectedOptionId) || null;

  // ===================== 1g · Después de votar =====================
  if (hasVoted) {
    const quorum = resolveQuorum(votingData?.required_percentage ?? live.meta?.required_percentage);
    const { segments, pending, participation } = live.results;
    const status = getQuorumStatus(participation, quorum);
    const voteColor = myVote
      ? palette.byId(myVote.voting_option_id) || palette.forText(myVote.option_text)
      : VT.ink;
    const winnerKey = segments
      .filter((s) => s.votes > 0)
      .reduce<{ key: string; pct: number } | null>((best, s) => (!best || s.pct > best.pct ? s : best), null)?.key;
    const rows = [
      ...segments.map((s) => ({ ...s, pending: false })),
      { key: 'pending', label: 'Pendiente', color: '#fff', pct: pending.pct, votes: pending.votes, coef: pending.coef, pending: true },
    ];

    return (
      <div className={`min-h-screen ${votingFontRoot}`} style={{ background: VT.paper, color: VT.ink }}>
        <div className="max-w-[480px] mx-auto min-h-screen flex flex-col p-[22px]">
          <div className={`${vtMono} flex justify-between items-center text-[11px] font-medium tracking-[.06em]`} style={{ color: VT.muted }}>
            <span>{orderLabel}</span>
            <span className="inline-flex items-center gap-1.5" style={{ color: live.isConnected ? VT.live : VT.muted }}>
              <span
                className={`w-1.5 h-1.5 rounded-full ${live.isConnected ? 'animate-pulse' : ''}`}
                style={{ background: live.isConnected ? VT.live : VT.muted }}
              />
              {live.isConnected ? 'EN VIVO' : 'CONECTANDO'}
            </span>
          </div>

          {/* Confirmación */}
          <div className="mt-[18px] px-4 py-3.5 rounded-[10px] text-white flex items-center gap-3" style={{ background: voteColor }} role="status">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true" className="flex-shrink-0">
              <path d="M5 13l4 4L19 7" />
            </svg>
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

          <h1 className="mt-[26px] mb-0 text-xl leading-tight font-semibold tracking-[-.015em]">
            {votingData?.title || 'Votación'}
          </h1>

          {live.loading ? (
            <div className="flex items-center gap-2 mt-6 text-sm" style={{ color: VT.muted }}>
              <Spinner size="sm" /> Cargando resultado en vivo...
            </div>
          ) : (
            <>
              <div className="mt-[22px]">
                <StackedBar segments={segments} quorum={quorum} height={16} radius={3} markerOverflow={4} />
              </div>
              <div className={`${vtMono} flex justify-between text-[10px] mt-1.5`} style={{ color: VT.muted }}>
                <span>% por coeficiente</span>
                <span style={{ color: VT.accent }}>quórum {quorum}%</span>
              </div>

              <div className="mt-5 flex flex-col">
                {rows.map((r) => (
                  <div
                    key={r.key}
                    className="grid grid-cols-[12px_1fr_auto] gap-3 items-center py-3"
                    style={{ borderBottom: `1px solid ${VT.border}` }}
                  >
                    <span
                      className="w-3 h-3 rounded-[3px]"
                      style={{ background: r.color, border: `1px solid ${r.pending ? VT.pendingBorder : r.color}` }}
                    />
                    <span className="text-[15px]" style={{ fontWeight: !r.pending && r.key === winnerKey ? 600 : r.pending ? 400 : 500 }}>
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
            </>
          )}

          <div className="mt-auto pt-8 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onSuccess}
              className="h-10 px-4 rounded-lg bg-white text-[13px] font-medium"
              style={{ border: `1px solid ${VT.borderStrong}`, color: VT.inkSoft }}
            >
              Ver detalle por unidad
            </button>
            <p className="text-center text-xs" style={{ color: VT.muted }}>
              Se actualiza solo. Siguiente votación cuando el administrador la abra.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===================== 1f · Elegir opción =====================
  return (
    <div className={`min-h-screen ${votingFontRoot}`} style={{ background: VT.paper, color: VT.ink }}>
      <div className="max-w-[480px] mx-auto min-h-screen flex flex-col">
        <div className="px-[22px] pt-[22px] pb-6 flex flex-col gap-[18px] flex-1">
          <div className={`${vtMono} flex justify-between items-center text-[11px] font-medium tracking-[.06em]`} style={{ color: VT.muted }}>
            <span>{orderLabel}</span>
            <span>{residentData.unitNumber}</span>
          </div>

          <div>
            <h1 className="m-0 text-2xl leading-tight font-semibold tracking-[-.02em]">
              {votingData?.title || 'Votación'}
            </h1>
            {votingData?.description && (
              <p className="mt-2.5 mb-0 text-sm leading-normal" style={{ color: VT.inkSoft }}>
                {votingData.description}
              </p>
            )}
          </div>

          {/* Residente */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white rounded-lg text-[13px]" style={{ border: `1px solid ${VT.border}` }}>
            <span
              className={`${vtMono} w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0`}
              style={{ background: '#efedea' }}
            >
              {initialsOf(residentData.name)}
            </span>
            <div className="leading-tight min-w-0">
              <div className="font-semibold truncate">{residentData.name}</div>
              <div className="text-xs" style={{ color: VT.muted }}>Unidad {residentData.unitNumber}</div>
            </div>
          </div>

          {error && (
            <Alert type="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Opciones */}
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
                  disabled={submitting}
                  onClick={() => setSelectedOptionId(option.id)}
                  className="min-h-[68px] rounded-[10px] flex items-center justify-between px-5 py-3 text-xl font-semibold text-left transition-[box-shadow,background-color] duration-150 disabled:opacity-60"
                  style={
                    selected
                      ? { background: color, color: '#fff', border: `1.5px solid ${color}`, boxShadow: `0 0 0 3px ${VT.paper}, 0 0 0 5px ${color}` }
                      : {
                          background: '#fff',
                          color: isAbstain ? VT.inkSoft : color,
                          border: `1.5px solid ${isAbstain ? VT.pendingBorder : color}`,
                        }
                  }
                >
                  <span>{option.option_text}</span>
                  {selected && (
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirmar fijo abajo */}
        <div
          className="sticky bottom-0 px-[22px] pt-4 pb-[26px] bg-white flex flex-col gap-2.5"
          style={{ borderTop: `1px solid ${VT.border}` }}
        >
          <button
            type="button"
            onClick={handleVote}
            disabled={!selectedOptionId || submitting}
            className="h-[52px] rounded-[10px] text-white text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: VT.ink }}
          >
            {submitting ? (
              <>
                <Spinner size="sm" />
                <span>Registrando voto...</span>
              </>
            ) : selectedOption ? (
              `Confirmar voto: ${selectedOption.option_text}`
            ) : (
              'Selecciona una opción'
            )}
          </button>
          <div className="text-center text-xs" style={{ color: VT.muted }}>
            Tu voto es definitivo y no se puede cambiar.
          </div>
        </div>
      </div>
    </div>
  );
}
