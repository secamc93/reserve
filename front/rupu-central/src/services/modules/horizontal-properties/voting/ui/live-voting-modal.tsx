/**
 * Componente: Modal de Votación en Vivo
 * Rediseño: panel en vivo (opción 1a) y resultados ampliados con dona (opción 1e).
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Spinner, Modal } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { getVotingDetailsAction, resetVotingAction } from '@/services/modules/horizontal-properties/voting/infrastructure/actions';
import { VoteModal } from './vote-modal';
import { BulkVoteModal } from './bulk-vote-modal';
import { VotesByUnitSection, type ResidentialUnit } from './components/votes-by-unit-section';
import { VotingSummaryBlock } from './voting-summary-block';
import { useVotingSSE } from './hooks';
import { Vote } from '../domain/entities'; // ✅ Usar la interfaz oficial
import {
  VT,
  votingFontRoot,
  vtMono,
  buildOptionPalette,
  computeCoefficientResults,
  formatCoef,
  formatOrder,
  formatPct,
  getQuorumStatus,
  getWinner,
  resolveQuorum,
  type CoefficientResults,
} from './design';

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

interface ResultsOverlayProps {
  results: CoefficientResults;
  quorum: number;
  votingTitle: string;
  displayOrder: number;
  onClose: () => void;
}

/**
 * Resultados ampliados (opción 1e): dona fina con el umbral de quórum
 * dibujado sobre el anillo + tabla de resultados por coeficiente.
 */
