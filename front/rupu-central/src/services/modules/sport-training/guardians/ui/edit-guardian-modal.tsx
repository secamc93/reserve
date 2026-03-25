/**
 * Edit Guardian Modal Component
 * Modal para editar un tutor existente
 */
'use client';

import { useState } from 'react';
import { FormModal, Input, Button } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { updateGuardianAction } from '../infrastructure/actions';
import type { Guardian } from '../domain';

interface EditGuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  guardian: Guardian;
}

export function EditGuardianModal({ isOpen, onClose, guardian }: EditGuardianModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: guardian.firstName,
    lastName: guardian.lastName,
    documentType: guardian.documentType,
    documentNumber: guardian.documentNumber,
    email: guardian.email,
    phone: guardian.phone,
    relationship: guardian.relationship || '',
    canBookSessions: guardian.canBookSessions,
    canAccessRecords: guardian.canAccessRecords,
    isActive: guardian.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = TokenStorage.getBusinessToken();
    const businessId = TokenStorage.getActiveBusiness();

    if (!token || businessId === null) {
      alert('No se encontro token o business activo');
      setIsLoading(false);
      return;
    }

    const result = await updateGuardianAction({
      businessId,
      guardianId: guardian.id,
      token,
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        email: formData.email,
        phone: formData.phone,
        relationship: formData.relationship || undefined,
        canBookSessions: formData.canBookSessions,
        canAccessRecords: formData.canAccessRecords,
        isActive: formData.isActive,
      },
    });

    setIsLoading(false);

    if (result.success) {
      onClose();
      window.location.reload();
    } else {
      alert(result.message || 'Error al actualizar el tutor');
    }
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Editar Tutor" size="md">
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
        />

        {/* Permisos */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Permisos</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.canBookSessions}
                onChange={(e) => setFormData({ ...formData, canBookSessions: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Puede reservar sesiones</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.canAccessRecords}
                onChange={(e) => setFormData({ ...formData, canAccessRecords: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Puede ver registros</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Tutor Activo
          </label>
        </div>

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
