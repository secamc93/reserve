/**
 * Componente: Lista de Votaciones del Grupo (Público)
 */

'use client';

import { useState, useEffect } from 'react';
import { Alert, Spinner } from '@shared/ui';
import { getGroupVotingsAction, type GroupVoting } from '@/services/modules/horizontal-properties/voting/infrastructure/actions/public-voting';

interface PublicVotingsListProps {
  votingAuthToken: string;
  residentData: {
    id: number;
    name: string;
    unitNumber: string;
  };
  onSelectVoting: (votingId: number, voting: GroupVoting) => void;
  onError: (error: string) => void;
}

export function PublicVotingsList({
  votingAuthToken,
  residentData,
  onSelectVoting,
  onError
}: PublicVotingsListProps) {
  const [votings, setVotings] = useState<GroupVoting[]>([]);
  const [groupInfo, setGroupInfo] = useState<{
    id: number;
    name: string;
    description: string;
  } | null>(null);
  const [stats, setStats] = useState({
    totalVotings: 0,
    activeVotings: 0,
    userVotesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVotings();
  }, [votingAuthToken]);

  const loadVotings = async () => {
    try {
      console.log('📊 [VOTINGS LIST] Cargando votaciones del grupo...');
      setLoading(true);
      setError(null);

      const result = await getGroupVotingsAction({ votingAuthToken });

      console.log('📥 [VOTINGS LIST] Resultado:', result);

      if (result.success && result.data) {
        // Asegurar que votings sea siempre un array (nunca null)
        setVotings(result.data.votings || []);
        setGroupInfo(result.data.voting_group);
        setStats({
          totalVotings: result.data.total_votings || 0,
          activeVotings: result.data.active_votings || 0,
          userVotesCount: result.data.user_votes_count || 0
        });
        console.log('✅ [VOTINGS LIST] Votaciones cargadas:', result.data.total_votings);
      } else {
        throw new Error(result.error || 'Error al cargar votaciones');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar votaciones';
      console.error('❌ [VOTINGS LIST] Error:', errorMessage);
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando votaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert type="error">
            <div>
              <p className="font-semibold mb-1">Error</p>
              <p>{error}</p>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 mb-4">
              <span className="text-2xl">🗳️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {groupInfo?.name || 'Grupo de Votaciones'}
            </h1>
            {groupInfo?.description && (
              <p className="text-gray-600 mb-4">{groupInfo.description}</p>
            )}
            <p className="text-sm text-gray-500 mb-4">
              Seleccione la votación en la que desea participar
            </p>

            {/* Info del residente */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Residente:</span> {residentData.name}
              </p>
              <p className="text-sm text-blue-600">
                <span className="font-medium">Unidad:</span> {residentData.unitNumber}
              </p>
            </div>

            {/* Estadísticas */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-900">{stats.totalVotings}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-700">{stats.activeVotings}</p>
                <p className="text-xs text-green-600">Activas</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-blue-700">{stats.userVotesCount}</p>
                <p className="text-xs text-blue-600">Mis votos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de votaciones */}
        <div className="space-y-4">
          {!votings || votings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">No hay votaciones disponibles</p>
            </div>
          ) : (
            votings.map((voting) => (
              <div
                key={voting.id}
                className={`bg-white rounded-lg shadow-md p-6 transition-all ${
                  voting.has_voted || !voting.is_active
                    ? 'opacity-60'
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-lg font-semibold text-gray-900">
                        {voting.display_order}. {voting.title}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          voting.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {voting.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                      {voting.has_voted && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          ✓ Ya votaste
                        </span>
                      )}
                    </div>
                    {voting.description && (
                      <p className="text-sm text-gray-600 mb-2">{voting.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Tipo: {voting.voting_type}</span>
                      <span>Opciones: {voting.options_count}</span>
                      {voting.required_percentage && (
                        <span>Requerido: {voting.required_percentage}%</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => onSelectVoting(voting.id, voting)}
                    disabled={voting.has_voted || !voting.is_active}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      voting.has_voted || !voting.is_active
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {voting.has_voted
                      ? 'Ya votaste'
                      : voting.is_active
                        ? 'Votar ahora'
                        : 'Inactiva'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
