/**
 * Modal: Editar Votación
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Input, Spinner, Alert } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { Voting, UpdateVotingDTO } from '../../domain/entities';
import { updateVotingAction } from '../../infrastructure/actions/update-voting.action';

interface EditVotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
  groupId: number;
  voting: Voting;
}

export function EditVotingModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  businessId,
  groupId,
  voting 
}: EditVotingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados del formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [votingType, setVotingType] = useState('simple');
  const [isSecret, setIsSecret] = useState(false);
  const [allowAbstention, setAllowAbstention] = useState(true);
  const [displayOrder, setDisplayOrder] = useState('');
  const [requiredPercentage, setRequiredPercentage] = useState('');

  // Inicializar formulario con datos de la votación
  useEffect(() => {
    if (voting && isOpen) {
      setTitle(voting.title);
      setDescription(voting.description);
      setVotingType(voting.votingType);
      setIsSecret(voting.isSecret);
      setAllowAbstention(voting.allowAbstention);
      setDisplayOrder(voting.displayOrder.toString());
      setRequiredPercentage(voting.requiredPercentage.toString());
      setError(null);
    }
  }, [voting, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    if (!description.trim()) {
      setError('La descripción es obligatoria');
      return;
    }

    const displayOrderNum = parseInt(displayOrder);
    const requiredPercentageNum = parseFloat(requiredPercentage);

    if (isNaN(displayOrderNum) || displayOrderNum <= 0) {
      setError('El orden de visualización debe ser un número positivo');
      return;
    }

    if (isNaN(requiredPercentageNum) || requiredPercentageNum <= 0 || requiredPercentageNum > 100) {
      setError('El porcentaje requerido debe estar entre 1 y 100');
      return;
    }

    setLoading(true);

    try {
      const token = TokenStorage.getToken();
      
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      const updateData: UpdateVotingDTO = {
        title: title.trim(),
        description: description.trim(),
        votingType: votingType as 'simple' | 'multiple' | 'weighted' | 'majority',
        isSecret,
        allowAbstention,
        displayOrder: displayOrderNum,
        requiredPercentage: requiredPercentageNum,
      };

      console.log('🔄 Actualizando votación:', updateData);

      const result = await updateVotingAction({
        token,
        businessId,
        groupId,
        votingId: voting.id,
        data: updateData,
      });

      if (result.success) {
        console.log('✅ Votación actualizada:', result.data);
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Error al actualizar la votación');
      }
    } catch (err) {
      console.error('❌ Error actualizando votación:', err);
      setError('Error inesperado al actualizar la votación');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Votación" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la votación..."
              disabled={loading}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ color: '#111827' }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Orden de Visualización *"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              placeholder="1"
              disabled={loading}
              min="1"
              required
            />

            <Input
              label="Porcentaje Requerido (%) *"
              type="number"
              value={requiredPercentage}
              onChange={(e) => setRequiredPercentage(e.target.value)}
              placeholder="50"
              disabled={loading}
              min="1"
              max="100"
              step="0.1"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Configuración
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Votación
            </label>
            <select
              value={votingType}
              onChange={(e) => setVotingType(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ color: '#111827' }}
            >
              <option value="simple">Simple</option>
              <option value="multiple">Múltiple</option>
              <option value="weighted">Ponderada</option>
              <option value="majority">Mayoría</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isSecret"
                checked={isSecret}
                onChange={(e) => setIsSecret(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isSecret" className="text-sm font-medium text-gray-700">
                Votación secreta
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="allowAbstention"
                checked={allowAbstention}
                onChange={(e) => setAllowAbstention(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="allowAbstention" className="text-sm font-medium text-gray-700">
                Permitir abstención
              </label>
            </div>
          </div>
        </div>

        {error && (
          <Alert type="error">
            {error}
          </Alert>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && <Spinner size="sm" />}
            <span>{loading ? 'Actualizando...' : 'Actualizar Votación'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
