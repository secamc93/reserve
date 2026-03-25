'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCoachByIdAction } from '@/services/modules/sport-training/coaches/infrastructure/actions/get-coaches.action';
import { TokenStorage } from '@shared/config';
import { Spinner, Button, Badge } from '@shared/ui';
import { EditCoachModal } from '@/services/modules/sport-training/coaches/ui/edit-coach-modal';
import type { Coach } from '@/services/modules/sport-training/coaches/domain';

export default function CoachDetailPage() {
  const params = useParams();
  const router = useRouter();
  const coachId = parseInt(params.id as string);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      const token = TokenStorage.getBusinessToken();
      const businessId = TokenStorage.getActiveBusiness();
      if (!token || businessId === null || isNaN(coachId)) { setError('Datos invalidos'); setLoading(false); return; }
      try {
        const result = await getCoachByIdAction({ businessId, coachId, token });
        if (result.success) setCoach(result.data);
        else setError(result.error);
      } catch (err) { setError(err instanceof Error ? err.message : 'Error desconocido'); }
      finally { setLoading(false); }
    };
    load();
  }, [coachId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="xl" text="Cargando entrenador..." /></div>;
  if (error || !coach) return (<div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"><p>{error || 'No encontrado'}</p></div><Button onClick={() => router.back()} className="mt-4">Volver</Button></div>);

  return (
    <div className="p-8"><div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>&#8592; Volver</Button>
        <div className="flex gap-2 items-center"><Button onClick={() => setShowEditModal(true)}>Editar</Button><Badge type={coach.isActive ? 'success' : 'danger'}>{coach.isActive ? 'Activo' : 'Inactivo'}</Badge></div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="border-b pb-4"><h1 className="text-3xl font-bold text-gray-900">{coach.firstName} {coach.lastName}</h1><p className="text-gray-600 mt-1">Documento: {coach.documentNumber}</p></div>
        <div className="grid grid-cols-2 gap-4"><div><h4 className="text-sm font-medium text-gray-500">Email</h4><p className="mt-1">{coach.email}</p></div><div><h4 className="text-sm font-medium text-gray-500">Telefono</h4><p className="mt-1">{coach.phone}</p></div></div>
        <div><h3 className="text-lg font-semibold mb-3">Especialidades</h3>{coach.specialties.length > 0 ? (<div className="space-y-2">{coach.specialties.map((s) => (<div key={s.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded"><span className="font-medium">{s.specialtyName}</span><Badge type="primary">{s.yearsExperience} anos exp.</Badge></div>))}</div>) : (<div className="bg-gray-50 border rounded p-4 text-center text-gray-500">Sin especialidades</div>)}</div>
        <div className="border-t pt-4 text-sm text-gray-600"><span className="font-medium">Creado:</span> {new Date(coach.createdAt).toLocaleString()}</div>
      </div>
      {showEditModal && <EditCoachModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} coach={coach} />}
    </div></div>
  );
}
