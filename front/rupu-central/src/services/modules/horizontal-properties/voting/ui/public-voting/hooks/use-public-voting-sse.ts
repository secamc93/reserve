import { useEffect, useState, useCallback } from 'react';
import { envPublic } from '@shared/config';

interface PublicVote {
  id: number;
  voting_id: number;
  property_unit_id: number;
  voting_option_id: number;
  voted_at: string;
  option_text: string;
  option_code: string;
  option_color: string;
}

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
}

interface SSEResult {
  voting_option_id: number;
  option_text: string;
  option_code: string;
  color: string;
  vote_count: number;
  percentage: number;
}

export const usePublicVotingSSE = (
  publicToken: string,
  enabled: boolean = true
) => {
  const [votes, setVotes] = useState<PublicVote[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [results, setResults] = useState<SSEResult[]>([]);
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
                  console.log('📦 [PUBLIC SSE] Resultados disponibles:', data.results?.length || 0, 'opciones');
                  
                  // Guardar resultados para usar en conversiones
                  if (data.results && Array.isArray(data.results)) {
                    setResults(data.results);
                  }
                  
                  if (data.votes && Array.isArray(data.votes)) {
                    console.log('📦 [PUBLIC SSE] Primer voto de ejemplo:', data.votes[0]);
                    const preloadedVotes = data.votes.map((vote: SSEVote) => convertSSEVoteToPublicVote(vote));
                    console.log('📦 [PUBLIC SSE] Voto convertido:', preloadedVotes[0]);
                    setVotes(preloadedVotes);
                    setTotalVotes(preloadedVotes.length);
                  }
                  break;

                case 'new_vote':
                  console.log('🗳️ [PUBLIC SSE] Nuevo voto en tiempo real:', data);
                  const newVote = convertSSEVoteToPublicVote(data.vote);
                  console.log('🗳️ [PUBLIC SSE] Nuevo voto convertido:', newVote);
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

  // Convertir voto SSE a formato público (ahora los datos vienen directamente en el voto)
  const convertSSEVoteToPublicVote = (sseVote: SSEVote): PublicVote => {
    console.log('🔍 [SSE CONVERT] Voto:', sseVote.voting_option_id, '| Color directo:', sseVote.color);
    
    return {
      id: sseVote.id,
      voting_id: sseVote.voting_id,
      property_unit_id: sseVote.property_unit_id,
      voting_option_id: sseVote.voting_option_id,
      voted_at: sseVote.voted_at,
      option_text: sseVote.option_text,
      option_code: sseVote.option_code,
      option_color: sseVote.color
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
    results,
    isConnected, 
    error, 
    connectionStatus,
    reconnect: connect
  };
};
