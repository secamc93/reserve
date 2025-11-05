/**
 * Componente: Modal de creación de Recursos/Módulos
 * Usa componentes compartidos de @shared/ui
 */

'use client';

import { useState, FormEvent } from 'react';
import { Modal, Input, Alert, Button, Select } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { createResourceAction } from '../../infrastructure/actions/resources/create-resource.action';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useBusinessTypes } from '../hooks/use-business-types';

interface CreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateResourceModal({ isOpen, onClose, onSuccess }: CreateResourceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [business_type_id, setBusinessTypeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener tipos de negocio
  const { businessTypes } = useBusinessTypes();

  const businessTypeOptions = [
    { value: '', label: 'Genérico' },
    ...(businessTypes?.map((bt) => ({
      value: bt.id.toString(),
      label: `${bt.icon} ${bt.name}`
    })) || []),
  ];

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
        business_type_id: business_type_id ? parseInt(business_type_id) : undefined,
        token,
      });

      if (result.success) {
        // Limpiar formulario
        setName('');
        setDescription('');
        setBusinessTypeId('');
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
      setBusinessTypeId('');
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear Recurso"
      size="lg"
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

        {/* Tipo de Negocio */}
        <Select
          label="Tipo de Negocio (Opcional)"
          name="business_type_id"
          value={business_type_id}
          onChange={(e) => setBusinessTypeId(e.target.value)}
          options={businessTypeOptions}
          disabled={loading}
        />

        {/* Campo Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Gestión de reservas del sistema"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white resize-none"
            required
            disabled={loading}
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            <XMarkIcon className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Recurso'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

