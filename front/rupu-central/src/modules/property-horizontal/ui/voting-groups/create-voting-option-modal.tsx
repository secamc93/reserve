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
  const [color, setColor] = useState('#3b82f6'); // Color azul por defecto

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

      console.log(`🎨 Color seleccionado en el frontend:`, color.trim());
      
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
          color: color.trim(),
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
    setColor('#3b82f6');
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

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Orden de Visualización"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            placeholder="1"
            disabled={loading}
            min="1"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color de la Opción
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={loading}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                title="Seleccionar color"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#3b82f6"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Formato: #RRGGBB (ej: #22c55e)
            </p>
          </div>
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

