'use client';

import { useState } from 'react';
import { FormModal, Input, Button } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { updateGroupAction } from '../infrastructure/actions';
import type { TrainingGroup } from '../domain';

interface EditGroupModalProps { isOpen: boolean; onClose: () => void; group: TrainingGroup; }

export function EditGroupModal({ isOpen, onClose, group }: EditGroupModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: group.name, coachId: group.coachId.toString(), code: group.code || '',
    category: group.category || '', maxCapacity: group.maxCapacity.toString(),
    ageMin: group.ageMin?.toString() || '', ageMax: group.ageMax?.toString() || '',
    recurringSchedule: group.recurringSchedule || '', isActive: group.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = TokenStorage.getBusinessToken();
    const businessId = TokenStorage.getActiveBusiness();
    if (!token || businessId === null) { alert('No se encontro token o business'); setIsLoading(false); return; }

    const result = await updateGroupAction({
      businessId, groupId: group.id, token,
      data: {
        name: formData.name, coachId: parseInt(formData.coachId),
        maxCapacity: parseInt(formData.maxCapacity),
        code: formData.code || undefined, category: formData.category || undefined,
        ageMin: formData.ageMin ? parseInt(formData.ageMin) : undefined,
        ageMax: formData.ageMax ? parseInt(formData.ageMax) : undefined,
        recurringSchedule: formData.recurringSchedule || undefined,
        isActive: formData.isActive,
      },
    });
    setIsLoading(false);
    if (result.success) { onClose(); window.location.reload(); }
    else { alert(result.message || 'Error al actualizar grupo'); }
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Editar Grupo" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="ID Entrenador *" type="number" value={formData.coachId} onChange={(e) => setFormData({ ...formData, coachId: e.target.value })} required />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Codigo" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
          <Input label="Categoria" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
          <Input label="Capacidad Max *" type="number" value={formData.maxCapacity} onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Edad Min" type="number" value={formData.ageMin} onChange={(e) => setFormData({ ...formData, ageMin: e.target.value })} />
          <Input label="Edad Max" type="number" value={formData.ageMax} onChange={(e) => setFormData({ ...formData, ageMax: e.target.value })} />
        </div>
        <Input label="Horario Recurrente" value={formData.recurringSchedule} onChange={(e) => setFormData({ ...formData, recurringSchedule: e.target.value })} />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Grupo Activo</label>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar Cambios'}</Button>
        </div>
      </form>
    </FormModal>
  );
}
