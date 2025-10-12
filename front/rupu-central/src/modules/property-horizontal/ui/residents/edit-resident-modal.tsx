'use client';

import { useState, useEffect } from 'react';
import { Modal, Input } from '@shared/ui';
import { updateResidentAction } from '../../infrastructure/actions';
import { getPropertyUnitsAction } from '../../infrastructure/actions';
import { Resident, UpdateResidentDTO } from '../../domain';
import { TokenStorage } from '@/modules/auth/infrastructure/storage';

interface EditResidentModalProps {
  hpId: number;
  resident: Resident;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditResidentModal({ hpId, resident, onClose, onSuccess }: EditResidentModalProps) {
  const [units, setUnits] = useState<Array<{ id: number; number: string }>>([]);
  const [formData, setFormData] = useState<UpdateResidentDTO>({
    propertyUnitId: resident.propertyUnitId,
    residentTypeId: resident.residentTypeId,
    name: resident.name,
    email: resident.email,
    dni: resident.dni,
    phone: resident.phone,
    emergencyContact: resident.emergencyContact,
    isMainResident: resident.isMainResident,
    isActive: resident.isActive,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const token = TokenStorage.getToken();
        if (!token) return;
        const data = await getPropertyUnitsAction({ hpId, token, page: 1, pageSize: 100 });
        setUnits(data.units.map(u => ({ id: u.id, number: u.number })));
      } catch (error) {
        console.error('Error loading units:', error);
      }
    };
    loadUnits();
  }, [hpId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = TokenStorage.getToken();
      if (!token) throw new Error('No token found');

      await updateResidentAction({
        hpId,
        residentId: resident.id,
        data: formData,
        token,
      });

      onSuccess();
    } catch (error) {
      console.error('Error al actualizar residente:', error);
      alert('Error al actualizar el residente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Editar Residente">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Unidad</label>
            <select
              value={formData.propertyUnitId}
              onChange={(e) => setFormData({ ...formData, propertyUnitId: Number(e.target.value) })}
              className="input w-full"
            >
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Residente</label>
            <select
              value={formData.residentTypeId}
              onChange={(e) => setFormData({ ...formData, residentTypeId: Number(e.target.value) })}
              className="input w-full"
            >
              <option value={1}>Propietario</option>
              <option value={2}>Arrendatario</option>
              <option value={3}>Familiar</option>
              <option value={4}>Invitado</option>
            </select>
          </div>
        </div>

        <Input
          label="Nombre Completo"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Documento de Identidad"
            value={formData.dni || ''}
            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Teléfono"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Contacto de Emergencia"
            value={formData.emergencyContact || ''}
            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isMain"
              checked={formData.isMainResident}
              onChange={(e) => setFormData({ ...formData, isMainResident: e.target.checked })}
              className="checkbox"
            />
            <label htmlFor="isMain">Residente principal</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="checkbox"
            />
            <label htmlFor="isActive">Activo</label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar Residente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
