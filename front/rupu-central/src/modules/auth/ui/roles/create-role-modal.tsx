/**
 * Componente: Modal para Crear Rol
 */

'use client';

import { useState } from 'react';
import { Modal } from '@shared/ui/modal';
import { CreateRoleForm, CreateRoleFormData } from './create-role-form';
import { createRoleAction } from '../../infrastructure/actions/roles/create-role.action';
import { TokenStorage } from '@shared/config';

export interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRoleModal({ isOpen, onClose, onSuccess }: CreateRoleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateRoleFormData) => {
    setLoading(true);
    setError(null);

    try {
      const token = TokenStorage.getToken();
      if (!token) {
        setError('No hay token de autenticación disponible');
        setLoading(false);
        return;
      }

      const result = await createRoleAction({
        ...data,
        token,
      });

      if (result.success) {
        onSuccess(); // Recargar lista
        onClose(); // Cerrar modal
      } else {
        setError(result.error || 'Error al crear el rol');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear Nuevo Rol"
      size="lg"
    >
      <div className="space-y-6">
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <CreateRoleForm
          onSubmit={handleSubmit}
          onCancel={handleClose}
          loading={loading}
        />
      </div>
    </Modal>
  );
}
