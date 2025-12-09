/**
 * Componente: Pantalla de Votación Pública
 */

'use client';

import { useState, useEffect } from 'react';
import { Alert, Spinner } from '@shared/ui';
import { getVotingInfoAction, submitPublicVoteAction } from '@/services/modules/horizontal-properties/voting/infrastructure/actions/public-voting';

interface VotingOption {
  id: number;
  option_text: string;
  option_code: string;
  display_order: number;
}

interface MyVote {
  id: number;
  voting_option_id: number;
  option_text: string;      // ✅ NUEVO
  option_code: string;      // ✅ NUEVO
  voted_at: string;
}

interface VoteResult {
  voting_option_id: number;
  option_text: string;
  vote_count: number;
  percentage: number;
}

interface PublicVotingScreenProps {
  votingAuthToken: string;
  residentData: {
    id: number;
    name: string;
    unitNumber: string;
  };
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function PublicVotingScreen({
  votingAuthToken,
  residentData,
  onSuccess,
  onError
}: PublicVotingScreenProps) {
  const [votingData, setVotingData] = useState<{ title: string; description: string; voting_type?: string } | null>(null);
  const [options, setOptions] = useState<VotingOption[]>([]);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [myVote, setMyVote] = useState<MyVote | null>(null);
  const [results, setResults] = useState<VoteResult[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      await loadVotingData();
    };
    loadData();
  }, [votingAuthToken]);

  const loadVotingData = async () => {
    try {
      console.log('📊 [VOTING SCREEN] Cargando información de votación...');
      setLoading(true);

      // El backend extrae voting_id, hp_id, group_id y resident_id del token
      // Endpoint único que retorna toda la información de la votación
      const result = await getVotingInfoAction({
        votingAuthToken
      });

      console.log('📥 [VOTING SCREEN] Resultado de voting-info:', result);

      if (result.success && result.data) {
        console.log('📋 [VOTING SCREEN] Datos recibidos del backend:', result.data);

        // Validar que tengamos las opciones
        if (!result.data.options || !Array.isArray(result.data.options)) {
          console.error('❌ [VOTING SCREEN] Backend no retornó opciones. Estructura recibida:', result.data);
          throw new Error('El backend no retornó las opciones de votación. Por favor, contacte al administrador.');
        }

        // El backend retorna: { voting: {...}, options: [...], has_voted: boolean, my_vote?: {...}, results?: [...] }
        console.log('✅ [VOTING SCREEN] Votación cargada:', {
          voting: result.data.voting?.title,
          options: result.data.options.length,
          has_voted: result.data.has_voted,
          has_my_vote: !!result.data.my_vote,
          has_results: !!result.data.results
        });

        setVotingData(result.data.voting);
        setOptions(result.data.options.sort((a: VotingOption, b: VotingOption) => a.display_order - b.display_order));
        setHasVoted(result.data.has_voted);

        // Si el residente ya votó, mostrar confirmación y luego ir al progreso
        if (result.data.has_voted) {
          console.log('✅ [VOTING SCREEN] Residente ya votó, redirigiendo al progreso');
          setMyVote(result.data.my_vote || null);
          setResults(result.data.results || []);
          // Mostrar confirmación por 2 segundos y luego ir al progreso
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } else {
        console.error('❌ [VOTING SCREEN] Error en la respuesta:', result.error || result.message);
        throw new Error(result.error || result.message || 'Error al cargar datos de votación');
      }
    } catch (err) {
      console.error('❌ [VOTING SCREEN] Error cargando datos de votación:', err);
      onError('Error al cargar la información de la votación');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOptionId) {
      console.warn('⚠️ [VOTE] No se seleccionó ninguna opción');
      setError('Por favor, seleccione una opción para votar');
      return;
    }

    console.log('🗳️ [VOTE] Registrando voto:', {
      votingOptionId: selectedOptionId,
      residentName: residentData.name
    });

    setSubmitting(true);
    setError(null);

    try {
      // El backend extrae resident_id, voting_id, hp_id y group_id del token
      const result = await submitPublicVoteAction({
        votingAuthToken,
        votingOptionId: selectedOptionId,
      });

      console.log('📥 [VOTE] Resultado del voto:', result);

      if (result.success) {
        console.log('✅ [VOTE] Voto registrado exitosamente');
        // Mostrar confirmación por 2 segundos y luego ir al progreso
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        console.error('❌ [VOTE] Error al registrar voto:', result.error || result.message);
        setError(result.error || result.message || 'Error al registrar el voto');
      }
    } catch (err) {
      console.error('❌ [VOTE] Error registrando voto:', err);
      setError('Error de conexión. Por favor, intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 mb-4">
              <span className="text-2xl">🗳️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {votingData?.title || 'Votación'}
            </h1>
            <p className="text-gray-600 mb-4">
              {votingData?.description || 'Seleccione su opción de voto'}
            </p>

            {/* Información del residente */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Votando como:</span> {residentData.name}
              </p>
              <p className="text-sm text-blue-600">
                <span className="font-medium">Unidad:</span> {residentData.unitNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido según si ya votó o no */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-4">
              <Alert type="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </div>
          )}

          {hasVoted ? (
            // Mostrar mensaje de redirección al progreso
            <div className="space-y-6 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-green-800 mb-2">✅ Tu voto ha sido registrado</h2>
                {myVote && (
                  <p className="text-green-700 mb-4">
                    Votaste por: <strong>{myVote.option_text}</strong>
                    <span className="text-green-600 text-sm ml-2">({myVote.option_code})</span>
                  </p>
                )}
                <div className="flex items-center justify-center">
                  <Spinner size="sm" />
                  <span className="ml-2 text-green-600">Redirigiendo al progreso de votación...</span>
                </div>
              </div>
            </div>
          ) : (
            // Mostrar opciones de votación si no ha votado
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Seleccione su voto:
              </h2>

              <div className="space-y-3">
                {options.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedOptionId === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="radio"
                      name="vote-option"
                      value={option.id}
                      checked={selectedOptionId === option.id}
                      onChange={() => setSelectedOptionId(option.id)}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">{option.option_text}</p>
                      <p className="text-sm text-gray-500">Código: {option.option_code}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleVote}
                  disabled={!selectedOptionId || submitting}
                  className="w-full sm:w-auto px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" />
                      <span className="ml-2">Registrando voto...</span>
                    </>
                  ) : (
                    'Confirmar Voto'
                  )}
                </button>
              </div>

              {/* Información adicional */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Una vez confirmado, su voto no se puede cambiar</p>
                  <p>• Su voto es confidencial y seguro</p>
                  <p>• Los resultados se mostrarán en tiempo real</p>
                  {votingData?.voting_type && (
                    <p>• Tipo de votación: {votingData.voting_type}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


