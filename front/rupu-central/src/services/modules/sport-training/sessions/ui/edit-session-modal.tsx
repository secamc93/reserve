'use client';

import { useState } from 'react';
import { FormModal, Input, Button } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { updateSessionAction } from '../infrastructure/actions';
import type { TrainingSession } from '../domain';

interface Props { isOpen: boolean; onClose: () => void; session: TrainingSession; }

export function EditSessionModal({ isOpen, onClose, session }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    location: session.location || '', field: session.field || '',
    maxParticipants: session.maxParticipants?.toString() || '',
    price: session.price?.toString() || '',
    coachNotes: session.coachNotes || '', publicNotes: session.publicNotes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = TokenStorage.getBusinessToken();
    const businessId = TokenStorage.getActiveBusiness();
    if (!token || businessId === null) { alert('No se encontro token'); setIsLoading(false); return; }

    const result = await updateSessionAction({
      businessId, sessionId: session.id, token,
      data: {
        location: formData.location || undefined, field: formData.field || undefined,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        coachNotes: formData.coachNotes || undefined, publicNotes: formData.publicNotes || undefined,
      },
    });
    setIsLoading(false);
    if (result.success) { onClose(); window.location.reload(); }
    else { alert(result.message || 'Error'); }
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Editar Sesion" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Ubicacion" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
          <Input label="Cancha" value={formData.field} onChange={(e) => setFormData({ ...formData, field: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Max Participantes" type="number" value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })} />
          <Input label="Precio" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas del Entrenador</label>
          <textarea value={formData.coachNotes} onChange={(e) => setFormData({ ...formData, coachNotes: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas Publicas</label>
          <textarea value={formData.publicNotes} onChange={(e) => setFormData({ ...formData, publicNotes: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" rows={2} />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar Cambios'}</Button>
        </div>
      </form>
    </FormModal>
  );
}
