/**
 * Edit Player Modal Component
 * Modal para editar un jugador existente
 */
'use client';

import { useState, useEffect } from 'react';
import { FormModal, Input, Select, Button } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { updatePlayerAction } from '../infrastructure/actions';
import { CatalogRepository } from '../../shared/infrastructure/repositories/catalog.repository';
import type { SkillLevel } from '../../shared/domain/entities';
import type { Player } from '../domain';

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
}

export function EditPlayerModal({ isOpen, onClose, player }: EditPlayerModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [skillLevels, setSkillLevels] = useState<SkillLevel[]>([]);
  const [formData, setFormData] = useState({
    firstName: player.firstName,
    lastName: player.lastName,
    documentNumber: player.documentNumber,
    birthDate: player.birthDate,
    skillLevelId: player.skillLevelId.toString(),
    email: player.email || '',
    phone: player.phone || '',
    emergencyContact: player.emergencyContact || '',
    medicalNotes: player.medicalNotes || '',
    isActive: player.isActive,
  });

  useEffect(() => {
    const loadSkillLevels = async () => {
      const token = TokenStorage.getBusinessToken();
      if (!token) return;

      try {
        const repo = new CatalogRepository();
        const levels = await repo.getSkillLevels(token);
        setSkillLevels(levels.filter(l => l.isActive));
      } catch (error) {
        console.error('Error al cargar skill levels:', error);
      }
    };

    if (isOpen) {
      loadSkillLevels();
    }
  }, [isOpen]);

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

    const result = await updatePlayerAction({
      businessId,
      playerId: player.id,
      token,
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        documentNumber: formData.documentNumber,
        birthDate: formData.birthDate,
        skillLevelId: parseInt(formData.skillLevelId),
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        emergencyContact: formData.emergencyContact || undefined,
        medicalNotes: formData.medicalNotes || undefined,
        isActive: formData.isActive,
      },
    });

    setIsLoading(false);

    if (result.success) {
      onClose();
      window.location.reload();
    } else {
      alert(result.message || 'Error al actualizar el jugador');
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Jugador"
      size="lg"
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

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Documento *"
            value={formData.documentNumber}
            onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
            required
          />
          <Input
            label="Fecha de Nacimiento *"
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            required
          />
        </div>

        <Select
          label="Nivel de Habilidad *"
          value={formData.skillLevelId}
          onChange={(e) => setFormData({ ...formData, skillLevelId: e.target.value })}
          options={[
            { value: '', label: 'Seleccionar nivel' },
            ...skillLevels.map(level => ({
              value: level.id.toString(),
              label: level.name,
            })),
          ]}
          required
        />

        {/* Contacto */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Teléfono"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <Input
          label="Contacto de Emergencia"
          value={formData.emergencyContact}
          onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
          helperText="Nombre y teléfono"
        />

        <Input
          label="Notas Médicas"
          value={formData.medicalNotes}
          onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
          helperText="Alergias, condiciones médicas, etc."
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
            Jugador Activo
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
