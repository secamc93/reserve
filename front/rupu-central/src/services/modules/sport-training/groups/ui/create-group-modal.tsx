'use client';

import { useState } from 'react';
import { FormModal, Input, Button } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { createGroupAction } from '../infrastructure/actions';

interface CreateGroupModalProps { isOpen: boolean; onClose: () => void; businessId: number; }

export function CreateGroupModal({ isOpen, onClose, businessId }: CreateGroupModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', coachId: '', code: '', category: '', description: '',
    maxCapacity: '20', ageMin: '', ageMax: '', recurringSchedule: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = TokenStorage.getBusinessToken();
    if (!token) { alert('No se encontro token'); setIsLoading(false); return; }

    const result = await createGroupAction({
      token,
      data: {
        businessId, coachId: parseInt(formData.coachId), name: formData.name,
        maxCapacity: parseInt(formData.maxCapacity),
        code: formData.code || undefined, category: formData.category || undefined,
        description: formData.description || undefined,
        ageMin: formData.ageMin ? parseInt(formData.ageMin) : undefined,
        ageMax: formData.ageMax ? parseInt(formData.ageMax) : undefined,
        recurringSchedule: formData.recurringSchedule || undefined,
      },
    });
    setIsLoading(false);
    if (result.success) { onClose(); window.location.reload(); }
    else { alert(result.message || 'Error al crear grupo'); }
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Crear Grupo de Entrenamiento" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="ID Entrenador *" type="number" value={formData.coachId} onChange={(e) => setFormData({ ...formData, coachId: e.target.value })} required />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Codigo" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
          <Input label="Categoria" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Sub-10, Sub-12..." />
          <Input label="Capacidad Max *" type="number" value={formData.maxCapacity} onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Edad Min" type="number" value={formData.ageMin} onChange={(e) => setFormData({ ...formData, ageMin: e.target.value })} />
          <Input label="Edad Max" type="number" value={formData.ageMax} onChange={(e) => setFormData({ ...formData, ageMax: e.target.value })} />
        </div>
        <Input label="Horario Recurrente" value={formData.recurringSchedule} onChange={(e) => setFormData({ ...formData, recurringSchedule: e.target.value })} placeholder="Lunes 16:00-18:00, Miercoles 16:00-18:00" />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </form>
    </FormModal>
  );
}
