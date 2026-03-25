/**
 * Edit Coach Modal Component
 * Modal para editar un entrenador existente
 */
'use client';

import { useState } from 'react';
import { FormModal, Input, Button } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { updateCoachAction } from '../infrastructure/actions';
import type { Coach } from '../domain';

interface EditCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: Coach;
}

export function EditCoachModal({ isOpen, onClose, coach }: EditCoachModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: coach.firstName,
    lastName: coach.lastName,
    documentNumber: coach.documentNumber,
    email: coach.email,
    phone: coach.phone,
    isActive: coach.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = TokenStorage.getBusinessToken();
    const businessId = TokenStorage.getActiveBusiness();

    if (!token || businessId === null) {
      alert('No se encontró token o business activo');
      setIsLoading(false);
      return;
    }

    const result = await updateCoachAction({
      businessId,
      coachId: coach.id,
      token,
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        documentNumber: formData.documentNumber,
        email: formData.email,
        phone: formData.phone,
        isActive: formData.isActive,
      },
    });

    setIsLoading(false);

    if (result.success) {
      onClose();
      window.location.reload();
    } else {
      alert(result.message || 'Error al actualizar el entrenador');
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Entrenador"
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

        {/* Estado */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Entrenador Activo
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </FormModal>
  );
}
