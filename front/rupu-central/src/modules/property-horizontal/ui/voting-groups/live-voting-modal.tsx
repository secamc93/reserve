/**
 * Componente: Modal de Votación en Vivo
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge, Spinner } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { generatePublicUrlAction } from '@/modules/property-horizontal/infrastructure/actions/public-voting';
import { getVotingDetailsAction } from '@/modules/property-horizontal/infrastructure/actions/voting';
import { VoteModal } from './vote-modal';
import { VotesByUnitSection, type ResidentialUnit } from '../components';
// import { QRCodeSVG } from 'qrcode.react'; // Ya no se usa, se genera dinámicamente
import { useVotingSSE } from './hooks';

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

interface VotingOption {
  id: number;
  votingId: number;
  optionText: string;
  optionCode: string;
  displayOrder: number;
  isActive: boolean;
  color?: string; // Color personalizado para la opción (hex)
}

interface Vote {
  id: number;
  votingId: number;
  residentId: number;
  votingOptionId: number;
  votedAt: string;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
}

// Interfaz para votos del SSE (formato del backend)
interface SSEVote {
  id: number;
  voting_id: number;
  resident_id: number;
  voting_option_id: number;
  voted_at: string;
  ip_address?: string;
  user_agent?: string;
  notes?: string;
}

interface LiveVotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hpId: number; // ID de la propiedad horizontal
  voting: Voting | null;
  options: VotingOption[];
  votes: Vote[];
  onVoteSuccess: () => void;
}

export function LiveVotingModal({ 
  isOpen, 
  onClose, 
  hpId,
  voting, 
  options, 
  votes: initialVotes, 
  onVoteSuccess 
}: LiveVotingModalProps) {
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [useRealTime, setUseRealTime] = useState(true);
  const [qrData, setQrData] = useState<string>('');
  const [publicUrl, setPublicUrl] = useState<string>('');
  const [generatingQR, setGeneratingQR] = useState(false);
  
  // Estados para datos reales del endpoint
  const [votingDetails, setVotingDetails] = useState<{
    units: Array<{
      property_unit_number: string;
      participation_coefficient: number;
      resident_name: string | null;
      has_voted: boolean;
      option_text: string | null;
      option_code: string | null;
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
    connectionStatus 
  } = useVotingSSE(
    hpId, 
    voting?.votingGroupId || 0, 
    voting?.id || 0, 
    isOpen && useRealTime && voting?.isActive
  );

  const loadVotingDetails = useCallback(async () => {
    if (!voting || !hpId) return;
    
    setLoadingDetails(true);
    setDetailsError(null);
    
    try {
      const token = TokenStorage.getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const result = await getVotingDetailsAction({
        hpId,
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
  }, [voting, hpId]);

  // Estado para trackear los votos ya procesados
  const [processedVoteIds, setProcessedVoteIds] = useState<Set<number>>(new Set());

  const updateVotingDetailsFromSSE = useCallback(() => {
    if (!votingDetails || !sseVotes.length) return;

    // Filtrar solo votos nuevos (no procesados)
    const newVotes = sseVotes.filter(vote => !processedVoteIds.has(vote.id));
    
    if (newVotes.length === 0) return;

    console.log(`🔄 Actualizando ${newVotes.length} votos nuevos via SSE (sin recargar endpoint)`);

    // Marcar estos votos como procesados
    setProcessedVoteIds(prev => {
      const newSet = new Set(prev);
      newVotes.forEach(vote => newSet.add(vote.id));
      return newSet;
    });

    // Actualizar solo las unidades que han votado
    setVotingDetails(prevDetails => {
      if (!prevDetails) return prevDetails;

      let updatedUnits = [...prevDetails.units];
      let newUnitsVoted = 0;

      // Para cada nuevo voto, actualizar la unidad correspondiente
      newVotes.forEach(vote => {
        // Buscar la opción votada para obtener el texto y color
        const option = options.find(opt => opt.id === vote.voting_option_id);
        
        if (option) {
          // Buscar una unidad que aún no ha votado para actualizar
          // Nota: En una implementación real, necesitarías mapear resident_id a property_unit_number
          const pendingUnitIndex = updatedUnits.findIndex(unit => !unit.has_voted);
          
          if (pendingUnitIndex !== -1) {
            console.log(`✅ Actualizando unidad ${updatedUnits[pendingUnitIndex].property_unit_number} con voto: ${option.optionText}`);
            
            updatedUnits[pendingUnitIndex] = {
              ...updatedUnits[pendingUnitIndex],
              has_voted: true,
              option_text: option.optionText,
              option_code: option.optionCode,
              voted_at: vote.voted_at,
            };
            newUnitsVoted++;
          }
        }
      });

      console.log(`📊 Estadísticas actualizadas: +${newUnitsVoted} votos nuevos`);

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
    if (isOpen && voting && hpId) {
      loadVotingDetails();
    }
  }, [isOpen, voting, hpId, loadVotingDetails]);

  // Actualizar datos cuando llegan nuevos votos via SSE (sin recargar todo el endpoint)
  useEffect(() => {
    if (sseVotes.length > 0 && votingDetails) {
      updateVotingDetailsFromSSE();
    }
  }, [sseVotes.length, updateVotingDetailsFromSSE, votingDetails]);

  // Función para convertir datos del endpoint al formato de ResidentialUnit
  const convertToResidentialUnits = (): ResidentialUnit[] => {
    if (!votingDetails) return [];

    return votingDetails.units.map((unit, index) => {
      // Buscar la opción correspondiente para obtener el color
      const option = options.find(opt => opt.optionText === unit.option_text);
      const optionColor = option ? optionColors[option.id] : undefined;

      return {
        id: index + 1, // ID temporal basado en índice
        number: unit.property_unit_number,
        resident: unit.resident_name || 'Sin residente',
        hasVoted: unit.has_voted,
        votedOption: unit.option_text || undefined,
        votedOptionId: option?.id,
        votedOptionColor: optionColor,
        participationCoefficient: unit.participation_coefficient,
      };
    });
  };

  // Estado para los colores personalizados de cada opción
  const [optionColors, setOptionColors] = useState<Record<number, string>>(() => {
    // Colores por defecto para las opciones
    const defaultColors: Record<number, string> = {};
    const colorPalette = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#ef4444', '#f97316'];
    options.forEach((option, index) => {
      defaultColors[option.id] = option.color || colorPalette[index % colorPalette.length];
    });
    return defaultColors;
  });

  // Función para convertir votos SSE a formato del frontend
  const convertSSEVotesToFrontend = (sseVotes: Array<{
    id: number;
    voting_id: number;
    resident_id: number;
    voting_option_id: number;
    voted_at: string;
    ip_address?: string;
    user_agent?: string;
    notes?: string;
  }>): Vote[] => {
    return sseVotes.map(sseVote => ({
      id: sseVote.id,
      votingId: sseVote.voting_id,
      residentId: sseVote.resident_id,
      votingOptionId: sseVote.voting_option_id,
      votedAt: sseVote.voted_at,
      ipAddress: sseVote.ip_address,
      userAgent: sseVote.user_agent,
      notes: sseVote.notes,
    }));
  };

  // Usar votos del SSE si está conectado, sino usar votos iniciales o mock
  const currentVotes = useRealTime && sseConnected ? convertSSEVotesToFrontend(sseVotes) : initialVotes;
  const currentTotalVotes = useRealTime && sseConnected ? sseTotalVotes : initialVotes.length;

  if (!isOpen || !voting) return null;
  
  // Función para generar QR de votación pública
  const generatePublicVotingQR = async () => {
    setGeneratingQR(true);
    try {
      const token = TokenStorage.getToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      // Generar URL pública usando Server Action
      const result = await generatePublicUrlAction({
        token,
        hpId,
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
    const residentIds = Array.from({length: totalUnits}, (_, i) => i + 1);
    
    // Mezclar aleatoriamente los residentes que votarán
    const shuffledResidents = residentIds.sort(() => Math.random() - 0.5);
    const votingResidents = shuffledResidents.slice(0, totalVoters);
    
    // Generar votos positivos (Opción 1)
    for (let i = 0; i < votesDistribution.positive; i++) {
      votes.push({
        id: voteId++,
        votingId: voting.id,
        residentId: votingResidents[i],
        votingOptionId: 1,
        votedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        notes: ['Sí', 'A favor', 'Totalmente de acuerdo', 'Definitivamente sí', 'Voto a favor'][Math.floor(Math.random() * 5)]
      });
    }
    
    // Generar votos negativos (Opción 2)
    for (let i = 0; i < votesDistribution.negative; i++) {
      votes.push({
        id: voteId++,
        votingId: voting.id,
        residentId: votingResidents[votesDistribution.positive + i],
        votingOptionId: 2,
        votedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        notes: ['No', 'En contra', 'No estoy de acuerdo', 'Voto negativo', 'No apoyo'][Math.floor(Math.random() * 5)]
      });
    }
    
    // Generar abstenciones (Opción 3)
    for (let i = 0; i < votesDistribution.abstention; i++) {
      votes.push({
        id: voteId++,
        votingId: voting.id,
        residentId: votingResidents[votesDistribution.positive + votesDistribution.negative + i],
        votingOptionId: 3,
        votedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        notes: ['Me abstengo', 'Sin opinión', 'Neutral', 'No participo', 'Abstención'][Math.floor(Math.random() * 5)]
      });
    }
    
    return votes;
  };

  const mockVotes = generateMockVotes();

  // Usar votos reales del SSE si están disponibles, sino usar votos iniciales o mock
  const votesToUse = currentVotes.length > 0 ? currentVotes : (initialVotes.length > 0 ? initialVotes : mockVotes);

  // Calcular estadísticas
  const totalVotes = currentTotalVotes || votesToUse.length;
  const optionStats = options.map(option => {
    const optionVotes = votesToUse.filter(vote => vote.votingOptionId === option.id);
    const percentage = totalVotes > 0 ? (optionVotes.length / totalVotes) * 100 : 0;
    return {
      ...option,
      votes: optionVotes.length,
      percentage: percentage.toFixed(1)
    };
  }).sort((a, b) => b.votes - a.votes);

  // Obtener unidades residenciales desde el endpoint
  const residentialUnits = convertToResidentialUnits();

  const handleVote = () => {
    setShowVoteModal(true);
  };

  const handleVoteSuccess = () => {
    setShowVoteModal(false);
    onVoteSuccess();
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
            {/* Resultados y Resumen en la misma fila */}
            <div className="mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Opciones de Votación */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {optionStats.map((option, index) => {
                      const optionColor = optionColors[option.id] || '#6b7280';
                      return (
                        <div key={option.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 flex-1">
                              <span 
                                className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm text-white"
                                style={{ backgroundColor: optionColor }}
                              >
                                {option.displayOrder}
                              </span>
                              <span className="font-semibold text-gray-900 text-sm truncate">
                                {option.optionText}
                              </span>
                            </div>
                            {/* Selector de color */}
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={optionColor}
                                onChange={(e) => setOptionColors(prev => ({ ...prev, [option.id]: e.target.value }))}
                                className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                                title="Cambiar color"
                              />
                            </div>
                          </div>
                          <div className="text-center mb-3">
                            <span className="text-2xl font-bold text-gray-900">
                              {option.votes}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              votos ({option.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="h-3 rounded-full transition-all duration-700"
                              style={{ 
                                width: `${option.percentage}%`,
                                backgroundColor: optionColor
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resumen de Estadísticas */}
                <div className="lg:col-span-1">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow h-full">

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <span className="text-gray-600 block">Total Votos</span>
                        <span className="font-bold text-xl text-gray-900">{totalVotes}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-600 block">Participación</span>
                        <span className="font-bold text-xl text-blue-600">
                          {votingDetails 
                            ? ((votingDetails.units_voted / votingDetails.total_units) * 100).toFixed(1)
                            : '0'
                          }%
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-600 block">Han Votado</span>
                        <span className="font-bold text-xl text-green-600">
                          {votingDetails?.units_voted || 0}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-600 block">Pendientes</span>
                        <span className="font-bold text-xl text-orange-600">
                          {votingDetails?.units_pending || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
              ) : (
                <VotesByUnitSection 
                  units={residentialUnits}
                  fillAvailableSpace={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Voto */}
      {voting && (
        <VoteModal
          isOpen={showVoteModal}
          onClose={() => setShowVoteModal(false)}
          onSuccess={handleVoteSuccess}
          hpId={hpId}
          groupId={voting.votingGroupId}
          votingId={voting.id}
          votingTitle={voting.title}
          votingType={voting.votingType}
          allowAbstention={voting.allowAbstention}
          options={options}
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
    </>
  );
}
