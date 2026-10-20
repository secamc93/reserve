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
import { VT, formatOrder, votingFontRoot } from '@/services/modules/horizontal-properties/voting/ui/design';
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
  const [step, setStep] = useState<'context' | 'validation' | 'voting-list' | 'voting' | 'progress' | 'error'>('context');
  const [votingParams, setVotingParams] = useState<VotingParams | null>(null);
  const [votingContext, setVotingContext] = useState<VotingContextData | null>(null);
  const [votingAuthToken, setVotingAuthToken] = useState<string | null>(null);
  const [residentData, setResidentData] = useState<ResidentData | null>(null);
  const [selectedVotingId, setSelectedVotingId] = useState<number | null>(null);
  const [selectedVoting, setSelectedVoting] = useState<GroupVoting | null>(null);
  const [groupVotingsTotal, setGroupVotingsTotal] = useState<number | null>(null);
  const [isGroupToken, setIsGroupToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // Extraer parámetros de la URL
    const token = searchParams.get('token');
    let votingId = searchParams.get('voting_id');
    let businessId = searchParams.get('hp_id');
    const groupId = searchParams.get('group_id');


    if (!token) {
      console.error('❌ [PUBLIC VOTE] Token no encontrado en la URL');
      setError('Token de votación no encontrado. Por favor, escanee el código QR nuevamente.');
      setStep('error');
      setLoading(false);
      return;
    }

    // Si voting_id o hp_id no vienen en la URL, intentar extraerlos del token JWT
    let isGroup = false; // Variable local para detectar token de grupo
    if (!votingId || !businessId) {
      try {
        // Decodificar el token JWT (solo la parte del payload, no validamos la firma aquí)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));

          votingId = votingId || payload.voting_id?.toString();
          businessId = businessId || payload.hp_id?.toString();

          // Detectar si es token de grupo (voting_id ausente o null)
          isGroup = !payload.voting_id;
          setIsGroupToken(isGroup);

        }
      } catch (err) {
        console.error('❌ [PUBLIC VOTE] Error decodificando token:', err);
      }
    }

    // Para tokens de grupo, solo businessId es requerido
    // Para tokens individuales, ambos son requeridos
    if (!businessId || (!votingId && !isGroup)) {
      console.error('❌ [PUBLIC VOTE] Faltan parámetros requeridos:', { votingId, businessId, isGroupToken: isGroup });
      setError('Parámetros de votación inválidos. Por favor, escanee el código QR nuevamente.');
      setStep('error');
      setLoading(false);
      return;
    }


    setVotingParams({ token, voting_id: votingId, hp_id: businessId, group_id: groupId || undefined });
    setLoading(false);
  }, [searchParams]);

  const handleValidationSuccess = (authToken: string, resident: ResidentData) => {
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

  const handleSelectVoting = (votingId: number, voting: GroupVoting, total: number) => {
    setSelectedVotingId(votingId);
    setSelectedVoting(voting);
    setGroupVotingsTotal(total);
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
      <div className={`min-h-screen flex items-center justify-center ${votingFontRoot}`} style={{ background: VT.paper }}>
        <Spinner size="lg" text="Cargando votación..." />
      </div>
    );
  }

  if (error || step === 'error') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-[22px] ${votingFontRoot}`} style={{ background: VT.paper, color: VT.ink }}>
        <div className="max-w-[420px] w-full bg-white rounded-2xl p-6 text-center" style={{ border: `1px solid ${VT.border}` }} role="alert">
          <h1 className="m-0 text-xl font-semibold">No pudimos abrir la votación</h1>
          <p className="mt-2 mb-5 text-sm leading-normal" style={{ color: VT.inkSoft }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="h-11 px-5 rounded-full text-white text-sm font-semibold"
            style={{ background: VT.brand }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!votingParams) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: VT.paper }}>
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
          orderLabel={
            selectedVoting && groupVotingsTotal
              ? `${formatOrder(selectedVoting.display_order)} / ${formatOrder(groupVotingsTotal)}`
              : undefined
          }
          isGroupToken={isGroupToken}
          onBack={isGroupToken ? () => setStep('voting-list') : undefined}
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
