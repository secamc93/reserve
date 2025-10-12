/**
 * Modal: Votar en una Votación
 */

'use client';

import { useState } from 'react';
import { Modal, Spinner } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { createVoteAction } from '../../infrastructure/actions';

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hpId: number;
  groupId: number;
  votingId: number;
  votingTitle: string;
  votingType: string;
  allowAbstention: boolean;
  options: Array<{ id: number; optionText: string; optionCode: string; displayOrder: number }>;
}

export function VoteModal({
  isOpen,
  onClose,
  onSuccess,
  hpId,
  groupId,
  votingId,
  votingTitle,
  votingType,
  allowAbstention,
  options,
}: VoteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedOptionId) {
      setError('Debe seleccionar una opción para votar');
      return;
    }

    setLoading(true);

    try {
      const token = TokenStorage.getToken();
      const user = TokenStorage.getUser();

      if (!token || !user) {
        setError('No se encontró el token de autenticación o información del usuario');
        return;
      }

      // Obtener IP y User Agent del cliente
      const ipAddress = 'client-ip'; // En producción se obtendría del servidor
      const userAgent = navigator.userAgent;

      const result = await createVoteAction({
        token,
        hpId,
        groupId,
        votingId,
        data: {
          votingId,
          votingOptionId: selectedOptionId,
          residentId: parseInt(user.userId), // Asumiendo que el userId es el residentId
          ipAddress,
          userAgent,
          notes: notes.trim() || undefined,
        },
      });

      if (result.success) {
        console.log('✅ Voto registrado:', result.data);
        resetForm();
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Error al registrar el voto');
      }
    } catch (err) {
      console.error('Error registrando voto:', err);
      setError('Error inesperado al registrar el voto');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedOptionId(null);
    setNotes('');
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  // Ordenar opciones por displayOrder
  const sortedOptions = [...options].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Votar: ${votingTitle}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información de la votación */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Información</h3>
          <div className="space-y-1 text-sm text-blue-700">
            <p>Tipo: <span className="font-medium">{votingType}</span></p>
            {allowAbstention && (
              <p className="text-green-700">✓ Permite abstención</p>
            )}
          </div>
        </div>

        {/* Opciones de votación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Selecciona tu voto *
          </label>
          <div className="space-y-2">
            {sortedOptions.map((option) => (
              <label
                key={option.id}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedOptionId === option.id
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
                  disabled={loading}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{option.optionText}</p>
                  <p className="text-sm text-gray-500">Código: {option.optionCode}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Notas opcionales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Agrega un comentario sobre tu voto..."
            rows={3}
            className="input w-full"
            disabled={loading}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="btn btn-outline"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !selectedOptionId}
            className="btn btn-primary min-w-[120px]"
          >
            {loading ? <Spinner size="sm" /> : 'Confirmar Voto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

