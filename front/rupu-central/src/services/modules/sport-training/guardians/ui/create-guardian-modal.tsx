/**
 * Create Guardian Modal Component
 * Modal para crear un nuevo tutor
 */
'use client';

import { useState } from 'react';
import { FormModal, Input, Button } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { createGuardianAction } from '../infrastructure/actions';

interface CreateGuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
}

export function CreateGuardianModal({ isOpen, onClose, businessId }: CreateGuardianModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    documentType: 'CC',
    documentNumber: '',
    email: '',
    phone: '',
    relationship: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = TokenStorage.getBusinessToken();
    if (!token) {
      alert('No se encontro token de autenticacion');
      setIsLoading(false);
      return;
    }

    const result = await createGuardianAction({
      token,
      data: {
        businessId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        email: formData.email,
        phone: formData.phone,
        relationship: formData.relationship || undefined,
      },
    });

    setIsLoading(false);

    if (result.success) {
      onClose();
      window.location.reload();
    } else {
      alert(result.message || 'Error al crear el tutor');
    }
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Agregar Nuevo Tutor" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tipo Documento *"
            value={formData.documentType}
            onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
            required
          />
          <Input
            label="Documento *"
            value={formData.documentNumber}
            onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
            required
          />
        </div>

        <Input
          label="Email *"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          label="Telefono *"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />

        <Input
          label="Parentesco"
          value={formData.relationship}
          onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
          placeholder="Padre, Madre, Tutor Legal..."
        />

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
