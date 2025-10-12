/**
 * Modal: Crear Grupo de Votación
 */

'use client';

import { useState } from 'react';
import { Modal, Input, Spinner } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { createVotingGroupAction } from '../../infrastructure/actions';

interface CreateVotingGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
}

export function CreateVotingGroupModal({ isOpen, onClose, onSuccess, businessId }: CreateVotingGroupModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos requeridos
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [votingStartDate, setVotingStartDate] = useState('');
  const [votingEndDate, setVotingEndDate] = useState('');
  
  // Quórum
  const [requiresQuorum, setRequiresQuorum] = useState(true);
  const [quorumPercentage, setQuorumPercentage] = useState('50');
  
  // Notas
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!name.trim() || !description.trim() || !votingStartDate || !votingEndDate) {
      setError('Los campos Nombre, Descripción, Fecha de Inicio y Fecha de Fin son obligatorios');
      return;
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (new Date(votingEndDate) <= new Date(votingStartDate)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
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

      // Convertir fechas a formato ISO 8601 con segundos y zona horaria
      const startDateISO = new Date(votingStartDate).toISOString();
      const endDateISO = new Date(votingEndDate).toISOString();

      const result = await createVotingGroupAction({
        token,
        data: {
          businessId,
          name: name.trim(),
          description: description.trim(),
          votingStartDate: startDateISO,
          votingEndDate: endDateISO,
          requiresQuorum,
          quorumPercentage: parseFloat(quorumPercentage),
          createdByUserId: parseInt(user.userId),
          notes: notes.trim() || undefined,
        },
      });

      if (result.success) {
        console.log('✅ Grupo de votación creado:', result.data);
        resetForm();
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Error al crear el grupo de votación');
      }
    } catch (err) {
      console.error('Error creando grupo de votación:', err);
      setError('Error inesperado al crear el grupo de votación');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setVotingStartDate('');
    setVotingEndDate('');
    setRequiresQuorum(true);
    setQuorumPercentage('50');
    setNotes('');
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Grupo de Votación" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del grupo de votación..."
              rows={3}
              className="input w-full"
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Fechas de Votación */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Periodo de Votación
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y Hora de Inicio *
              </label>
              <input
                type="datetime-local"
                value={votingStartDate}
                onChange={(e) => setVotingStartDate(e.target.value)}
                disabled={loading}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y Hora de Fin *
              </label>
              <input
                type="datetime-local"
                value={votingEndDate}
                onChange={(e) => setVotingEndDate(e.target.value)}
                disabled={loading}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Configuración de Quórum */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Configuración de Quórum
          </h3>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={requiresQuorum}
              onChange={(e) => setRequiresQuorum(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 font-medium">
              Requiere quórum
            </span>
          </label>

          {requiresQuorum && (
            <div className="pl-6 border-l-2 border-blue-200">
              <Input
                label="Porcentaje de Quórum (%)"
                type="number"
                value={quorumPercentage}
                onChange={(e) => setQuorumPercentage(e.target.value)}
                placeholder="50"
                disabled={loading}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          )}
        </div>

        {/* Notas Adicionales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Notas Adicionales
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas o comentarios adicionales..."
              rows={3}
              className="input w-full"
              disabled={loading}
            />
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
            {loading ? <Spinner size="sm" /> : 'Crear Grupo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

