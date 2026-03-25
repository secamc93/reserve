'use client';

import { useState } from 'react';
import { FormModal, Input, Button } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { createBookingAction } from '../infrastructure/actions';

interface Props { isOpen: boolean; onClose: () => void; businessId: number; }

export function CreateBookingModal({ isOpen, onClose, businessId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ trainingSessionId: '', playerId: '', requestNotes: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = TokenStorage.getBusinessToken();
    if (!token) { alert('No se encontro token'); setIsLoading(false); return; }

    const result = await createBookingAction({
      token,
      data: {
        businessId, trainingSessionId: parseInt(formData.trainingSessionId),
        playerId: parseInt(formData.playerId),
        requestNotes: formData.requestNotes || undefined,
      },
    });
    setIsLoading(false);
    if (result.success) { onClose(); window.location.reload(); }
    else { alert(result.message || 'Error al crear reserva'); }
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Crear Reserva" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="ID Sesion *" type="number" value={formData.trainingSessionId} onChange={(e) => setFormData({ ...formData, trainingSessionId: e.target.value })} required />
        <Input label="ID Jugador *" type="number" value={formData.playerId} onChange={(e) => setFormData({ ...formData, playerId: e.target.value })} required />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas de Solicitud</label>
          <textarea value={formData.requestNotes} onChange={(e) => setFormData({ ...formData, requestNotes: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" rows={3} />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Crear Reserva'}</Button>
        </div>
      </form>
    </FormModal>
  );
}
