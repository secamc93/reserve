/**
 * Hook personalizado para manejar Server-Sent Events (SSE) de votaciones
 */

import { useEffect, useState, useCallback } from 'react';
import { TokenStorage } from '@shared/config';

// Leer variable de entorno pública directamente
// NEXT_PUBLIC_* se inyecta en build time por Next.js
const getApiBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) {
    throw new Error(
      '❌ NEXT_PUBLIC_API_BASE_URL no definida.\n' +
      'Agrégala a .env.local y ejecuta: rm -rf .next && pnpm run dev'
    );
  }
  return url;
};

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

interface SSEEvent {
  type: 'connected' | 'initial_data' | 'new_vote' | 'vote_deleted' | 'preload_complete' | 'heartbeat';
  data: unknown;
}

interface UseVotingSSEReturn {
  votes: SSEVote[];
  isConnected: boolean;
  totalVotes: number;
  error: string | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  deletedVotes: Array<{ id: number; property_unit_id: number }>; // ✅ NUEVO: Votos eliminados
}

export function useVotingSSE(
  businessId: number,
  groupId: number,
  votingId: number,
  enabled: boolean = true
): UseVotingSSEReturn {
  const [votes, setVotes] = useState<SSEVote[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [deletedVotes, setDeletedVotes] = useState<Array<{ id: number; property_unit_id: number }>>([]);

  const connectToSSE = useCallback(async () => {
    if (!enabled || !businessId || !groupId || !votingId) {
      return;
    }

    try {
      const token = TokenStorage.getToken();
      if (!token) {
        setError('No se encontró el token de autenticación');
        setConnectionStatus('error');
        return;
      }

      setConnectionStatus('connecting');
      setError(null);

      const url = `${getApiBaseUrl()}/horizontal-properties/voting-groups/${groupId}/votings/${votingId}/stream${
        businessId !== undefined ? `?business_id=${businessId}` : ''
      }`;

      console.log('🔌 Conectando a SSE:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No se pudo obtener el stream de datos');
      }

      setConnectionStatus('connected');
      setIsConnected(true);
      console.log('✅ Conectado al SSE de votación');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let eventType = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('🔌 Conexión SSE cerrada por el servidor');
          setConnectionStatus('disconnected');
          setIsConnected(false);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.substring(6).trim();
            continue;
          }

          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.substring(5));
              
              switch (eventType) {
                case 'connected':
                  console.log('✅ SSE: Conectado a votación', data);
                  setIsConnected(true);
                  setConnectionStatus('connected');
                  break;

                case 'initial_data':
                  console.log('📊 SSE: Datos iniciales recibidos', data.votes?.length, 'votos');
                  // Los datos iniciales vienen con estructura { votes: [...], results: [...] }
                  if (data.votes && Array.isArray(data.votes)) {
                    setVotes(data.votes);
                    setTotalVotes(data.votes.length);
                  }
                  break;

                case 'vote':
                case 'new_vote':
                  console.log('📊 SSE: Nuevo voto recibido', data);
                  // El evento new_vote puede venir con estructura { vote: {...}, results: [...] }
                  const voteData = data.vote || data;
                  setVotes(prev => {
                    // Evitar votos duplicados
                    const exists = prev.some(v => v.id === voteData.id);
                    if (exists) return prev;
                    return [...prev, voteData];
                  });
                  setTotalVotes(prev => prev + 1);
                  break;

                case 'vote_deleted':
                  console.log('🗑️ SSE: Voto eliminado recibido', data);
                  // El evento vote_deleted viene con estructura { vote: {...}, results: [...] }
                  const deletedVoteData = data.vote || data;
                  console.log('🗑️ Voto a eliminar:', deletedVoteData);
                  
                  // Agregar a la lista de votos eliminados
                  setDeletedVotes(prev => [...prev, {
                    id: deletedVoteData.id,
                    property_unit_id: deletedVoteData.property_unit_id
                  }]);
                  
                  // Remover el voto de la lista de votos
                  setVotes(prev => prev.filter(v => v.id !== deletedVoteData.id));
                  setTotalVotes(prev => Math.max(0, prev - 1));
                  break;

                case 'preload_complete':
                  console.log('✅ SSE: Precarga completada', data.total_votes, 'votos');
                  setTotalVotes(data.total_votes || 0);
                  break;

                case 'heartbeat':
                  console.log('💓 SSE: Heartbeat', data.timestamp);
                  // Mantener conexión viva
                  break;

                default:
                  console.log('🔔 SSE: Evento desconocido', eventType, data);
              }
            } catch (parseError) {
              console.error('❌ Error parseando evento SSE:', parseError, 'Línea:', line);
            }
          }
        }
      }
    } catch (err) {
      console.error('❌ Error en SSE:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido en la conexión');
      setConnectionStatus('error');
      setIsConnected(false);
    }
  }, [enabled, businessId, groupId, votingId]);

  useEffect(() => {
    if (enabled) {
      connectToSSE();
    } else {
      setConnectionStatus('disconnected');
      setIsConnected(false);
      setVotes([]);
      setTotalVotes(0);
      setDeletedVotes([]);
      setError(null);
    }

    // Cleanup al desmontar
    return () => {
      setConnectionStatus('disconnected');
      setIsConnected(false);
    };
  }, [enabled, connectToSSE]);

  return {
    votes,
    isConnected,
    totalVotes,
    error,
    connectionStatus,
    deletedVotes,
  };
}


