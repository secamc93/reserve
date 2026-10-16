/**
 * Votos en tiempo real del panel en vivo (A6).
 *
 * El navegador se conecta a un route handler del mismo origen
 * (`/properties/:businessId/voting-groups/:groupId/votings/:votingId/live/stream`), que abre el
 * stream contra el back con `API_BASE_URL` del servidor. Así funciona también desde otro
 * dispositivo de la red (antes se usaba NEXT_PUBLIC_API_BASE_URL = localhost:3050).
 * Reintenta con backoff si se corta y cierra el EventSource al desmontar.
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { useEventStream, type EventStreamStatus } from './use-event-stream';

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

export type VotingSSEConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

interface UseVotingSSEReturn {
  votes: SSEVote[];
  isConnected: boolean;
  totalVotes: number;
  error: string | null;
  connectionStatus: VotingSSEConnectionStatus;
  deletedVotes: Array<{ id: number; property_unit_id: number }>;
}

interface UseVotingSSEOptions {
  /** La conexión volvió después de un corte: conviene recargar el detalle (votos anulados mientras tanto). */
  onReconnect?: () => void;
  /** El administrador reseteó la votación (`votes_reset`): la conexión sigue, hay que recargar. */
  onReset?: () => void;
}

const STATUS_MAP: Record<EventStreamStatus, VotingSSEConnectionStatus> = {
  idle: 'disconnected',
  connecting: 'connecting',
  live: 'connected',
  reconnecting: 'reconnecting',
  failed: 'error',
};

/** Ruta relativa (mismo origen) del stream del panel en vivo. */
export function liveVotingStreamPath(businessId: number, groupId: number, votingId: number, token: string): string {
  return `/properties/${businessId}/voting-groups/${groupId}/votings/${votingId}/live/stream?token=${encodeURIComponent(token)}`;
}

export function useVotingSSE(
  businessId: number,
  groupId: number,
  votingId: number,
  enabled: boolean = true,
  { onReconnect, onReset }: UseVotingSSEOptions = {}
): UseVotingSSEReturn {
  const [votes, setVotes] = useState<SSEVote[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [deletedVotes, setDeletedVotes] = useState<Array<{ id: number; property_unit_id: number }>>([]);
  // undefined: aún no leído; null: no hay token.
  const [token, setToken] = useState<string | null | undefined>(undefined);

  // El token vive en el navegador (localStorage): se lee después de montar.
  useEffect(() => {
    if (enabled) setToken(TokenStorage.getBusinessToken());
  }, [enabled]);

  const url = useMemo(
    () => (enabled && businessId && groupId && votingId && token ? liveVotingStreamPath(businessId, groupId, votingId, token) : null),
    [enabled, businessId, groupId, votingId, token]
  );

  // Al desactivar o cambiar de votación, se limpia el estado.
  useEffect(() => {
    setVotes([]);
    setTotalVotes(0);
    setDeletedVotes([]);
  }, [url]);

  const onInitial = useCallback((raw: unknown) => {
    const data = raw as { votes?: SSEVote[] | null };
    const list = Array.isArray(data?.votes) ? data.votes : [];
    setVotes(list);
    setTotalVotes(list.length);
  }, []);

  const onNewVote = useCallback((raw: unknown) => {
    const data = raw as { vote?: SSEVote } & SSEVote;
    const vote = data?.vote || data;
    if (!vote || typeof vote.id !== 'number') return;
    setVotes((prev) => (prev.some((v) => v.id === vote.id) ? prev : [...prev, vote]));
    setTotalVotes((prev) => prev + 1);
  }, []);

  const onVoteDeleted = useCallback((raw: unknown) => {
    const data = raw as { vote?: SSEVote } & SSEVote;
    const vote = data?.vote || data;
    if (!vote || typeof vote.id !== 'number') return;
    setDeletedVotes((prev) => [...prev, { id: vote.id, property_unit_id: vote.property_unit_id }]);
    setVotes((prev) => prev.filter((v) => v.id !== vote.id));
    setTotalVotes((prev) => Math.max(0, prev - 1));
  }, []);

  const onPreloadComplete = useCallback((raw: unknown) => {
    const data = raw as { total_votes?: number };
    if (typeof data?.total_votes === 'number') setTotalVotes(data.total_votes);
  }, []);

  const onResetRef = useRef(onReset);
  onResetRef.current = onReset;
  const onVotesReset = useCallback(() => {
    setVotes([]);
    setTotalVotes(0);
    onResetRef.current?.();
  }, []);

  const { status } = useEventStream(
    url,
    {
      initial_data: onInitial,
      new_vote: onNewVote,
      vote: onNewVote,
      vote_deleted: onVoteDeleted,
      preload_complete: onPreloadComplete,
      votes_reset: onVotesReset,
    },
    { onReconnect }
  );

  const noToken = enabled && token === null;
  const connectionStatus: VotingSSEConnectionStatus = noToken ? 'error' : STATUS_MAP[status];

  return {
    votes,
    isConnected: status === 'live',
    totalVotes,
    error: noToken ? 'No se encontró el token de autenticación' : status === 'failed' ? 'Sin conexión en vivo' : null,
    connectionStatus,
    deletedVotes,
  };
}
