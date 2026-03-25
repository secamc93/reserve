'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSessionByIdAction } from '@/services/modules/sport-training/sessions/infrastructure/actions/get-sessions.action';
import { cancelSessionAction } from '@/services/modules/sport-training/sessions/infrastructure/actions';
import { TokenStorage } from '@shared/config';
import { Spinner, Button, Badge, FormModal } from '@shared/ui';
import { EditSessionModal } from '@/services/modules/sport-training/sessions/ui/edit-session-modal';
import type { TrainingSession } from '@/services/modules/sport-training/sessions/domain';

const statusLabels: Record<string, string> = { scheduled: 'Programada', in_progress: 'En Curso', completed: 'Completada', cancelled: 'Cancelada' };
const statusTypes: Record<string, string> = { scheduled: 'primary', in_progress: 'warning', completed: 'success', cancelled: 'danger' };

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = parseInt(params.id as string);
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    const load = async () => {
      const token = TokenStorage.getBusinessToken();
      const businessId = TokenStorage.getActiveBusiness();
      if (!token || businessId === null || isNaN(sessionId)) { setError('Datos invalidos'); setLoading(false); return; }
      try { const r = await getSessionByIdAction({ businessId, sessionId, token }); if (r.success) setSession(r.data); else setError(r.error); }
      catch (err) { setError(err instanceof Error ? err.message : 'Error desconocido'); }
      finally { setLoading(false); }
    }; load();
  }, [sessionId]);

  const handleCancel = async () => {
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    const result = await cancelSessionAction({ sessionId, token, reason: cancelReason });
    if (result.success) { setShowCancelModal(false); window.location.reload(); }
    else { alert(result.message || 'Error'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="xl" text="Cargando sesion..." /></div>;
  if (error || !session) return (<div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"><p>{error || 'No encontrada'}</p></div><Button onClick={() => router.back()} className="mt-4">Volver</Button></div>);

  return (
    <div className="p-8"><div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>&#8592; Volver</Button>
        <div className="flex gap-2 items-center">
          {session.status === 'scheduled' && (<><Button onClick={() => setShowEditModal(true)}>Editar</Button><Button variant="danger" onClick={() => setShowCancelModal(true)}>Cancelar</Button></>)}
          <Badge type={(statusTypes[session.status] as any) || 'primary'}>{statusLabels[session.status] || session.status}</Badge>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="border-b pb-4"><h1 className="text-3xl font-bold text-gray-900">{session.sessionTypeName}</h1><Badge type={session.sessionMode === 'group' ? 'primary' : 'warning'}>{session.sessionMode === 'group' ? 'Grupal' : 'Individual'}</Badge></div>
        <div className="grid grid-cols-2 gap-4">
          <div><h4 className="text-sm font-medium text-gray-500">Entrenador</h4><p className="mt-1">{session.coachName}</p></div>
          <div><h4 className="text-sm font-medium text-gray-500">Fecha</h4><p className="mt-1">{new Date(session.scheduledDate).toLocaleDateString()}</p></div>
          <div><h4 className="text-sm font-medium text-gray-500">Participantes</h4><p className="mt-1">{session.currentParticipants}/{session.maxParticipants || '-'}</p></div>
          {session.price && <div><h4 className="text-sm font-medium text-gray-500">Precio</h4><p className="mt-1">${session.price}</p></div>}
        </div>
        {session.cancellationReason && <div className="bg-red-50 border border-red-200 rounded p-4"><p className="text-red-600">{session.cancellationReason}</p></div>}
      </div>
      {showEditModal && <EditSessionModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} session={session} />}
      {showCancelModal && (<FormModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancelar Sesion" size="sm"><div className="space-y-4"><textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" rows={3} placeholder="Razon de cancelacion" /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowCancelModal(false)}>No</Button><Button variant="danger" onClick={handleCancel}>Si, Cancelar</Button></div></div></FormModal>)}
    </div></div>
  );
}
