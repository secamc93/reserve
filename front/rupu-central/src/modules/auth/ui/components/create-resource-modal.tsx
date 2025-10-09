/**
 * Componente: Modal de creación de Recursos/Módulos
 * Usa componentes compartidos de @shared/ui
 */

'use client';

import { useState, FormEvent } from 'react';
import { Modal, Input, Alert } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { createResourceAction } from '../../infrastructure/actions/create-resource.action';

interface CreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateResourceModal({ isOpen, onClose, onSuccess }: CreateResourceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = TokenStorage.getToken();

      if (!token) {
        setError('No hay token de autenticación disponible');
        setLoading(false);
        return;
      }

      const result = await createResourceAction({
        name: name.trim(),
        description: description.trim(),
        token,
      });

      if (result.success) {
        // Limpiar formulario
        setName('');
        setDescription('');
        onSuccess(); // Recargar lista
        onClose(); // Cerrar modal
      } else {
        setError(result.error || 'Error al crear el módulo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setLoading(false);
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setDescription('');
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Agregar Nuevo Módulo"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Campo Nombre */}
        <Input
          label="Nombre del Módulo"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: reservations, users, reports"
          required
          disabled={loading}
        />

        {/* Campo Descripción */}
        <Input
          label="Descripción"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Gestión de reservas del sistema"
          required
          disabled={loading}
        />

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
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
            className="btn btn-primary"
          >
            {loading ? 'Creando...' : 'Crear Módulo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

