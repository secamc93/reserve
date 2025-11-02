/**
 * Modal: Editar Grupo de Votación
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Input, Spinner, Alert } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { VotingGroup, UpdateVotingGroupDTO } from '../../domain/entities';
import { updateVotingGroupAction } from '../../infrastructure/actions/voting-groups/update-voting-group.action';

interface EditVotingGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
  group: VotingGroup;
}

export function EditVotingGroupModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  businessId, 
  group 
}: EditVotingGroupModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados del formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [votingStartDate, setVotingStartDate] = useState('');
  const [votingEndDate, setVotingEndDate] = useState('');
  const [requiresQuorum, setRequiresQuorum] = useState(false);
  const [quorumPercentage, setQuorumPercentage] = useState('');
  const [notes, setNotes] = useState('');

  // Inicializar formulario con datos del grupo
  useEffect(() => {
    if (group && isOpen) {
      setName(group.name);
      setDescription(group.description);
      
      // Convertir fechas ISO a formato local para los inputs datetime-local
      const startDate = new Date(group.votingStartDate);
      const endDate = new Date(group.votingEndDate);
      
      // Ajustar por zona horaria local
      const localStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000);
      const localEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000);
      
      setVotingStartDate(localStartDate.toISOString().slice(0, 16));
      setVotingEndDate(localEndDate.toISOString().slice(0, 16));
      
      setRequiresQuorum(group.requiresQuorum);
      setQuorumPercentage(group.quorumPercentage.toString());
      setNotes(group.notes || '');
      setError(null);
    }
  }, [group, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!votingStartDate || !votingEndDate) {
      setError('Las fechas de inicio y fin son obligatorias');
      return;
    }

    const startDate = new Date(votingStartDate);
    const endDate = new Date(votingEndDate);

    if (startDate >= endDate) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    if (requiresQuorum && (!quorumPercentage || parseFloat(quorumPercentage) <= 0 || parseFloat(quorumPercentage) > 100)) {
      setError('El porcentaje de quórum debe estar entre 1 y 100');
      return;
    }

    setLoading(true);

    try {
      const token = TokenStorage.getToken();
      
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      // Convertir fechas locales a ISO 8601 UTC
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();

      const updateData: UpdateVotingGroupDTO = {
        name: name.trim(),
        description: description.trim() || undefined,
        votingStartDate: startISO,
        votingEndDate: endISO,
        requiresQuorum,
        quorumPercentage: requiresQuorum ? parseFloat(quorumPercentage) : undefined,
        notes: notes.trim() || undefined,
      };

      console.log('🔄 Actualizando grupo de votación:', updateData);

      const result = await updateVotingGroupAction({
        token,
        businessId,
        groupId: group.id,
        data: updateData,
      });

      if (result.success) {
        console.log('✅ Grupo de votación actualizado:', result.data);
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Error al actualizar el grupo de votación');
      }
    } catch (err) {
      console.error('❌ Error actualizando grupo de votación:', err);
      setError('Error inesperado al actualizar el grupo de votación');
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Grupo de Votación" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Información Básica
          </h3>
          
          <Input
            label="Nombre *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Asamblea Ordinaria 2025"
            disabled={loading}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del grupo de votación..."
              disabled={loading}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ color: '#111827' }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Fechas de Votación
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio *
              </label>
              <input
                type="datetime-local"
                value={votingStartDate}
                onChange={(e) => setVotingStartDate(e.target.value)}
                disabled={loading}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ color: '#111827' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin *
              </label>
              <input
                type="datetime-local"
                value={votingEndDate}
                onChange={(e) => setVotingEndDate(e.target.value)}
                disabled={loading}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ color: '#111827' }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Configuración de Quórum
          </h3>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="requiresQuorum"
              checked={requiresQuorum}
              onChange={(e) => setRequiresQuorum(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="requiresQuorum" className="text-sm font-medium text-gray-700">
              Requiere quórum
            </label>
          </div>

          {requiresQuorum && (
            <div className="max-w-xs">
              <Input
                label="Porcentaje de Quórum (%)"
                type="number"
                value={quorumPercentage}
                onChange={(e) => setQuorumPercentage(e.target.value)}
                placeholder="51"
                disabled={loading}
                min="1"
                max="100"
                step="0.1"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Notas Adicionales
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales sobre este grupo de votación..."
              disabled={loading}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ color: '#111827' }}
            />
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
            <span>{loading ? 'Actualizando...' : 'Actualizar Grupo'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
