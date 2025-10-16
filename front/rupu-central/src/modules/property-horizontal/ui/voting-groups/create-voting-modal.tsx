/**
 * Modal: Crear Votación
 */

'use client';

import { useState } from 'react';
import { Modal, Input, Spinner } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { createVotingAction } from '../../infrastructure/actions';

interface CreateVotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hpId: number;
  groupId: number;
}

export function CreateVotingModal({ isOpen, onClose, onSuccess, hpId, groupId }: CreateVotingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [votingType, setVotingType] = useState<'simple' | 'multiple' | 'weighted'>('simple');
  const [isSecret, setIsSecret] = useState(false);
  const [allowAbstention, setAllowAbstention] = useState(true);
  const [displayOrder, setDisplayOrder] = useState('1');
  const [requiredPercentage, setRequiredPercentage] = useState('50');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!title.trim() || !description.trim()) {
      setError('Los campos Título y Descripción son obligatorios');
      return;
    }

    setLoading(true);

    try {
      const token = TokenStorage.getToken();
      
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      const result = await createVotingAction({
        token,
        hpId,
        groupId,
        data: {
          votingGroupId: groupId,
          title: title.trim(),
          description: description.trim(),
          votingType,
          isSecret,
          allowAbstention,
          displayOrder: parseInt(displayOrder),
          requiredPercentage: parseFloat(requiredPercentage),
        },
      });

      if (result.success) {
        console.log('✅ Votación creada:', result.data);
        resetForm();
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Error al crear la votación');
      }
    } catch (err) {
      console.error('Error creando votación:', err);
      setError('Error inesperado al crear la votación');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVotingType('simple');
    setIsSecret(false);
    setAllowAbstention(true);
    setDisplayOrder('1');
    setRequiredPercentage('50');
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Votación" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Información Básica
          </h3>
          
          <Input
            label="Título *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Aprobación del presupuesto 2025"
            disabled={loading}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la votación..."
              rows={3}
              className="input w-full"
              disabled={loading}
              required
              style={{ color: '#111827' }}
            />
          </div>

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

            <Input
              label="Porcentaje Requerido (%)"
              type="number"
              value={requiredPercentage}
              onChange={(e) => setRequiredPercentage(e.target.value)}
              placeholder="50"
              disabled={loading}
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>

        {/* Tipo de Votación */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Configuración
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Votación
            </label>
            <select
              value={votingType}
              onChange={(e) => setVotingType(e.target.value as 'simple' | 'multiple' | 'weighted')}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="simple">Simple (una opción)</option>
              <option value="multiple">Múltiple (varias opciones)</option>
              <option value="weighted">Ponderada (con peso)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSecret}
                onChange={(e) => setIsSecret(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 font-medium">
                Votación secreta
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowAbstention}
                onChange={(e) => setAllowAbstention(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 font-medium">
                Permitir abstención
              </span>
            </label>
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
            {loading ? <Spinner size="sm" /> : 'Crear Votación'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

