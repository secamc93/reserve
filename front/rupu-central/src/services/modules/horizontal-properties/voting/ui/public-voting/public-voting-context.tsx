'use client';

import { useState, useEffect } from 'react';
import { Alert, Spinner } from '@shared/ui';
import { getVotingContextAction } from '@/services/modules/horizontal-properties/voting/infrastructure/actions/public-voting';

interface VotingContextData {
  property: {
    id: number;
    name: string;
    address: string;
  };
  voting: {
    id: number;
    title: string;
    description: string;
  };
  voting_group: {
    id: number;
    name: string;
    description: string;
  };
}

interface PublicVotingContextProps {
  publicToken: string;
  onContextLoaded: (context: VotingContextData) => void;
  onError: (error: string) => void;
}

export function PublicVotingContext({
  publicToken,
  onContextLoaded,
  onError
}: PublicVotingContextProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContext = async () => {
      try {
        console.log('🏢 [CONTEXT] Cargando contexto de votación...');
        setLoading(true);

        const result = await getVotingContextAction({
          publicToken
        });

        console.log('📥 [CONTEXT] Resultado de contexto:', result);

        if (result.success && result.data) {
          const logData: any = {
            property: result.data.property.name,
            is_group_token: result.data.is_group_token
          };

          // Solo agregar voting si existe (tokens individuales)
          if (result.data.voting) {
            logData.voting = result.data.voting.title;
          }

          // Solo agregar grupo si existe
          if (result.data.voting_group) {
            logData.group = result.data.voting_group.name;
          }

          console.log('✅ [CONTEXT] Contexto cargado:', logData);

          onContextLoaded(result.data);
        } else {
          console.error('❌ [CONTEXT] Error en la respuesta:', result.error || result.message);
          const errorMessage = result.error || result.message || 'Error al cargar contexto de votación';
          setError(errorMessage);
          onError(errorMessage);
        }
      } catch (err) {
        console.error('❌ [CONTEXT] Error cargando contexto:', err);
        const errorMessage = 'Error de conexión. Por favor, intente nuevamente.';
        setError(errorMessage);
        onError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadContext();
  }, [publicToken, onContextLoaded, onError]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando información de votación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Error de Acceso</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return null; // Este componente solo carga el contexto y pasa al siguiente paso
}

