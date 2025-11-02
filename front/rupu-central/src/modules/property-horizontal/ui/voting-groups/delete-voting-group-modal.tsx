/**
 * Modal: Confirmar Eliminación de Grupo de Votación
 */

'use client';

import { useState } from 'react';
import { Modal, Spinner, Alert } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { VotingGroup } from '../../domain/entities';
import { deleteVotingGroupAction } from '../../infrastructure/actions/voting-groups/delete-voting-group.action';

interface DeleteVotingGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessId: number;
  group: VotingGroup | null;
}

export function DeleteVotingGroupModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  businessId, 
  group 
}: DeleteVotingGroupModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!group) return;

    setError(null);
    setLoading(true);

    try {
      const token = TokenStorage.getToken();
      
      if (!token) {
        setError('No se encontró el token de autenticación');
        return;
      }

      console.log('🗑️ Eliminando grupo de votación:', { groupId: group.id, name: group.name });

      const result = await deleteVotingGroupAction({
        token,
        businessId,
        groupId: group.id,
      });

      if (result.success) {
        console.log('✅ Grupo de votación eliminado:', result.message);
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Error al eliminar el grupo de votación');
      }
    } catch (err) {
      console.error('❌ Error eliminando grupo de votación:', err);
      setError('Error inesperado al eliminar el grupo de votación');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!group) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Eliminar Grupo de Votación" size="md">
      <div className="space-y-6">
        {/* Información del grupo */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-800">
                ¿Estás seguro de eliminar este grupo?
              </h3>
              <p className="text-sm text-red-600 mt-1">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
        </div>

        {/* Detalles del grupo a eliminar */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Grupo a eliminar:</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Nombre:</span>
              <span className="ml-2 text-gray-900">{group.name}</span>
            </div>
            {group.description && (
              <div>
                <span className="font-medium text-gray-700">Descripción:</span>
                <span className="ml-2 text-gray-900">{group.description}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Fecha de inicio:</span>
              <span className="ml-2 text-gray-900">
                {new Date(group.votingStartDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Fecha de fin:</span>
              <span className="ml-2 text-gray-900">
                {new Date(group.votingEndDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Estado:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                group.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {group.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>

        {/* Advertencia */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Advertencia
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Se desactivará el grupo de votación</li>
                  <li>Las votaciones asociadas se mantendrán pero no podrán ser modificadas</li>
                  <li>Esta acción no se puede deshacer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert type="error">
            {error}
          </Alert>
        )}

        {/* Botones */}
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
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && <Spinner size="sm" />}
            <span>{loading ? 'Eliminando...' : 'Eliminar Grupo'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
