'use client';

import { useState } from 'react';
import { Modal, Input } from '@shared/ui';
import { updatePropertyUnitAction } from '../../infrastructure/actions';
import { PropertyUnit, UpdatePropertyUnitDTO, UNIT_TYPES } from '../../domain';
import { TokenStorage } from '@/modules/auth/infrastructure/storage';

interface EditPropertyUnitModalProps {
  hpId: number;
  unit: PropertyUnit;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPropertyUnitModal({ hpId, unit, onClose, onSuccess }: EditPropertyUnitModalProps) {
  const [formData, setFormData] = useState<UpdatePropertyUnitDTO>({
    number: unit.number,
    unitType: unit.unitType,
    floor: unit.floor,
    block: unit.block,
    area: unit.area,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    description: unit.description,
    isActive: unit.isActive,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = TokenStorage.getToken();
      if (!token) throw new Error('No token found');

      await updatePropertyUnitAction({
        hpId,
        unitId: unit.id,
        data: formData,
        token,
      });

      onSuccess();
    } catch (error) {
      console.error('Error al actualizar unidad:', error);
      alert('Error al actualizar la unidad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Editar Unidad de Propiedad">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Número de Unidad"
            value={formData.number || ''}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Unidad</label>
            <select
              value={formData.unitType}
              onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
              className="input w-full"
            >
              <option value={UNIT_TYPES.APARTMENT}>Apartamento</option>
              <option value={UNIT_TYPES.HOUSE}>Casa</option>
              <option value={UNIT_TYPES.OFFICE}>Oficina</option>
              <option value={UNIT_TYPES.COMMERCIAL}>Local comercial</option>
              <option value={UNIT_TYPES.PARKING}>Parqueadero</option>
              <option value={UNIT_TYPES.STORAGE}>Depósito</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Piso"
            type="number"
            value={formData.floor || ''}
            onChange={(e) => setFormData({ ...formData, floor: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            label="Bloque/Torre"
            value={formData.block || ''}
            onChange={(e) => setFormData({ ...formData, block: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Área (m²)"
            type="number"
            step="0.01"
            value={formData.area || ''}
            onChange={(e) => setFormData({ ...formData, area: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            label="Habitaciones"
            type="number"
            value={formData.bedrooms || ''}
            onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            label="Baños"
            type="number"
            value={formData.bathrooms || ''}
            onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input w-full"
            rows={3}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="checkbox"
          />
          <label htmlFor="isActive">Unidad activa</label>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar Unidad'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
