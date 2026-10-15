/**
 * Votos en tiempo real para el residente (vista de detalle por unidad).
 *
 * Usa el route handler del mismo origen `/public/vote/stream` (no el back directo), reintenta
 * con backoff y cierra el EventSource al desmontar (antes quedaba abierto: con R3 -> progreso
 * quedaban dos conexiones).
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEventStream } from '../../hooks/use-event-stream';

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
}

interface SSEResult {
  voting_option_id: number;
  option_text: string;
  option_code: string;
  color: string;
  vote_count: number;
  percentage: number;
}

/** Ruta relativa (mismo origen) del stream público. `votingId` es obligatorio con token de grupo. */
export function publicVotingStreamPath(votingAuthToken: string, votingId?: number | null): string {
  const query = new URLSearchParams({ token: votingAuthToken });
  if (votingId) query.set('voting_id', String(votingId));
  return `/public/vote/stream?${query.toString()}`;
}

const toPublicVote = (v: SSEVote): PublicVote => ({
  id: v.id,
  voting_id: v.voting_id,
  property_unit_id: v.property_unit_id,
  voting_option_id: v.voting_option_id,
  voted_at: v.voted_at,
  option_text: v.option_text,
  option_code: v.option_code,
  option_color: v.color,
});

export const usePublicVotingSSE = (publicToken: string, enabled: boolean = true, votingId?: number | null) => {
  const [votes, setVotes] = useState<PublicVote[]>([]);
  const [results, setResults] = useState<SSEResult[]>([]);

  const url = useMemo(
    () => (enabled && publicToken ? publicVotingStreamPath(publicToken, votingId) : null),
    [enabled, publicToken, votingId]
  );

  useEffect(() => {
    setVotes([]);
    setResults([]);
  }, [url]);

  const onInitial = useCallback((raw: unknown) => {
    const data = raw as { votes?: SSEVote[] | null; results?: SSEResult[] | null };
    if (Array.isArray(data?.results)) setResults(data.results);
    setVotes(Array.isArray(data?.votes) ? data.votes.map(toPublicVote) : []);
  }, []);

  const onNewVote = useCallback((raw: unknown) => {
    const data = raw as { vote?: SSEVote; results?: SSEResult[] | null };
    if (Array.isArray(data?.results)) setResults(data.results);
    if (!data?.vote) return;
    const vote = toPublicVote(data.vote);
    setVotes((prev) => (prev.some((v) => v.id === vote.id) ? prev : [...prev, vote]));
  }, []);

  const onVoteDeleted = useCallback((raw: unknown) => {
    const data = raw as { vote?: SSEVote; results?: SSEResult[] | null };
    if (Array.isArray(data?.results)) setResults(data.results);
    const deleted = data?.vote;
    if (deleted) setVotes((prev) => prev.filter((v) => v.id !== deleted.id));
  }, []);

  const onVotesReset = useCallback((raw: unknown) => {
    const data = raw as { results?: SSEResult[] | null };
    setVotes([]);
    setResults(Array.isArray(data?.results) ? data.results : []);
  }, []);

  // El back actual no expone votos individuales en el stream público (solo `results`).
  const { status } = useEventStream(url, {
    initial_data: onInitial,
    new_vote: onNewVote,
    vote_deleted: onVoteDeleted,
    votes_reset: onVotesReset,
  });

  const connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' =
    status === 'live' ? 'connected' : status === 'connecting' ? 'connecting' : status === 'idle' ? 'disconnected' : 'reconnecting';

  return {
    votes,
    totalVotes: votes.length,
    results,
    isConnected: status === 'live',
    error: status === 'failed' ? 'Error de conexión con el servidor de votación.' : null,
    connectionStatus,
  };
};
