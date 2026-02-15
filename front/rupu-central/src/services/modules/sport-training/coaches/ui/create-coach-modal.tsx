/**
 * Create Coach Modal Component
 * Modal para crear un nuevo entrenador
 */
'use client';

import { useState } from 'react';
import { FormModal, Input, Button } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { createCoachAction } from '../infrastructure/actions';

interface CreateCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
}

export function CreateCoachModal({ isOpen, onClose, businessId }: CreateCoachModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    documentNumber: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = TokenStorage.getBusinessToken();
    if (!token) {
      alert('No se encontró token de autenticación');
      setIsLoading(false);
      return;
    }

    const result = await createCoachAction({
      token,
      data: {
        businessId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        documentNumber: formData.documentNumber,
        email: formData.email,
        phone: formData.phone,
      },
    });

    setIsLoading(false);

    if (result.success) {
      onClose();
      window.location.reload();
    } else {
      alert(result.message || 'Error al crear el entrenador');
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar Nuevo Entrenador"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Información Personal */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre *"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <Input
            label="Apellido *"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>

        <Input
          label="Documento *"
          value={formData.documentNumber}
          onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
          required
        />

        {/* Contacto */}
        <Input
          label="Email *"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          label="Teléfono *"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </FormModal>
  );
}
