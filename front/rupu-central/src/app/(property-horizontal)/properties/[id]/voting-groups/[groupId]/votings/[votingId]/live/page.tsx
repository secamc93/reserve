'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PropertyNavigation } from '@/services/modules/horizontal-properties/properties/ui/property-navigation';
import { LiveVotingModal } from '@/services/modules/horizontal-properties/voting/ui/live-voting-modal';
import { getVotingByIdAction, getVotingOptionsAction, getVotesAction } from '@/services/modules/horizontal-properties/voting/infrastructure/actions';
import { TokenStorage } from '@shared/config';
import { Spinner, Alert } from '@shared/ui';

export default function LiveVotingPage() {
  const params = useParams();
  const businessId = parseInt(params.id as string);
  const groupId = parseInt(params.groupId as string);
  const votingId = parseInt(params.votingId as string);

  const [voting, setVoting] = useState<unknown>(null);
  const [options, setOptions] = useState<unknown[]>([]);
  const [votes, setVotes] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVoting();
  }, [businessId, groupId, votingId]);

  const loadVoting = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      // Cargar la votación
      const votingResult = await getVotingByIdAction({
        token,
        businessId,
        groupId,
        votingId,
      });

      if (!votingResult.success || !votingResult.data) {
        setError(votingResult.error || 'Error al cargar la votación');
        return;
      }

      setVoting(votingResult.data);

      // Cargar las opciones de votación
      const optionsResult = await getVotingOptionsAction({
        token,
        businessId,
        groupId,
        votingId,
      });

      if (optionsResult.success && optionsResult.data) {
        setOptions(optionsResult.data || []);
      }

      // Cargar los votos
      const votesResult = await getVotesAction({
        token,
        businessId,
        groupId,
        votingId,
      });

      if (votesResult.success && votesResult.data) {
        setVotes(votesResult.data || []);
      }

    } catch (err) {
      console.error('Error cargando votación:', err);
      setError('Error al cargar la votación');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSuccess = () => {
    // NO recargar datos - el SSE se encargará de actualizar automáticamente
    console.log('✅ Voto registrado exitosamente. SSE actualizará los datos automáticamente.');
  };

  if (isNaN(businessId) || isNaN(groupId) || isNaN(votingId)) {
    return (
      <div>
        <PropertyNavigation businessId={businessId} />
        <div className="p-6">
          <Alert type="error">ID de votación inválido</Alert>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <PropertyNavigation businessId={businessId} />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <Spinner size="xl" text="Cargando votación..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PropertyNavigation businessId={businessId} />
        <div className="p-6">
          <Alert type="error">{error}</Alert>
        </div>
      </div>
    );
  }

  if (!voting) {
    return (
      <div>
        <PropertyNavigation businessId={businessId} />
        <div className="p-6">
          <Alert type="error">Votación no encontrada</Alert>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PropertyNavigation businessId={businessId} />
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => window.history.back()}
                  className="btn btn-outline btn-sm"
                  title="Volver a la lista de votaciones"
                >
                  ← Volver
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                  🗳️ Votación en Vivo
                </h1>
              </div>
              <p className="text-gray-600 mt-2">
                {(voting as any)?.title || 'Cargando...'}
              </p>
              {(voting as any)?.description && (
                <p className="text-gray-500 text-sm mt-1">
                  {(voting as any).description}
                </p>
              )}
              <div className="mt-3 text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  URL: /properties/{businessId}/voting-groups/{groupId}/votings/{votingId}/live
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${(voting as any)?.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}>
                {(voting as any)?.isActive ? '🟢 Activa' : '🔴 Inactiva'}
              </div>
            </div>
          </div>
        </div>

        {/* Live Voting Modal Component */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <LiveVotingModal
            voting={voting as any}
            businessId={businessId}
            options={options as any}
            votes={votes as any}
            isOpen={true}
            onClose={() => {
              // Redirigir a la lista de votaciones
              window.history.back();
            }}
            onVoteSuccess={handleVoteSuccess}
          />
        </div>
      </div>
    </div>
  );
}
