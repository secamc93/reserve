/**
 * Modal: Crear Opción de Votación
 */

'use client';

import { useState } from 'react';
import { Modal, Input, Spinner } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { createVotingOptionAction } from '../../infrastructure/actions';

interface CreateVotingOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hpId: number;
  groupId: number;
  votingId: number;
}

export function CreateVotingOptionModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  hpId, 
  groupId, 
  votingId 
}: CreateVotingOptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos
  const [optionText, setOptionText] = useState('');
  const [optionCode, setOptionCode] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!optionText.trim() || !optionCode.trim()) {
      setError('Los campos Texto y Código son obligatorios');
      return;
    }

    setLoading(true);

    try {
      const token = TokenStorage.getToken();
      
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      const result = await createVotingOptionAction({
        token,
        hpId,
        groupId,
        votingId,
        data: {
          votingId,
          optionText: optionText.trim(),
          optionCode: optionCode.trim(),
          displayOrder: parseInt(displayOrder),
        },
      });

      if (result.success) {
        console.log('✅ Opción de votación creada:', result.data);
        resetForm();
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Error al crear la opción');
      }
    } catch (err) {
      console.error('Error creando opción de votación:', err);
      setError('Error inesperado al crear la opción');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOptionText('');
    setOptionCode('');
    setDisplayOrder('1');
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Opción de Votación" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Texto de la Opción *"
          value={optionText}
          onChange={(e) => setOptionText(e.target.value)}
          placeholder="Ej: A favor"
          disabled={loading}
          required
        />

        <Input
          label="Código *"
          value={optionCode}
          onChange={(e) => setOptionCode(e.target.value)}
          placeholder="Ej: SI"
          disabled={loading}
          required
        />

        <Input
          label="Orden de Visualización"
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
          placeholder="1"
          disabled={loading}
          min="1"
        />

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
            disabled={loading}
            className="btn btn-primary min-w-[120px]"
          >
            {loading ? <Spinner size="sm" /> : 'Agregar Opción'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

