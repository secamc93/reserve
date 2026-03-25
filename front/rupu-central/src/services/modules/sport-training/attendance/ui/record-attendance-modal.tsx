'use client';

import { useState } from 'react';
import { FormModal, Input, Button } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { recordAttendanceAction } from '../infrastructure/actions';

interface Props { isOpen: boolean; onClose: () => void; sessionId: number; }

export function RecordAttendanceModal({ isOpen, onClose, sessionId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    playerId: '', attendanceStatusId: '', checkInTime: '',
    performanceRating: '', coachFeedback: '', playerNotes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = TokenStorage.getBusinessToken();
    if (!token) { alert('No se encontro token'); setIsLoading(false); return; }

    const result = await recordAttendanceAction({
      token,
      data: {
        sessionId, playerId: parseInt(formData.playerId),
        attendanceStatusId: parseInt(formData.attendanceStatusId),
        checkInTime: formData.checkInTime || undefined,
        performanceRating: formData.performanceRating ? parseInt(formData.performanceRating) : undefined,
        coachFeedback: formData.coachFeedback || undefined,
        playerNotes: formData.playerNotes || undefined,
      },
    });
    setIsLoading(false);
    if (result.success) { onClose(); window.location.reload(); }
    else { alert(result.message || 'Error al registrar asistencia'); }
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Registrar Asistencia" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="ID Jugador *" type="number" value={formData.playerId} onChange={(e) => setFormData({ ...formData, playerId: e.target.value })} required />
          <Input label="ID Estado Asistencia *" type="number" value={formData.attendanceStatusId} onChange={(e) => setFormData({ ...formData, attendanceStatusId: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Hora de Entrada" type="datetime-local" value={formData.checkInTime} onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calificacion (1-5)</label>
            <select value={formData.performanceRating} onChange={(e) => setFormData({ ...formData, performanceRating: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Sin calificacion</option>
              <option value="1">1 - Bajo</option>
              <option value="2">2 - Regular</option>
              <option value="3">3 - Bueno</option>
              <option value="4">4 - Muy Bueno</option>
              <option value="5">5 - Excelente</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Retroalimentacion del Entrenador</label>
          <textarea value={formData.coachFeedback} onChange={(e) => setFormData({ ...formData, coachFeedback: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" rows={2} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas del Jugador</label>
          <textarea value={formData.playerNotes} onChange={(e) => setFormData({ ...formData, playerNotes: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" rows={2} />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Registrar'}</Button>
        </div>
      </form>
    </FormModal>
  );
}
