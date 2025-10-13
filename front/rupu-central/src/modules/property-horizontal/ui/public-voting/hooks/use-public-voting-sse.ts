import { useEffect, useState, useCallback } from 'react';
import { envPublic } from '@shared/config';

interface PublicVote {
  id: number;
  voting_id: number;
  resident_id: number;
  voting_option_id: number;
  voted_at: string;
}

interface SSEVote {
  id: number;
  voting_id: number;
  resident_id: number;
  voting_option_id: number;
  voted_at: string;
}

export const usePublicVotingSSE = (
  publicToken: string,
  enabled: boolean = true
) => {
  const [votes, setVotes] = useState<PublicVote[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const connect = useCallback(async () => {
    if (!publicToken || !enabled) {
      console.log('🔌 [PUBLIC SSE] Token no disponible o SSE deshabilitado');
      return;
    }

    setConnectionStatus('connecting');
    setError(null);

    try {
      // URL del SSE para votación pública - Token por query string según documentación
      const url = `${envPublic.API_BASE_URL}/public/voting-stream?token=${publicToken}`;
      
      console.log('🔌 [PUBLIC SSE] Conectando a:', url);

      const response = await fetch(url, {
        headers: {
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
      console.log('✅ [PUBLIC SSE] Conectado al stream de votación pública');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let eventType = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('🔌 [PUBLIC SSE] Conexión cerrada por el servidor');
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
                  console.log('✅ [PUBLIC SSE] Conectado a votación pública', data);
                  setIsConnected(true);
                  setConnectionStatus('connected');
                  break;

                case 'initial_data':
                  console.log('📦 [PUBLIC SSE] Precarga de votos existentes:', data.votes?.length || 0, 'votos');
                  if (data.votes && Array.isArray(data.votes)) {
                    const preloadedVotes = data.votes.map(convertSSEVoteToPublicVote);
                    setVotes(preloadedVotes);
                    setTotalVotes(preloadedVotes.length);
                  }
                  break;

                case 'new_vote':
                  console.log('🗳️ [PUBLIC SSE] Nuevo voto en tiempo real:', data);
                  const newVote = convertSSEVoteToPublicVote(data);
                  setVotes(prev => {
                    const exists = prev.some(v => v.id === newVote.id);
                    if (exists) return prev;
                    return [...prev, newVote];
                  });
                  setTotalVotes(prev => prev + 1);
                  break;

                case 'heartbeat':
                  console.log('💓 [PUBLIC SSE] Heartbeat:', data.timestamp);
                  break;
              }
            } catch (parseError) {
              console.error('❌ [PUBLIC SSE] Error al parsear mensaje:', parseError);
              setError('Error al procesar actualización de voto.');
            }
          }
        }
      }
    } catch (err) {
      console.error('❌ [PUBLIC SSE] Error de conexión:', err);
      setError('Error de conexión con el servidor de votación.');
      setConnectionStatus('disconnected');
      setIsConnected(false);
    }
  }, [publicToken, enabled]);

  const disconnect = useCallback(() => {
    console.log('🔌 [PUBLIC SSE] Desconectando...');
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  // Convertir voto SSE a formato público
  const convertSSEVoteToPublicVote = (sseVote: SSEVote): PublicVote => {
    return {
      id: sseVote.id,
      voting_id: sseVote.voting_id,
      resident_id: sseVote.resident_id,
      voting_option_id: sseVote.voting_option_id,
      voted_at: sseVote.voted_at
    };
  };

  useEffect(() => {
    if (enabled && publicToken) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, enabled, publicToken]);

  return { 
    votes, 
    totalVotes, 
    isConnected, 
    error, 
    connectionStatus,
    reconnect: connect
  };
};
