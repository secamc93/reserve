'use client';

/**
 * A6 · Panel en vivo de una votación (y A8, resultado final, cuando está cerrada).
 */

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LiveVotingModal } from '@/services/modules/horizontal-properties/voting/ui/live-voting-modal';
import {
  getVotingByIdAction,
  getVotingGroupsAction,
  getVotingOptionsAction,
  getVotesAction,
  getVotingsAction,
} from '@/services/modules/horizontal-properties/voting/infrastructure/actions';
import type { Vote, Voting, VotingOption } from '@/services/modules/horizontal-properties/voting/domain/entities';
import { TokenStorage } from '@shared/config';
import { Spinner, Alert } from '@shared/ui';

export default function LiveVotingPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = parseInt(params.id as string);
  const groupId = parseInt(params.groupId as string);
  const votingId = parseInt(params.votingId as string);

  const [voting, setVoting] = useState<Voting | null>(null);
  const [options, setOptions] = useState<VotingOption[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [groupName, setGroupName] = useState<string | undefined>(undefined);
  const [groupVotings, setGroupVotings] = useState<Voting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVoting = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }
      const [votingResult, optionsResult, votesResult, groupsResult, votingsResult] = await Promise.all([
        getVotingByIdAction({ token, businessId, groupId, votingId }),
        getVotingOptionsAction({ token, businessId, groupId, votingId }),
        getVotesAction({ token, businessId, groupId, votingId }),
        getVotingGroupsAction({ token, businessId }),
        getVotingsAction({ token, businessId, groupId }),
      ]);
      if (!votingResult.success || !votingResult.data) {
        setError(votingResult.error || 'Error al cargar la votación');
        return;
      }
      setVoting(votingResult.data as Voting);
      setOptions(optionsResult.success && optionsResult.data ? optionsResult.data : []);
      setVotes(votesResult.success && votesResult.data ? (votesResult.data as Vote[]) : []);
      setGroupName(groupsResult.data?.find((g) => g.id === groupId)?.name);
      setGroupVotings((votingsResult.data ?? []).slice().sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (err) {
      console.error('Error cargando votación:', err);
      setError('Error al cargar la votación');
    } finally {
      setLoading(false);
    }
  }, [businessId, groupId, votingId]);

  useEffect(() => {
    loadVoting();
  }, [loadVoting]);

  if (isNaN(businessId) || isNaN(groupId) || isNaN(votingId)) {
    return (
      <div className="p-6">
        <Alert type="error">ID de votación inválido</Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Spinner size="xl" text="Cargando votación..." />
      </div>
    );
  }

  if (error || !voting) {
    return (
      <div className="p-6">
        <Alert type="error">{error || 'Votación no encontrada'}</Alert>
      </div>
    );
  }

  const index = groupVotings.findIndex((v) => v.id === voting.id);
  const next = index >= 0 ? groupVotings[index + 1] : undefined;

  return (
    <LiveVotingModal
      voting={voting}
      businessId={businessId}
      options={options}
      votes={votes}
      isOpen={true}
      groupName={groupName}
      votingsCount={groupVotings.length || null}
      nextVoting={next ? { id: next.id, displayOrder: next.displayOrder, title: next.title } : null}
      onClose={() => router.push(`/properties/${businessId}/voting-groups`)}
      onVoteSuccess={() => {
        // El SSE actualiza el panel; no se recarga.
      }}
    />
  );
}