function ResultsOverlay({ results, quorum, votingTitle, displayOrder, onClose }: ResultsOverlayProps) {
  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { segments, pending, participation } = results;
  const status = getQuorumStatus(participation, quorum);
  const winner = getWinner(segments);

  // Dona: circunferencia 100 (r = 15.9155) => el dasharray es directamente el %
  const radius = 15.91549430918954;
  let cumulative = 0;
  const donut = segments
    .filter((s) => s.pct > 0)
    .map((s) => {
      const pct = Math.min(s.pct, 100);
      const circle = (
        <circle
          key={s.key}
          r={radius}
          cx="21"
          cy="21"
          fill="transparent"
          stroke={s.color}
          strokeWidth="3"
          strokeDasharray={`${pct.toFixed(3)} ${(100 - pct).toFixed(3)}`}
          strokeDashoffset={(-cumulative).toFixed(3)}
          className="transition-all duration-500"
        />
      );
      cumulative += pct;
      return circle;
    });
  const quorumDeg = Math.min(Math.max(quorum, 0), 100) * 3.6;

  const rows = [
    ...segments.map((s) => ({ ...s, pending: false })),
    { key: 'pending', label: 'Pendiente', color: '#fff', pct: pending.pct, votes: pending.votes, coef: pending.coef, pending: true },
  ];

  return (
    <div className={`fixed inset-0 z-[70] overflow-y-auto ${votingFontRoot}`} style={{ background: VT.paper, color: VT.ink }}>
      <div className="min-h-full flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-7 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-[13px] hover:text-[#c8603f] transition-colors"
            style={{ color: VT.inkSoft }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Volver al panel
          </button>
          <span className={`${vtMono} text-[11px]`} style={{ color: VT.muted }}>Esc para cerrar</span>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-12 px-4 sm:px-10 lg:px-[72px] py-8 lg:py-12">
          {/* Dona */}
          <div className="relative w-full max-w-[440px] aspect-square justify-self-center">
            <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90" role="img" aria-label={`Resultados por coeficiente. Quórum ${quorum}%`}>
              <circle r={radius} cx="21" cy="21" fill="transparent" stroke={VT.border} strokeWidth="3" />
              {donut}
              <line x1="37.5" y1="21" x2="40.5" y2="21" stroke={VT.accent} strokeWidth=".7" transform={`rotate(${quorumDeg} 21 21)`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
              <div className={`${vtMono} text-xs tracking-[.08em]`} style={{ color: VT.muted }}>
                {winner ? `${winner.label.toUpperCase()} · MAYORÍA` : 'SIN VOTOS AÚN'}
              </div>
              <div
                className={`${vtMono} font-semibold leading-none tracking-[-.05em] mt-1.5 text-[clamp(48px,10vw,84px)]`}
                style={{ color: winner ? winner.color : VT.muted }}
              >
                {formatPct(winner ? winner.pct : 0)}
                <span className="text-[0.38em]" style={{ color: VT.muted }}>%</span>
              </div>
              <div className="text-[13px] mt-2.5" style={{ color: VT.inkSoft }}>
                de coeficiente · participación {formatPct(participation)}%
              </div>
            </div>
          </div>

          {/* Tabla de resultados */}
          <div className="flex flex-col gap-7 min-w-0">
            <div>
              <div className={`${vtMono} text-[11px] font-medium tracking-[.06em] mb-2`} style={{ color: VT.muted }}>
                RESULTADOS · VOTACIÓN {formatOrder(displayOrder)}
              </div>
              <h1 className="m-0 text-2xl sm:text-[30px] leading-[1.15] font-semibold tracking-[-.02em]">{votingTitle}</h1>
            </div>
            <div className="flex flex-col">
              {rows.map((r) => {
                const isWinner = !r.pending && winner?.key === r.key;
                return (
                  <div
                    key={r.key}
                    className="grid grid-cols-[14px_1fr_auto] sm:grid-cols-[14px_1fr_auto_auto] gap-x-3.5 gap-y-1 items-center py-3.5"
                    style={{ borderBottom: `1px solid ${VT.border}` }}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-[3px]"
                      style={{ background: r.color, border: `1px solid ${r.pending ? VT.pendingBorder : r.color}` }}
                    />
                    <span className="text-[17px] flex items-center gap-2 min-w-0" style={{ fontWeight: isWinner ? 600 : r.pending ? 400 : 500 }}>
                      <span className="truncate">{r.label}</span>
                      {isWinner && (
                        <span
                          className={`${vtMono} text-[10px] font-semibold tracking-[.06em] px-1.5 py-0.5 rounded`}
                          style={{ background: VT.paper, color: VT.inkSoft, border: `1px solid ${VT.border}` }}
                        >
                          MAYORÍA
                        </span>
                      )}
                    </span>
                    <span className={`${vtMono} text-[13px] hidden sm:block`} style={{ color: VT.muted }}>
                      {r.votes} un. · coef {formatCoef(r.coef)}
                    </span>
                    <span className={`${vtMono} text-2xl leading-none font-semibold tracking-[-.03em] min-w-[90px] text-right`}>
                      {formatPct(r.pct)}%
                    </span>
                    <span className={`${vtMono} text-xs sm:hidden col-start-2 col-span-2`} style={{ color: VT.muted }}>
                      {r.votes} un. · coef {formatCoef(r.coef)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2.5 text-[13px]" style={{ color: VT.inkSoft }}>
              <span className="w-0.5 h-4" style={{ background: VT.accent }} />
              Quórum requerido {quorum}% ·{' '}
              <strong style={{ color: status.fg }}>{status.label}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface VotingOption {
  id: number;
  votingId: number;
  optionText: string;
  optionCode: string;
  displayOrder: number;
  isActive: boolean;
  color?: string; // Color personalizado para la opción (hex)
}

// Interfaz para votos del SSE (formato del backend)
interface SSEVote {
  id: number;
  voting_id: number;
  property_unit_id: number;
  voting_option_id: number;
  option_text: string;
  option_code: string;
  color: string;
  voted_at: string;
  ip_address?: string;
  user_agent?: string;
  notes?: string;
}

interface LiveVotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number; // ID de la propiedad horizontal
  voting: Voting | null;
  options: VotingOption[];
  votes: Vote[];
  onVoteSuccess: () => void;
}

export function LiveVotingModal({
  isOpen,
  onClose,
  businessId,
  voting,
  options,
  votes: initialVotes,
  onVoteSuccess
}: LiveVotingModalProps) {
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showBulkVoteModal, setShowBulkVoteModal] = useState(false);
  const [selectedUnitForVote, setSelectedUnitForVote] = useState<ResidentialUnit | null>(null);
  const [showDeleteVoteModal, setShowDeleteVoteModal] = useState(false);
  const [selectedUnitForDelete, setSelectedUnitForDelete] = useState<ResidentialUnit | null>(null);
  const [deletingVote, setDeletingVote] = useState(false);
  const [showPieChart, setShowPieChart] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [useRealTime, setUseRealTime] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resettingVoting, setResettingVoting] = useState(false);

  // Estados para datos reales del endpoint
  const [votingDetails, setVotingDetails] = useState<{
    units: Array<{
      property_unit_id: number; // ✅ NUEVO: ID de la unidad para mapeo correcto
      property_unit_number: string;
      participation_coefficient: number;
      resident_name: string | null;
      resident_id: number | null; // ✅ NUEVO: ID del residente para mapeo correcto
      has_voted: boolean;
      has_attendance: boolean; // ✅ NUEVO: Indica si tiene asistencia marcada
      option_text: string | null;
      option_code: string | null;
      option_color: string | null; // ✅ NUEVO: Color del voto del backend
      voted_at: string | null;
    }>;
    total_units: number;
    units_voted: number;
    units_pending: number;
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Hook SSE para recibir votos en tiempo real
  const {
    votes: sseVotes,
    isConnected: sseConnected,
    totalVotes: sseTotalVotes,
    error: sseError,
    connectionStatus,
    deletedVotes // ✅ NUEVO: Votos eliminados del SSE
  } = useVotingSSE(
    businessId,
    voting?.votingGroupId || 0,
    voting?.id || 0,
    isOpen && useRealTime && voting?.isActive
  );

  const loadVotingDetails = useCallback(async () => {
    if (!voting || !businessId) return;

    setLoadingDetails(true);
    setDetailsError(null);

    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const result = await getVotingDetailsAction({
        businessId: businessId,
        votingGroupId: voting.votingGroupId,
        votingId: voting.id,
        token
      });

      if (result.success && result.data) {
        setVotingDetails(result.data);
        setProcessedVoteIds(new Set()); // Limpiar votos procesados al cargar nueva votación
        console.log('✅ Datos de votación cargados:', result.data);
      } else {
        setDetailsError(result.error || 'Error al cargar los detalles de votación');
      }
    } catch (error) {
      console.error('Error cargando detalles de votación:', error);
      setDetailsError(error instanceof Error ? error.message : 'Error inesperado');
    } finally {
      setLoadingDetails(false);
    }
  }, [voting, businessId]);

  // Estado para trackear los votos ya procesados
  const [processedVoteIds, setProcessedVoteIds] = useState<Set<number>>(new Set());
  const [processedDeletedVoteIds, setProcessedDeletedVoteIds] = useState<Set<number>>(new Set());

  const updateVotingDetailsFromSSE = useCallback(() => {
    console.log('🔄 [updateVotingDetailsFromSSE] Ejecutándose');
    console.log('🔄 [updateVotingDetailsFromSSE] votingDetails:', votingDetails);
    console.log('🔄 [updateVotingDetailsFromSSE] sseVotes.length:', sseVotes.length);

    if (!votingDetails || !sseVotes.length) {
      console.log(`⚠️ No se puede actualizar: votingDetails=${!!votingDetails}, sseVotes.length=${sseVotes.length}`);
      return;
    }

    // Filtrar solo votos nuevos (no procesados)
    const newVotes = sseVotes.filter(vote => !processedVoteIds.has(vote.id));

    if (newVotes.length === 0) {
      // No hay votos nuevos para procesar
      return;
    }

    // Logs de debugging eliminados para reducir ruido

    // Marcar estos votos como procesados
    setProcessedVoteIds(prev => {
      const newSet = new Set(prev);
      newVotes.forEach(vote => newSet.add(vote.id));
      return newSet;
    });

    // Actualizar solo las unidades que han votado
    setVotingDetails(prevDetails => {
      if (!prevDetails) return prevDetails;

      const updatedUnits = [...prevDetails.units];
      let newUnitsVoted = 0;

      // Para cada nuevo voto, actualizar la unidad correspondiente
      newVotes.forEach(sseVote => {
        const unitIndex = updatedUnits.findIndex(unit => unit.property_unit_id === sseVote.property_unit_id);

        if (unitIndex !== -1) {
          const currentUnit = updatedUnits[unitIndex];

          // ✅ CRÍTICO: Solo actualizar si la unidad NO tiene datos válidos ya
          const hasValidData = currentUnit.has_voted &&
            currentUnit.option_text &&
            currentUnit.option_text !== 'undefined' &&
            currentUnit.option_text !== 'null' &&
            currentUnit.option_color &&
            currentUnit.option_color !== 'undefined' &&
            currentUnit.option_color !== 'null';

          if (hasValidData) {
            console.log(`⏭️ [SSE] Saltando unidad ${currentUnit.property_unit_number} - ya tiene datos válidos`);
            return; // No sobrescribir datos válidos existentes
          }

          // Verificar que los datos del SSE sean válidos antes de actualizar
          const sseDataValid = sseVote.option_text &&
            sseVote.option_text !== 'undefined' &&
            sseVote.color &&
            sseVote.color !== 'undefined';

          if (!sseDataValid) {
            console.log(`⚠️ [SSE] Datos inválidos para unidad ${currentUnit.property_unit_number}, ignorando`);
            return; // No actualizar con datos inválidos
          }

          console.log(`✅ [SSE] Actualizando unidad ${currentUnit.property_unit_number} con voto "${sseVote.option_text}"`);

          updatedUnits[unitIndex] = {
            ...updatedUnits[unitIndex],
            has_voted: true,
            option_text: sseVote.option_text,
            option_code: sseVote.option_code,
            option_color: sseVote.color,
            voted_at: sseVote.voted_at,
          };
          newUnitsVoted++;
        } else {
          console.warn(`⚠️ No se encontró unidad para property_unit_id: ${sseVote.property_unit_id}`);
        }
      });

      // Log de estadísticas eliminado para reducir ruido

      return {
        ...prevDetails,
        units: updatedUnits,
        units_voted: prevDetails.units_voted + newUnitsVoted,
        units_pending: prevDetails.units_pending - newUnitsVoted,
      };
    });
  }, [sseVotes, votingDetails, options, processedVoteIds]);

  // Cargar detalles de votación cuando se abre el modal
  useEffect(() => {
    if (isOpen && voting && businessId) {
      loadVotingDetails();
    }
  }, [isOpen, voting, businessId, loadVotingDetails]);

  // Estado para los colores personalizados de cada opción (solo para override temporal)
  const [optionColors, setOptionColors] = useState<Record<number, string>>({});

  // Estado para errores de configuración de colores
  const [colorConfigError, setColorConfigError] = useState<string | null>(null);

  // useEffect para validar colores cuando se cargan las opciones
  useEffect(() => {
    if (options && options.length > 0) {
      const error = validateOptionColors();
      setColorConfigError(error);
    }
  }, [options, optionColors]);

  // Actualizar datos cuando llegan nuevos votos via SSE (sin recargar todo el endpoint)
  useEffect(() => {
    if (sseVotes.length > 0 && votingDetails) {
      // Log de SSE eliminado para reducir ruido
      updateVotingDetailsFromSSE();
    }
  }, [sseVotes, updateVotingDetailsFromSSE, votingDetails]); // ✅ CORREGIDO: usar sseVotes en lugar de sseVotes.length

  // Procesar votos eliminados del SSE
  useEffect(() => {
    if (deletedVotes.length === 0 || !votingDetails) return;

    // Filtrar solo votos eliminados nuevos (no procesados)
    const newDeletedVotes = deletedVotes.filter(dv => !processedDeletedVoteIds.has(dv.id));

    if (newDeletedVotes.length === 0) return;

    console.log('🗑️ Procesando votos eliminados del SSE:', newDeletedVotes);

    // Marcar como procesados
    setProcessedDeletedVoteIds(prev => {
      const newSet = new Set(prev);
      newDeletedVotes.forEach(dv => newSet.add(dv.id));
      return newSet;
    });

    setVotingDetails(prevDetails => {
      if (!prevDetails) return prevDetails;

      const updatedUnits = prevDetails.units.map(unit => {
        // Verificar si esta unidad tiene un voto eliminado
        const wasDeleted = newDeletedVotes.some(dv => dv.property_unit_id === unit.property_unit_id);

        if (wasDeleted) {
          console.log(`🔄 Reseteando voto de unidad ${unit.property_unit_number}`);
          // Resetear el voto de esta unidad
          return {
            ...unit,
            has_voted: false,
            option_text: null,
            option_code: null,
            option_color: null,
            voted_at: null,
          };
        }

        return unit;
      });

      // Contar cuántos votos se eliminaron
      const deletedCount = newDeletedVotes.length;

      return {
        ...prevDetails,
        units: updatedUnits,
        units_voted: Math.max(0, prevDetails.units_voted - deletedCount),
        units_pending: Math.min(prevDetails.total_units, prevDetails.units_pending + deletedCount),
      };
    });

    // Limpiar los votos eliminados del estado validVoteData
    newDeletedVotes.forEach(dv => {
      setValidVoteData(prev => {
        const newMap = new Map(prev);
        newMap.delete(dv.property_unit_id);
        return newMap;
      });
    });
  }, [deletedVotes, votingDetails, processedDeletedVoteIds]);

  // Estado para mantener los datos válidos de votos
  const [validVoteData, setValidVoteData] = useState<Map<number, {
    votedOption: string;
    votedOptionId: number;
    votedOptionColor: string;
  }>>(new Map());

  // useEffect para actualizar datos válidos cuando cambian los votingDetails
  useEffect(() => {
    if (!votingDetails) return;

    setValidVoteData(prevValidData => {
      const newValidData = new Map(prevValidData);
      let hasChanges = false;

      votingDetails.units.forEach((unit) => {
        if (unit.has_voted) {
          // Verificar si los datos son válidos (no "undefined" como string)
          const isValidText = unit.option_text &&
            unit.option_text !== 'undefined' &&
            unit.option_text !== 'null' &&
            unit.option_text.trim() !== '';

          const isValidColor = unit.option_color &&
            unit.option_color !== 'undefined' &&
            unit.option_color !== 'null' &&
            unit.option_color.trim() !== '';

          if (isValidText && isValidColor) {
            // Datos válidos del backend - guardarlos solo si no existen o son diferentes
            const votedOptionId = options.find(opt => opt.optionText === unit.option_text)?.id;
            if (votedOptionId) {
              const existing = prevValidData.get(unit.property_unit_id);
              const newData = {
                votedOption: unit.option_text || '',
                votedOptionId: votedOptionId,
                votedOptionColor: unit.option_color || ''
              };

              // Solo actualizar si los datos son diferentes o no existen
              if (!existing ||
                existing.votedOption !== newData.votedOption ||
                existing.votedOptionColor !== newData.votedOptionColor) {
                newValidData.set(unit.property_unit_id, newData);
                hasChanges = true;
              }
            }
          }
        }
      });

      return hasChanges ? newValidData : prevValidData;
    });
  }, [votingDetails, options]);

  // Función para convertir datos del endpoint al formato de ResidentialUnit
  const convertToResidentialUnits = (): ResidentialUnit[] => {
    if (!votingDetails) return [];

    return votingDetails.units.map((unit) => {
      let votedOption: string | undefined;
      let votedOptionId: number | undefined;
      let votedOptionColor: string | undefined;

      if (unit.has_voted) {
        // Verificar si los datos son válidos (no "undefined" como string)
        const isValidText = unit.option_text &&
          unit.option_text !== 'undefined' &&
          unit.option_text !== 'null' &&
          unit.option_text.trim() !== '';

        const isValidColor = unit.option_color &&
          unit.option_color !== 'undefined' &&
          unit.option_color !== 'null' &&
          unit.option_color.trim() !== '';

        if (isValidText && isValidColor) {
          // Datos válidos del backend - usarlos
          votedOption = unit.option_text || undefined;
          votedOptionId = options.find(opt => opt.optionText === unit.option_text)?.id;
          votedOptionColor = unit.option_color || undefined;
        } else {
          // Datos inválidos - usar datos guardados previamente si existen
          const savedData = validVoteData.get(unit.property_unit_id);
          if (savedData) {
            votedOption = savedData.votedOption;
            votedOptionId = savedData.votedOptionId;
            votedOptionColor = savedData.votedOptionColor;
          } else {
            votedOption = undefined;
            votedOptionId = undefined;
            votedOptionColor = undefined;
          }
        }
      }

      const result = {
        id: unit.property_unit_id,
        number: unit.property_unit_number,
        resident: unit.resident_name || 'Sin residente',
        propertyUnitId: unit.property_unit_id,
        residentId: unit.resident_id,
        hasVoted: unit.has_voted,
        hasAttendance: unit.has_attendance, // ✅ NUEVO: Mapear campo de asistencia
        votedOption: votedOption,
        votedOptionId: votedOptionId,
        votedOptionColor: votedOptionColor,
        participationCoefficient: unit.participation_coefficient,
      };

      return result;
    });
  };

  // Función para obtener el color de una opción
  const getOptionColor = (optionId: number, optionColor?: string): string => {
    // 1. Color personalizado temporal (si el usuario lo cambió en el UI)
    if (optionColors[optionId]) {
      return optionColors[optionId];
    }

    // 2. Color del backend (guardado en la base de datos)
    if (optionColor) {
      return optionColor;
    }

    // 3. Colores predeterminados por ID de opción
    const defaultColors = [
      '#22c55e', // Verde
      '#3b82f6', // Azul
      '#8b5cf6', // Púrpura
      '#f59e0b', // Amarillo
      '#ec4899', // Rosa
      '#6366f1', // Índigo
      '#ef4444', // Rojo
      '#f97316', // Naranja
    ];

    const colorIndex = optionId % defaultColors.length;
    return defaultColors[colorIndex];
  };

  // Función para validar que todas las opciones tengan colores configurados
  const validateOptionColors = (): string | null => {
    if (!options || options.length === 0) {
      return null; // No hay opciones para validar
    }

    const optionsWithoutColor = options.filter(option => {
      const color = getOptionColor(option.id, option.color);
      return !color;
    });

    if (optionsWithoutColor.length > 0) {
      const optionNames = optionsWithoutColor.map(opt => `"${opt.optionText}"`).join(', ');
      return `Las siguientes opciones de votación no tienen color configurado: ${optionNames}. Por favor, configure los colores para todas las opciones antes de continuar.`;
    }

    return null;
  };

  // Función para convertir votos SSE a formato del frontend
  const convertSSEVotesToFrontend = (sseVotes: SSEVote[]): Vote[] => {
    return sseVotes.map(sseVote => ({
      id: sseVote.id,
      votingId: sseVote.voting_id,
      propertyUnitId: sseVote.property_unit_id,
      votingOptionId: sseVote.voting_option_id,
      votedAt: sseVote.voted_at,
      ipAddress: sseVote.ip_address || '',
      userAgent: sseVote.user_agent || '',
      // Campos adicionales del SSE para facilitar el renderizado
      optionText: sseVote.option_text,
      optionCode: sseVote.option_code,
      optionColor: sseVote.color,
    }));
  };

  // Usar votos del SSE si está conectado, sino usar votos iniciales o mock
  const safeInitialVotes = initialVotes || [];
  const currentVotes = useRealTime && sseConnected ? convertSSEVotesToFrontend(sseVotes) : safeInitialVotes;
  const currentTotalVotes = useRealTime && sseConnected ? sseTotalVotes : safeInitialVotes.length;

  if (!isOpen || !voting) return null;

  // Nota: antes se generaban votos de ejemplo (mock) que no se usaban en el render;
  // el rediseño calcula todo a partir de votingDetails (endpoint + SSE).

  // Quórum: campo existente de la votación (requiredPercentage); 51% por defecto si no viene.
  const quorum = resolveQuorum(voting.requiredPercentage);

  // Paleta coherente para resumen, fichas y dona (Sí/No/Abstención + respaldo)
  const paletteOptions = options.map(option => ({
    id: option.id,
    text: option.optionText,
    code: option.optionCode,
    color: optionColors[option.id] || option.color,
  }));
  const palette = buildOptionPalette(paletteOptions);

  // Resultados por coeficiente (el % legal). La suma de coeficientes del conjunto es 100.
  const results: CoefficientResults | null = votingDetails
    ? computeCoefficientResults(
        paletteOptions,
        votingDetails.units.map(unit => ({
          hasVoted: unit.has_voted,
          coef: unit.participation_coefficient || 0,
          optionText: unit.option_text,
        }))
      )
    : null;

  // Obtener unidades residenciales desde el endpoint
  const residentialUnits = convertToResidentialUnits();

  const handleVote = () => {
    setShowVoteModal(true);
  };

  // Handler para abrir modal de voto desde la tarjeta de unidad
  const handleVoteFromCard = (unit: ResidentialUnit) => {
    console.log('🗳️ Votando desde tarjeta:', unit);
    setSelectedUnitForVote(unit);
    setShowVoteModal(true);
  };

  // Handler para abrir modal de confirmación de eliminar voto
  const handleDeleteVoteFromCard = (unit: ResidentialUnit) => {
    setSelectedUnitForDelete(unit);
    setShowDeleteVoteModal(true);
  };

  // Handler para confirmar eliminación de voto
  const handleConfirmDeleteVote = async () => {
    if (!selectedUnitForDelete) return;

    setDeletingVote(true);

    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) {
        alert('No se encontró el token de autenticación');
        return;
      }

      // Buscar el voto de esta unidad en los votos del SSE
      const voteToDelete = sseVotes.find(vote => vote.property_unit_id === selectedUnitForDelete.propertyUnitId);

      if (!voteToDelete) {
        alert('No se encontró el voto para eliminar');
        return;
      }

      console.log('🗑️ Eliminando voto:', voteToDelete);

      const { deleteVoteAction } = await import('@/services/modules/horizontal-properties/voting/infrastructure/actions');

      const result = await deleteVoteAction({
        token,
        businessId: businessId,
        groupId: voting.votingGroupId,
        votingId: voting.id,
        voteId: voteToDelete.id
      });

      if (result.success) {
        console.log('✅ Voto eliminado exitosamente');

        // Actualizar solo la tarjeta específica sin recargar toda la página
        setVotingDetails(prevDetails => {
          if (!prevDetails) return prevDetails;

          const updatedUnits = prevDetails.units.map(u => {
            if (u.property_unit_id === selectedUnitForDelete.propertyUnitId) {
              // Resetear el voto de esta unidad
              return {
                ...u,
                has_voted: false,
                option_text: null,
                option_code: null,
                option_color: null,
                voted_at: null,
              };
            }
            return u;
          });

          return {
            ...prevDetails,
            units: updatedUnits,
            units_voted: prevDetails.units_voted - 1,
            units_pending: prevDetails.units_pending + 1,
          };
        });

        // Remover el voto del estado de processedVoteIds
        setProcessedVoteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(voteToDelete.id);
          return newSet;
        });

        // Remover el voto del estado de validVoteData
        setValidVoteData(prev => {
          const newMap = new Map(prev);
          newMap.delete(selectedUnitForDelete.propertyUnitId);
          return newMap;
        });

        console.log('🔄 Estados actualizados: voto eliminado de processedVoteIds y validVoteData');

        // Cerrar modal de confirmación
        setShowDeleteVoteModal(false);
        setSelectedUnitForDelete(null);
      } else {
        alert(result.error || 'Error al eliminar el voto');
      }
    } catch (error) {
      console.error('❌ Error eliminando voto:', error);
      alert('Error al eliminar el voto');
    } finally {
      setDeletingVote(false);
    }
  };

  // Handler para resetear votación
  const handleResetVoting = async () => {
    if (!voting) return;

    setResettingVoting(true);
    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) {
        alert('No se encontró el token de autenticación');
        return;
      }

      const result = await resetVotingAction({
        token,
        businessId,
        groupId: voting.votingGroupId,
        votingId: voting.id,
      });

      if (result.success) {
        console.log(`✅ Votación reseteada: ${result.data?.deletedCount} votos eliminados`);

        // Recargar toda la página para limpiar SSE y estado completamente
        window.location.reload();
        return;
      } else {
        alert(result.error || 'Error al resetear la votación');
      }
    } catch (error) {
      console.error('Error reseteando votación:', error);
      alert('Error al resetear la votación');
    } finally {
      setResettingVoting(false);
    }
  };

  const handleVoteSuccess = () => {
    console.log('✅ Voto registrado exitosamente. Cerrando modal.');
    // Cerrar el modal después de votar
    setShowVoteModal(false);
    setSelectedUnitForVote(null);
  };

  const secondaryButton =
    'h-8 px-3 rounded-md bg-white text-[13px] font-medium transition-colors hover:bg-[#f5f5f4] disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <>
      {/* Overlay de pantalla completa */}
      <div className={`fixed inset-0 z-50 flex ${votingFontRoot}`} style={{ background: VT.paper, color: VT.ink }}>
        <div className="w-full h-full flex flex-col">
          {/* Header fijo */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-7 py-4 bg-white flex-shrink-0"
            style={{ borderBottom: `1px solid ${VT.border}` }}
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-wrap">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 text-[13px] hover:text-[#c8603f] transition-colors"
                style={{ color: '#6b6a66' }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
                Votaciones
              </button>
              <div className="w-px h-[18px]" style={{ background: VT.border }} />
              <div className={`${vtMono} text-xs font-medium`} style={{ color: VT.muted }}>
                {formatOrder(voting.displayOrder)}
              </div>
              <h1 className="m-0 text-[17px] font-semibold tracking-[-.01em] min-w-0 truncate max-w-[60vw] sm:max-w-none">
                {voting.title}
              </h1>
              {voting.isActive ? (
                isLive ? (
                  <span className={`${vtMono} inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[.06em]`} style={{ color: VT.live }}>
                    <span className="w-[7px] h-[7px] rounded-full animate-pulse" style={{ background: VT.live }} />
                    EN VIVO
                  </span>
                ) : (
                  <span className={`${vtMono} inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[.06em]`} style={{ color: VT.muted }}>
                    <span className="w-[7px] h-[7px] rounded-full" style={{ background: VT.muted }} />
                    PAUSADA
                  </span>
                )
              ) : (
                <span className={`${vtMono} text-[11px] font-medium tracking-[.06em] px-1.5 py-0.5 rounded`} style={{ color: VT.muted, border: `1px solid ${VT.borderStrong}` }}>
                  INACTIVA
                </span>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() => setIsLive(!isLive)}
                className={secondaryButton}
                style={{ border: `1px solid ${VT.borderStrong}`, color: VT.inkSoft }}
              >
                {isLive ? 'Pausar' : 'Reanudar'}
              </button>
              <button
                type="button"
                onClick={() => setShowBulkVoteModal(true)}
                className={secondaryButton}
                style={{ border: `1px solid ${VT.borderStrong}`, color: VT.inkSoft }}
                disabled={!voting.isActive}
                title="Votación masiva"
              >
                Masiva
              </button>
              <button
                type="button"
                onClick={handleVote}
                className="h-8 px-3.5 rounded-md text-[13px] font-semibold text-white transition-colors hover:bg-[#c8603f] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1a1a1a]"
                style={{ background: VT.ink }}
                disabled={!voting.isActive}
              >
                Registrar voto
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMoreMenu(v => !v)}
                  className="h-8 w-8 rounded-md bg-white flex items-center justify-center hover:bg-[#f5f5f4]"
                  style={{ border: `1px solid ${VT.borderStrong}`, color: VT.inkSoft }}
                  aria-haspopup="menu"
                  aria-expanded={showMoreMenu}
                  aria-label="Más acciones"
                  title="Más acciones"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
                {showMoreMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMoreMenu(false)} aria-hidden="true" />
                    <div
                      role="menu"
                      className="absolute right-0 top-10 z-20 w-56 rounded-lg bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,.12)]"
                      style={{ border: `1px solid ${VT.border}` }}
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setShowMoreMenu(false);
                          setShowPieChart(true);
                        }}
                        className="w-full text-left px-3 py-2 text-[13px] hover:bg-[#f5f5f4]"
                        style={{ color: VT.ink }}
                      >
                        Ver resultados ampliados
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setShowMoreMenu(false);
                          setShowResetConfirm(true);
                        }}
                        disabled={!voting.isActive}
                        className="w-full text-left px-3 py-2 text-[13px] hover:bg-[#fbe9e4] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ color: VT.live }}
                        title="Eliminar todos los votos de esta votación"
                      >
                        Resetear votación
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 min-h-0 flex flex-col overflow-y-auto lg:overflow-hidden">
            {/* Resumen: cifras por opción + barra apilada + participación */}
            <VotingSummaryBlock results={results} quorum={quorum} />

            {/* Unidades por torre - ocupa el espacio restante */}
            <div className="flex-1 min-h-[320px] lg:min-h-0 px-4 sm:px-7 py-[18px]">
              {loadingDetails ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Spinner size="lg" />
                    <p className="mt-4 text-sm" style={{ color: VT.inkSoft }}>Cargando detalles de votación...</p>
                  </div>
                </div>
              ) : detailsError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <p className="font-semibold mb-1" style={{ color: VT.live }}>Error al cargar datos</p>
                    <p className="text-sm mb-4" style={{ color: VT.inkSoft }}>{detailsError}</p>
                    <button
                      type="button"
                      onClick={loadVotingDetails}
                      className="h-8 px-3.5 rounded-md text-[13px] font-semibold text-white"
                      style={{ background: VT.ink }}
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              ) : colorConfigError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="max-w-2xl mx-auto p-6 rounded-lg bg-white" style={{ border: `1px solid ${VT.border}` }}>
                    <p className="font-semibold mb-3" style={{ color: VT.live }}>Error de configuración de colores</p>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: VT.inkSoft }}>{colorConfigError}</p>
                    <p className="text-sm mb-2" style={{ color: VT.inkSoft }}>Para solucionar este problema:</p>
                    <ol className="text-sm list-decimal pl-5 space-y-1" style={{ color: VT.inkSoft }}>
                      <li>Ve a la lista de votaciones</li>
                      <li>Edita las opciones de votación que no tienen color</li>
                      <li>Asigna un color a cada opción</li>
                      <li>Guarda los cambios</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <VotesByUnitSection
                  units={residentialUnits}
                  fillAvailableSpace={true}
                  onVoteClick={handleVoteFromCard}
                  onDeleteVoteClick={handleDeleteVoteFromCard}
                  showVoteButton={true}
                  votingActive={voting?.isActive || false}
                  resolveColor={palette.forText}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {showPieChart && results && (
        <ResultsOverlay
          results={results}
          quorum={quorum}
          votingTitle={voting.title}
          displayOrder={voting.displayOrder}
          onClose={() => setShowPieChart(false)}
        />
      )}

      {/* Modal de Voto */}
      {voting && (
        <VoteModal
          isOpen={showVoteModal}
          onClose={() => {
            setShowVoteModal(false);
            setSelectedUnitForVote(null); // Limpiar selección al cerrar
          }}
          onSuccess={handleVoteSuccess}
          businessId={businessId}
          groupId={voting.votingGroupId}
          votingId={voting.id}
          votingTitle={voting.title}
          votingType={voting.votingType}
          allowAbstention={voting.allowAbstention}
          options={options}
          currentVotes={sseVotes.map(vote => ({
            property_unit_id: vote.property_unit_id,
            voted_at: vote.voted_at
          }))} // ✅ NUEVO: Pasar votos actuales para filtrar
          preselectedUnit={selectedUnitForVote ? {
            propertyUnitId: selectedUnitForVote.propertyUnitId,
            residentId: selectedUnitForVote.residentId,
            unitNumber: selectedUnitForVote.number,
            residentName: selectedUnitForVote.resident
          } : undefined}
        />
      )}

      {/* Modal de Votación Masiva */}
      {voting && (
        <BulkVoteModal
          isOpen={showBulkVoteModal}
          onClose={() => setShowBulkVoteModal(false)}
          businessId={businessId}
          groupId={voting.votingGroupId}
          votingId={voting.id}
          options={options}
          currentVotes={sseVotes.map(vote => ({
            property_unit_id: vote.property_unit_id,
          }))}
          unitsWithAttendance={new Set(
            votingDetails?.units
              .filter(u => u.has_attendance)
              .map(u => u.property_unit_id) || []
          )}
          sseTotalVotes={sseTotalVotes}
        />
      )}

      {/* Modal de Confirmación de Resetear Votación */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => {
          if (!resettingVoting) setShowResetConfirm(false);
        }}
        title="Resetear Votación"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-red-800">
                  ¿Resetear todos los votos?
                </h3>
                <p className="text-sm text-red-600 mt-1">
                  Se eliminarán TODOS los votos de esta votación. Los registros de asistencia se mantienen.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Votación:</span>
                <span className="text-gray-900 font-semibold">{voting?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Votos actuales:</span>
                <span className="text-gray-900 font-semibold">{votingDetails?.units_voted || 0}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowResetConfirm(false)}
              disabled={resettingVoting}
              className="flex-1 btn btn-outline"
            >
              Cancelar
            </button>
            <button
              onClick={handleResetVoting}
              disabled={resettingVoting}
              className="flex-1 btn btn-error"
            >
              {resettingVoting ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">Reseteando...</span>
                </>
              ) : (
                'Confirmar Reseteo'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmación de Eliminar Voto */}
      {selectedUnitForDelete && (
        <Modal
          isOpen={showDeleteVoteModal}
          onClose={() => {
            if (!deletingVote) {
              setShowDeleteVoteModal(false);
              setSelectedUnitForDelete(null);
            }
          }}
          title="Eliminar Voto"
          size="md"
        >
          <div className="space-y-6">
            {/* Advertencia */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-red-800">
                    ¿Estás seguro de eliminar este voto?
                  </h3>
                  <p className="text-sm text-red-600 mt-1">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
            </div>

            {/* Detalles del voto a eliminar */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Unidad:</span>
                  <span className="text-gray-900 font-semibold">{selectedUnitForDelete.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Residente:</span>
                  <span className="text-gray-900">{selectedUnitForDelete.resident}</span>
                </div>
                {selectedUnitForDelete.votedOption && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Opción votada:</span>
                    <span className="text-gray-900 font-semibold">{selectedUnitForDelete.votedOption}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteVoteModal(false);
                  setSelectedUnitForDelete(null);
                }}
                disabled={deletingVote}
                className="flex-1 btn btn-outline"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteVote}
                disabled={deletingVote}
                className="flex-1 btn btn-error"
              >
                {deletingVote ? (
                  <>
                    <Spinner size="sm" />
                    <span className="ml-2">Eliminando...</span>
                  </>
                ) : (
                  'Eliminar Voto'
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
