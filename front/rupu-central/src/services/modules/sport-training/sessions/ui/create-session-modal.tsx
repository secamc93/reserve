'use client';

import { useState } from 'react';
import { FormModal, Input, Button } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { createSessionAction } from '../infrastructure/actions';

interface Props { isOpen: boolean; onClose: () => void; businessId: number; }

export function CreateSessionModal({ isOpen, onClose, businessId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    trainingSessionTypeId: '', coachId: '', trainingGroupId: '',
    sessionMode: 'individual', scheduledDate: '', startTime: '', endTime: '',
    duration: '60', location: '', field: '', maxParticipants: '1', price: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = TokenStorage.getBusinessToken();
    if (!token) { alert('No se encontro token'); setIsLoading(false); return; }

    const result = await createSessionAction({
      token,
      data: {
        businessId, trainingSessionTypeId: parseInt(formData.trainingSessionTypeId),
        coachId: parseInt(formData.coachId), sessionMode: formData.sessionMode,
        scheduledDate: formData.scheduledDate, startTime: formData.startTime,
        endTime: formData.endTime, duration: parseInt(formData.duration),
        trainingGroupId: formData.trainingGroupId ? parseInt(formData.trainingGroupId) : undefined,
        location: formData.location || undefined, field: formData.field || undefined,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
      },
    });
    setIsLoading(false);
    if (result.success) { onClose(); window.location.reload(); }
    else { alert(result.message || 'Error al crear sesion'); }
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Crear Sesion de Entrenamiento" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="ID Tipo Sesion *" type="number" value={formData.trainingSessionTypeId} onChange={(e) => setFormData({ ...formData, trainingSessionTypeId: e.target.value })} required />
          <Input label="ID Entrenador *" type="number" value={formData.coachId} onChange={(e) => setFormData({ ...formData, coachId: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad *</label>
            <select value={formData.sessionMode} onChange={(e) => setFormData({ ...formData, sessionMode: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="individual">Individual</option>
              <option value="group">Grupal</option>
            </select>
          </div>
          <Input label="ID Grupo (si grupal)" type="number" value={formData.trainingGroupId} onChange={(e) => setFormData({ ...formData, trainingGroupId: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Fecha *" type="date" value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} required />
          <Input label="Hora Inicio *" type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required />
          <Input label="Hora Fin *" type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} required />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Duracion (min) *" type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} required />
          <Input label="Max Participantes" type="number" value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })} />
          <Input label="Precio" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Ubicacion" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
          <Input label="Cancha/Campo" value={formData.field} onChange={(e) => setFormData({ ...formData, field: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </form>
    </FormModal>
  );
}
