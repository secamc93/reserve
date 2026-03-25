'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getGuardianByIdAction } from '@/services/modules/sport-training/guardians/infrastructure/actions/get-guardians.action';
import { TokenStorage } from '@shared/config';
import { Spinner, Button, Badge } from '@shared/ui';
import { EditGuardianModal } from '@/services/modules/sport-training/guardians/ui/edit-guardian-modal';
import type { Guardian } from '@/services/modules/sport-training/guardians/domain';

export default function GuardianDetailPage() {
  const params = useParams();
  const router = useRouter();
  const guardianId = parseInt(params.id as string);
  const [guardian, setGuardian] = useState<Guardian | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      const token = TokenStorage.getBusinessToken();
      const businessId = TokenStorage.getActiveBusiness();
      if (!token || businessId === null || isNaN(guardianId)) { setError('Datos invalidos'); setLoading(false); return; }
      try { const r = await getGuardianByIdAction({ businessId, guardianId, token }); if (r.success) setGuardian(r.data); else setError(r.error); }
      catch (err) { setError(err instanceof Error ? err.message : 'Error desconocido'); }
      finally { setLoading(false); }
    }; load();
  }, [guardianId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="xl" text="Cargando tutor..." /></div>;
  if (error || !guardian) return (<div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"><p>{error || 'No encontrado'}</p></div><Button onClick={() => router.back()} className="mt-4">Volver</Button></div>);

  return (
    <div className="p-8"><div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>&#8592; Volver</Button>
        <div className="flex gap-2 items-center"><Button onClick={() => setShowEditModal(true)}>Editar</Button><Badge type={guardian.isActive ? 'success' : 'danger'}>{guardian.isActive ? 'Activo' : 'Inactivo'}</Badge></div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="border-b pb-4"><h1 className="text-3xl font-bold text-gray-900">{guardian.firstName} {guardian.lastName}</h1><p className="text-gray-600 mt-1">{guardian.documentType}: {guardian.documentNumber}</p></div>
        <div className="grid grid-cols-2 gap-4"><div><h4 className="text-sm font-medium text-gray-500">Email</h4><p className="mt-1">{guardian.email}</p></div><div><h4 className="text-sm font-medium text-gray-500">Telefono</h4><p className="mt-1">{guardian.phone}</p></div></div>
        <div className="flex gap-3"><Badge type={guardian.canBookSessions ? 'success' : 'danger'}>{guardian.canBookSessions ? 'Puede Reservar' : 'No Reservar'}</Badge><Badge type={guardian.canAccessRecords ? 'success' : 'danger'}>{guardian.canAccessRecords ? 'Ve Registros' : 'No Ve Registros'}</Badge></div>
        <div className="border-t pt-4 text-sm text-gray-600"><span className="font-medium">Creado:</span> {new Date(guardian.createdAt).toLocaleString()}</div>
      </div>
      {showEditModal && <EditGuardianModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} guardian={guardian} />}
    </div></div>
  );
}
