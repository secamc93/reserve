/**
 * Componente: Modal de edición de Recursos/Módulos
 * Usa componentes compartidos de @shared/ui
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Modal, Input, Alert, Button, Select } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { updateResourceAction } from '../../infrastructure/actions/resources/update-resource.action';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useBusinessTypes } from '../hooks/use-business-types';

interface EditResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resource: {
    id: number;
    name: string;
    description: string;
    business_type_id?: number;
  } | null;
}

export function EditResourceModal({ isOpen, onClose, onSuccess, resource }: EditResourceModalProps) {
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

  // Cargar datos del recurso cuando se abre el modal
  useEffect(() => {
    if (resource && isOpen) {
      setName(resource.name);
      setDescription(resource.description);
      setBusinessTypeId(resource.business_type_id?.toString() || '');
      setError(null);
    }
  }, [resource, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!resource) return;

    setError(null);
    setLoading(true);

    try {
      const token = TokenStorage.getToken();

      if (!token) {
        setError('No hay token de autenticación disponible');
        setLoading(false);
        return;
      }

      // Convertir business_type_id a número solo si tiene un valor válido
      let businessTypeIdValue: number | null = null;
      if (business_type_id && business_type_id.trim() !== '') {
        const parsedId = parseInt(business_type_id);
        if (!isNaN(parsedId)) {
          businessTypeIdValue = parsedId;
        }
      }

      const result = await updateResourceAction({
        id: resource.id,
        name: name.trim(),
        description: description.trim(),
        business_type_id: businessTypeIdValue,
        token,
      });

      if (result.success) {
        onSuccess(); // Recargar lista
        onClose(); // Cerrar modal
      } else {
        setError(result.error || 'Error al actualizar el módulo');
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
      title="Editar Recurso"
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
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

