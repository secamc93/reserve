'use client';
import { useEffect, useState } from 'react';
import { GuardiansTable } from '@/services/modules/sport-training/guardians/ui';
import { getGuardiansAction } from '@/services/modules/sport-training/guardians/infrastructure/actions/get-guardians.action';
import { TokenStorage } from '@shared/config';
import { Spinner } from '@shared/ui';

export default function GuardiansPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const load = async () => {
      const token = TokenStorage.getBusinessToken();
      const businessId = TokenStorage.getActiveBusiness();
      if (!token || businessId === null) { setError('No se encontro token o business activo'); setLoading(false); return; }
      try { const r = await getGuardiansAction({ businessId, token, page: 1, pageSize: 10 }); if (r.success) setData(r.data); else setError(r.error); }
      catch (err) { setError(err instanceof Error ? err.message : 'Error desconocido'); }
      finally { setLoading(false); }
    }; load();
  }, []);
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="xl" text="Cargando tutores..." /></div>;
  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"><p className="font-medium">Error</p><p className="text-sm mt-1">{error}</p></div></div>;
  const businessId = TokenStorage.getActiveBusiness();
  if (businessId === null) return <div className="p-8"><div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">No se encontro business activo</div></div>;
  return <div className="p-8"><div className="max-w-7xl mx-auto">{data && <GuardiansTable initialData={data} businessId={businessId} />}</div></div>;
}
