/**
 * Modal: Crear Propiedad Horizontal
 */

'use client';

import { useState } from 'react';
import { Modal, Input, Spinner } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { createHorizontalPropertyAction } from '../../infrastructure/actions';

interface CreatePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePropertyModal({ isOpen, onClose, onSuccess }: CreatePropertyModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos básicos requeridos
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!name.trim() || !address.trim()) {
      setError('Los campos Nombre y Dirección son obligatorios');
      return;
    }

    setLoading(true);

    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) {
        setError('No se encontró el business token. Debe seleccionar un negocio primero.');
        return;
      }

      const result = await createHorizontalPropertyAction({
        token,
        data: {
          // Solo campos requeridos
          name: name.trim(),
          address: address.trim(),
        },
      });

      if (result.success) {
        console.log('✅ Propiedad creada:', result.data);
        resetForm();
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Error al crear la propiedad');
      }
    } catch (err) {
      console.error('Error creando propiedad:', err);
      setError('Error inesperado al crear la propiedad');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setError(null);
  };


  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Nueva Propiedad Horizontal" size="md">
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
            placeholder="Ej: Conjunto Residencial Los Pinos"
            disabled={loading}
            required
          />
          
          <Input
            label="Dirección *"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ej: Carrera 15 #45-67, Bogotá"
            disabled={loading}
            required
          />
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
            {loading ? <Spinner size="sm" /> : 'Crear Propiedad'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

