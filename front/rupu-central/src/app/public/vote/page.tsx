/**
 * Página Pública de Votación
 * Accesible solo con token de votación pública
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicVotingContext } from '@/services/modules/horizontal-properties/voting/ui/public-voting/public-voting-context';
import { PublicVotingValidation } from '@/services/modules/horizontal-properties/voting/ui/public-voting/public-voting-validation';
import { PublicVotingsList } from '@/services/modules/horizontal-properties/voting/ui/public-voting/public-votings-list';
import { PublicVotingScreen } from '@/services/modules/horizontal-properties/voting/ui/public-voting/public-voting-screen';
import { PublicVotingProgress } from '@/services/modules/horizontal-properties/voting/ui/public-voting/public-voting-progress';
import { Spinner } from '@shared/ui';
import type { GroupVoting } from '@/services/modules/horizontal-properties/voting/infrastructure/actions/public-voting';

interface VotingParams {
  token: string;
  voting_id: string | null;
  hp_id: string;
  group_id?: string;
}

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

interface ResidentData {
  id: number;
  name: string;
  unitNumber: string;
  votingId: number;
  businessId: number;
  groupId?: number;
}

function PublicVotePageContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'context' | 'validation' | 'voting-list' | 'voting' | 'progress' | 'success' | 'error'>('context');
  const [votingParams, setVotingParams] = useState<VotingParams | null>(null);
  const [votingContext, setVotingContext] = useState<VotingContextData | null>(null);
  const [votingAuthToken, setVotingAuthToken] = useState<string | null>(null);
  const [residentData, setResidentData] = useState<ResidentData | null>(null);
  const [selectedVotingId, setSelectedVotingId] = useState<number | null>(null);
  const [selectedVoting, setSelectedVoting] = useState<GroupVoting | null>(null);
  const [isGroupToken, setIsGroupToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 [PUBLIC VOTE] Iniciando validación de parámetros...');

    // Extraer parámetros de la URL
    const token = searchParams.get('token');
    let votingId = searchParams.get('voting_id');
    let businessId = searchParams.get('hp_id');
    const groupId = searchParams.get('group_id');

    console.log('📥 [PUBLIC VOTE] Parámetros recibidos de la URL:', {
      token: token ? `${token.substring(0, 20)}...` : null,
      voting_id: votingId,
      hp_id: businessId,
      group_id: groupId
    });

    if (!token) {
      console.error('❌ [PUBLIC VOTE] Token no encontrado en la URL');
      setError('Token de votación no encontrado. Por favor, escanee el código QR nuevamente.');
      setStep('error');
      setLoading(false);
      return;
    }

    // Si voting_id o hp_id no vienen en la URL, intentar extraerlos del token JWT
    if (!votingId || !businessId) {
      console.log('🔓 [PUBLIC VOTE] voting_id o hp_id no en URL, extrayendo del token...');
      try {
        // Decodificar el token JWT (solo la parte del payload, no validamos la firma aquí)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('📋 [PUBLIC VOTE] Payload del token:', payload);

          votingId = votingId || payload.voting_id?.toString();
          businessId = businessId || payload.hp_id?.toString();

          // Detectar si es token de grupo (voting_id ausente o null)
          const isGroup = !payload.voting_id;
          setIsGroupToken(isGroup);

          console.log('✅ [PUBLIC VOTE] Datos extraídos del token:', {
            votingId,
            businessId,
            groupId: payload.voting_group_id,
            isGroupToken: isGroup
          });
        }
      } catch (err) {
        console.error('❌ [PUBLIC VOTE] Error decodificando token:', err);
      }
    }

    // Para tokens de grupo, solo businessId es requerido
    // Para tokens individuales, ambos son requeridos
    if (!businessId || (!votingId && !isGroupToken)) {
      console.error('❌ [PUBLIC VOTE] Faltan parámetros requeridos:', { votingId, businessId, isGroupToken });
      setError('Parámetros de votación inválidos. Por favor, escanee el código QR nuevamente.');
      setStep('error');
      setLoading(false);
      return;
    }

    console.log('✅ [PUBLIC VOTE] Parámetros validados correctamente:', {
      token: 'OK',
      voting_id: votingId,
      hp_id: businessId,
      group_id: groupId
    });

    setVotingParams({ token, voting_id: votingId, hp_id: businessId, group_id: groupId || undefined });
    setLoading(false);
  }, [searchParams]);

  const handleValidationSuccess = (authToken: string, resident: ResidentData) => {
    console.log('✅ [PUBLIC VOTE] Validación exitosa, token de grupo:', isGroupToken);
    setVotingAuthToken(authToken);
    setResidentData(resident);

    // Si es token de grupo, ir a lista de votaciones
    // Si es token individual, ir directamente a votar
    if (isGroupToken) {
      setStep('voting-list');
    } else {
      setStep('voting');
    }
  };

  const handleSelectVoting = (votingId: number, voting: GroupVoting) => {
    console.log('📋 [PUBLIC VOTE] Votación seleccionada:', votingId, voting.title);
    setSelectedVotingId(votingId);
    setSelectedVoting(voting);
    setStep('voting');
  };

  const handleVoteSuccess = () => {
    setStep('progress');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setStep('error');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando votación...</p>
        </div>
      </div>
    );
  }

  if (error || step === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Error de Acceso</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">¡Voto Registrado!</h1>
            <p className="text-gray-600 mb-4">
              Su voto ha sido registrado exitosamente. Gracias por participar.
            </p>
            <button
              onClick={() => window.close()}
              className="btn btn-primary"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!votingParams) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {step === 'context' && votingParams && (
        <PublicVotingContext
          publicToken={votingParams.token}
          onContextLoaded={(context) => {
            setVotingContext(context);
            setStep('validation');
          }}
          onError={handleError}
        />
      )}

      {step === 'validation' && votingParams && votingContext && (
        <PublicVotingValidation
          publicToken={votingParams.token}
          votingContext={votingContext}
          onSuccess={handleValidationSuccess}
          onError={handleError}
        />
      )}

      {step === 'voting-list' && votingAuthToken && residentData && (
        <PublicVotingsList
          votingAuthToken={votingAuthToken}
          residentData={{
            id: residentData.id,
            name: residentData.name,
            unitNumber: residentData.unitNumber
          }}
          onSelectVoting={handleSelectVoting}
          onError={handleError}
        />
      )}

      {step === 'voting' && votingAuthToken && residentData && (
        <PublicVotingScreen
          votingAuthToken={votingAuthToken}
          residentData={residentData}
          selectedVotingId={selectedVotingId}
          onSuccess={handleVoteSuccess}
          onError={handleError}
        />
      )}

      {step === 'progress' && votingAuthToken && (
        <PublicVotingProgress
          votingAuthToken={votingAuthToken}
        />
      )}
    </div>
  );
}

export default function PublicVotePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <PublicVotePageContent />
    </Suspense>
  );
}
