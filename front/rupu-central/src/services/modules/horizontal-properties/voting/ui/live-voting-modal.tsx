/**
 * Componente: Modal de Votación en Vivo
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Badge, Spinner, Modal } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { generatePublicUrlAction } from '@/services/modules/horizontal-properties/voting/infrastructure/actions/public-voting';
import { getVotingDetailsAction } from '@/services/modules/horizontal-properties/voting/infrastructure/actions';
import { VoteModal } from './vote-modal';
import { VotesByUnitSection, type ResidentialUnit } from './components/votes-by-unit-section';
import { VotingSummaryBlock } from './voting-summary-block';
// import { QRCodeSVG } from 'qrcode.react'; // Ya no se usa, se genera dinámicamente
import { useVotingSSE } from './hooks';
import { Vote } from '../domain/entities'; // ✅ Usar la interfaz oficial

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

interface PieChartOverlayProps {
  slices: PieChartSlice[];
  onClose: () => void;
  votingTitle: string;
}

function PieChartOverlay({ slices, onClose, votingTitle }: PieChartOverlayProps) {
  const percentFormatter = useMemo(
    () =>
      new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }),
    []
  );

  const coefficientFormatter = useMemo(
    () =>
      new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    []
  );

  const slicesForChart = slices.filter((slice) => slice.percentage > 0);
  const totalForChart = slicesForChart.reduce((sum, slice) => sum + slice.percentage, 0);
  const participationPercentage = slices
    .filter((slice) => slice.id !== -1)
    .reduce((sum, slice) => sum + slice.percentage, 0);
  const notVotedSlice = slices.find((slice) => slice.id === -1);
  const totalUnits = slices.reduce((sum, slice) => sum + slice.votes, 0);
  const totalVotesCast = slices
    .filter((slice) => slice.id !== -1)
    .reduce((sum, slice) => sum + slice.votes, 0);
  const sortedSlices = [...slices].sort((a, b) => b.percentage - a.percentage);

  let cumulativePercent = 0;
  const radius = 15.91549430918954;

  const chartSegments =
    totalForChart > 0
      ? slicesForChart.map((slice) => {
        const slicePercent = slice.percentage / totalForChart;
        const dashArray = `${(slicePercent * 100).toFixed(3)} ${(100 - slicePercent * 100).toFixed(3)}`;
        const dashOffset = 25 - cumulativePercent * 100;
        cumulativePercent += slicePercent;

        return (
          <circle
            key={`${slice.id}-${slice.label}`}
            r={radius}
            cx="21"
            cy="21"
            fill="transparent"
            stroke={slice.color}
            strokeWidth="6"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
          />
        );
      })
      : null;

  return (
    <div className="fixed inset-0 z-[70] bg-white">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="btn btn-outline btn-sm">
              ← Ver panel
            </button>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Resultados en torta</p>
              <h2 className="text-xl font-semibold text-gray-900">{votingTitle}</h2>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Coeficiente participado:{' '}
            <span className="font-semibold text-gray-900">{percentFormatter.format(participationPercentage)}%</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {totalForChart > 0 ? (
            <div className="max-w-6xl mx-auto flex flex-col gap-12 lg:flex-row lg:items-start">
              <div className="flex-1 flex flex-col items-center gap-6">
                <div className="relative w-full max-w-md">
                  <svg viewBox="0 0 42 42" className="w-full h-auto">
                    <circle
                      r={radius}
                      cx="21"
                      cy="21"
                      fill="transparent"
                      stroke="#E5E7EB"
                      strokeWidth="6"
                    />
                    {chartSegments}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs uppercase tracking-wide text-gray-500">Participación</span>
                    <span className="text-3xl font-semibold text-gray-900">
                      {percentFormatter.format(participationPercentage)}%
                    </span>
                    {notVotedSlice && (
                      <span className="mt-1 text-xs text-gray-400">
                        No votado: {percentFormatter.format(notVotedSlice.percentage)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold text-gray-900">{totalUnits}</span> unidades totales
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{totalVotesCast}</span> unidades con voto registrado
                  </div>
                  {notVotedSlice && (
                    <div>
                      <span className="font-semibold text-gray-900">{notVotedSlice.votes}</span> unidades sin votar
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                {sortedSlices.map((slice) => (
                  <div
                    key={`${slice.id}-${slice.label}`}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
                  >
                    <span
                      className="flex-shrink-0 w-3 h-3 rounded-full"
                      style={{ backgroundColor: slice.color }}
                      aria-hidden="true"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-gray-900">{slice.label}</p>
                        <span className="text-sm font-semibold text-gray-900">
                          {percentFormatter.format(slice.percentage)}%
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-4">
                        <span>
                          Coeficiente:{' '}
                          <span className="font-medium text-gray-800">
                            {coefficientFormatter.format(slice.coefficientSum)}%
                          </span>
                        </span>
                        <span>
                          Unidades:{' '}
                          <span className="font-medium text-gray-800">{slice.votes}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-gray-500">
              <div className="text-6xl">📊</div>
              <div>
                <p className="text-lg font-semibold text-gray-700">Aún no hay datos suficientes para graficar</p>
                <p className="mt-1 text-sm text-gray-500 max-w-md">
                  Cuando se registren votos con coeficiente de participación, verás aquí la distribución en formato de torta.
                </p>
              </div>
              <button onClick={onClose} className="btn btn-primary">
                Volver al panel
              </button>
            </div>
          )}
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

interface PieChartSlice {
  id: number;
  label: string;
  percentage: number;
  votes: number;
  coefficientSum: number;
  color: string;
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
  const [selectedUnitForVote, setSelectedUnitForVote] = useState<ResidentialUnit | null>(null);
  const [showDeleteVoteModal, setShowDeleteVoteModal] = useState(false);
  const [selectedUnitForDelete, setSelectedUnitForDelete] = useState<ResidentialUnit | null>(null);
  const [deletingVote, setDeletingVote] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPieChart, setShowPieChart] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [useRealTime, setUseRealTime] = useState(true);
  const [qrData, setQrData] = useState<string>('');
  const [publicUrl, setPublicUrl] = useState<string>('');
  const [generatingQR, setGeneratingQR] = useState(false);

  // Estados para datos reales del endpoint
  const [votingDetails, setVotingDetails] = useState<{
    units: Array<{
      property_unit_id: number; // ✅ NUEVO: ID de la unidad para mapeo correcto
      property_unit_number: string;
      participation_coefficient: number;
      resident_name: string | null;
      resident_id: number | null; // ✅ NUEVO: ID del residente para mapeo correcto
      has_voted: boolean;
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

  // Función para generar QR de votación pública
  const generatePublicVotingQR = async () => {
    setGeneratingQR(true);
    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      // Generar URL pública usando Server Action
      const result = await generatePublicUrlAction({
        token,
        businessId: businessId,
        groupId: voting.votingGroupId,
        votingId: voting.id,
        durationHours: 24,
        frontendUrl: `${window.location.origin}/public/vote`
      });

      if (result.success && result.data) {
        const { public_url } = result.data;
        setPublicUrl(public_url);

        // Generar QR con la URL
        const QRCode = await import('qrcode');
        const qrDataURL = await QRCode.default.toDataURL(public_url, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        setQrData(qrDataURL);
        setShowQRModal(true);
      } else {
        throw new Error(result.error || result.message || 'Error al generar URL pública');
      }
    } catch (err) {
      console.error('Error generando QR:', err);
      alert('Error al generar el código QR. Por favor, intente nuevamente.');
    } finally {
      setGeneratingQR(false);
    }
  };

  // Generar votos de ejemplo para 200 unidades con distribución variada (solo si no hay votos reales)
  const generateMockVotes = (): Vote[] => {
    // Si ya hay votos reales, usar esos
    if (currentVotes.length > 0) {
      return currentVotes;
    }

    const votes: Vote[] = [];
    const totalUnits = 200;
    const participationRate = 0.75; // 75% de participación
    const totalVoters = Math.floor(totalUnits * participationRate); // 150 votantes

    // Distribución de votos: 60% a favor, 30% en contra, 10% abstenciones
    const votesDistribution = {
      positive: Math.floor(totalVoters * 0.6), // 90 votos
      negative: Math.floor(totalVoters * 0.3), // 45 votos  
      abstention: totalVoters - Math.floor(totalVoters * 0.6) - Math.floor(totalVoters * 0.3) // 15 votos
    };

    let voteId = 1;
    const residentIds = Array.from({ length: totalUnits }, (_, i) => i + 1);

    // Mezclar aleatoriamente los residentes que votarán
    const shuffledResidents = residentIds.sort(() => Math.random() - 0.5);
    const votingResidents = shuffledResidents.slice(0, totalVoters);

    // Generar votos positivos (Opción 1)
    for (let i = 0; i < votesDistribution.positive; i++) {
      votes.push({
        id: voteId++,
        votingId: voting.id,
        propertyUnitId: votingResidents[i],
        votingOptionId: 1,
        votedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Mock Browser)',
        optionText: 'Sí',
        optionCode: 'SI',
        optionColor: '#10B981'
      });
    }

    // Generar votos negativos (Opción 2)
    for (let i = 0; i < votesDistribution.negative; i++) {
      votes.push({
        id: voteId++,
        votingId: voting.id,
        propertyUnitId: votingResidents[votesDistribution.positive + i],
        votingOptionId: 2,
        votedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Mock Browser)',
        optionText: 'No',
        optionCode: 'NO',
        optionColor: '#EF4444'
      });
    }

    // Generar abstenciones (Opción 3)
    for (let i = 0; i < votesDistribution.abstention; i++) {
      votes.push({
        id: voteId++,
        votingId: voting.id,
        propertyUnitId: votingResidents[votesDistribution.positive + votesDistribution.negative + i],
        votingOptionId: 3,
        votedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Mock Browser)',
        optionText: 'Abstención',
        optionCode: 'ABS',
        optionColor: '#6B7280'
      });
    }

    return votes;
  };

  const mockVotes = generateMockVotes();

  // Usar votos reales del SSE si están disponibles, sino usar votos iniciales o mock
  const votesToUse = currentVotes.length > 0 ? currentVotes : (safeInitialVotes.length > 0 ? safeInitialVotes : mockVotes);

  // Calcular estadísticas con coeficientes de participación
  const totalCoefficient = 100; // La suma de todos los coeficientes siempre es 100

  // Calcular estadísticas por opción (incluyendo coeficientes)
  const optionStats = options.map(option => {
    // Filtrar las unidades que votaron por esta opción
    const unitsVotedForOption = votingDetails?.units.filter(
      unit => unit.has_voted && unit.option_text === option.optionText
    ) || [];

    // Suma de coeficientes de las unidades que votaron por esta opción
    const coefficientSum = unitsVotedForOption.reduce(
      (sum, unit) => sum + (unit.participation_coefficient || 0),
      0
    );

    const voteCount = unitsVotedForOption.length;

    // Porcentaje por coeficiente (el válido legalmente)
    const percentageByCoefficient = (coefficientSum / totalCoefficient) * 100;

    // Porcentaje sobre los que votaron (participación efectiva)
    const totalVoted = votingDetails?.units_voted || 1;
    const percentageOfVoted = totalVoted > 0 ? (voteCount / totalVoted) * 100 : 0;

    return {
      ...option,
      votes: voteCount,                                    // Cantidad de votos
      coefficientSum: coefficientSum,                      // Suma de coeficientes
      percentageByCoefficient: percentageByCoefficient,    // % por coeficiente (legal)
      percentageOfVoted: percentageOfVoted,                // % de los que votaron
    };
  });

  // Calcular estadísticas de "No Votado"
  const unitsNotVoted = votingDetails?.units.filter(unit => !unit.has_voted) || [];
  const notVotedCoefficient = unitsNotVoted.reduce(
    (sum, unit) => sum + (unit.participation_coefficient || 0),
    0
  );
  const notVotedCount = unitsNotVoted.length;
  const notVotedPercentage = (notVotedCoefficient / totalCoefficient) * 100;

  // Agregar "No Votado" como una opción más
  const allStats = [
    ...optionStats,
    {
      id: -1,
      votingId: voting?.id || 0,
      optionText: 'No Votado',
      optionCode: 'NOT_VOTED',
      displayOrder: 999,
      isActive: true,
      votes: notVotedCount,
      coefficientSum: notVotedCoefficient,
      percentageByCoefficient: notVotedPercentage,
      percentageOfVoted: 0, // No aplica para no votados
    }
  ].sort((a, b) => b.coefficientSum - a.coefficientSum); // Ordenar por coeficiente

  const pieChartData: PieChartSlice[] = allStats.map((stat) => {
    const percentage =
      typeof stat.percentageByCoefficient === 'number' && Number.isFinite(stat.percentageByCoefficient)
        ? Math.max(stat.percentageByCoefficient, 0)
        : 0;
    const votesCount = (stat as { votes?: number }).votes ?? 0;
    const coefficientSumValue = (stat as { coefficientSum?: number }).coefficientSum ?? 0;
    const optionColorValue =
      stat.id === -1
        ? '#9CA3AF'
        : getOptionColor(stat.id as number, (stat as { color?: string }).color);

    return {
      id: stat.id as number,
      label: stat.optionText,
      percentage,
      votes: votesCount,
      coefficientSum: coefficientSumValue,
      color: optionColorValue,
    };
  });

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

  const handleVoteSuccess = () => {
    console.log('✅ Voto registrado exitosamente. Cerrando modal.');
    // Cerrar el modal después de votar
    setShowVoteModal(false);
    setSelectedUnitForVote(null);
  };

  return (
    <>
      {/* Overlay de pantalla completa */}
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        {/* Contenedor de pantalla completa */}
        <div className="w-full h-full bg-white flex flex-col">
          {/* Header fijo */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Volver</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {voting.displayOrder}. {voting.title}
                </h1>
                <Badge type={voting.isActive ? 'success' : 'error'}>
                  {voting.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
                <Badge type={isLive ? 'error' : 'primary'}>
                  {isLive ? '🔴 EN VIVO' : '⏸️ PAUSADA'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPieChart(true)}
                className="btn btn-outline"
              >
                🍰 Ver torta
              </button>
              <button
                onClick={() => setIsLive(!isLive)}
                className={`btn ${isLive ? 'btn-outline' : 'btn-primary'}`}
              >
                {isLive ? 'Pausar' : 'Reanudar'}
              </button>
              <button
                onClick={generatePublicVotingQR}
                disabled={generatingQR}
                className="btn btn-outline"
              >
                {generatingQR ? (
                  <>
                    <Spinner size="sm" />
                    <span className="ml-2">Generando...</span>
                  </>
                ) : (
                  '📱 QR'
                )}
              </button>
              <button
                onClick={handleVote}
                className="btn btn-primary"
                disabled={!voting.isActive}
              >
                🗳️ Votar
              </button>
            </div>
          </div>

          {/* Contenido scrolleable con flex layout */}
          <div className="flex-1 overflow-hidden p-6 flex flex-col">
            {/* Componente unificado de resumen */}
            <VotingSummaryBlock
              voting={voting}
              options={options}
              votingDetails={votingDetails}
            />

            {/* Votos por Unidad - Ocupa todo el espacio restante */}
            <div className="flex-1 min-h-0">
              {loadingDetails ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Spinner size="lg" />
                    <p className="mt-4 text-gray-600">Cargando detalles de votación...</p>
                  </div>
                </div>
              ) : detailsError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <p className="text-red-600 font-medium mb-2">Error al cargar datos</p>
                    <p className="text-gray-600 text-sm mb-4">{detailsError}</p>
                    <button
                      onClick={loadVotingDetails}
                      className="btn btn-primary btn-sm"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              ) : colorConfigError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-2xl mx-auto p-6">
                    <div className="text-red-500 text-6xl mb-4">🎨</div>
                    <p className="text-red-600 font-medium mb-4">Error de Configuración de Colores</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-red-800 text-sm leading-relaxed">{colorConfigError}</p>
                    </div>
                    <div className="text-gray-600 text-sm">
                      <p className="mb-2">Para solucionar este problema:</p>
                      <ul className="text-left space-y-1">
                        <li>• Ve a la lista de votaciones</li>
                        <li>• Edita las opciones de votación que no tienen color</li>
                        <li>• Asigna un color a cada opción</li>
                        <li>• Guarda los cambios</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <VotesByUnitSection
                  units={residentialUnits}
                  fillAvailableSpace={true}
                  onVoteClick={handleVoteFromCard}
                  onDeleteVoteClick={handleDeleteVoteFromCard}
                  showVoteButton={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {showPieChart && (
        <PieChartOverlay
          slices={pieChartData}
          onClose={() => setShowPieChart(false)}
          votingTitle={voting.title}
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

      {/* Modal QR */}
      {showQRModal && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-75 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                📱 Código QR de Votación
              </h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido */}
            <div className="flex flex-col items-center space-y-6">
              {/* Información de la votación */}
              <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {voting.title}
                </h3>
                <p className="text-sm text-blue-700">
                  {voting.description}
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-white p-6 rounded-xl border-4 border-gray-200 shadow-lg">
                {qrData ? (
                  <img src={qrData} alt="QR Code de votación" className="w-80 h-80" />
                ) : (
                  <div className="w-80 h-80 flex items-center justify-center bg-gray-100 rounded-lg">
                    <Spinner size="lg" />
                  </div>
                )}
              </div>

              {/* URL y descripción */}
              <div className="w-full space-y-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1 font-semibold">URL de votación:</p>
                  <p className="text-sm text-gray-900 font-mono break-all">
                    {publicUrl || `https://votacion.rupu.com/p/${voting.votingGroupId}/v/${voting.id}`}
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <span className="text-yellow-600">💡</span>
                    <div>
                      <p className="text-sm text-yellow-800 font-semibold mb-1">
                        Votación Pública
                      </p>
                      <p className="text-xs text-yellow-700">
                        Los residentes pueden escanear este código QR con su teléfono para acceder a la votación desde cualquier lugar.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <span className="text-gray-600">ℹ️</span>
                    <div>
                      <p className="text-xs text-gray-600">
                        <strong>Nota:</strong> La URL y autenticación por token se configurarán próximamente. Por ahora, esta es una URL de ejemplo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="w-full space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      if (publicUrl) {
                        navigator.clipboard.writeText(publicUrl);
                        alert('URL copiada al portapapeles');
                      }
                    }}
                    disabled={!publicUrl}
                    className="btn btn-outline text-sm"
                  >
                    📋 Copiar URL
                  </button>
                  <button
                    onClick={() => {
                      if (qrData) {
                        const link = document.createElement('a');
                        link.download = `qr-votacion-${voting.id}.png`;
                        link.href = qrData;
                        link.click();
                      }
                    }}
                    disabled={!qrData}
                    className="btn btn-outline text-sm"
                  >
                    💾 Descargar QR
                  </button>
                </div>

                <button
                  onClick={() => setShowQRModal(false)}
                  className="btn btn-primary w-full"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
