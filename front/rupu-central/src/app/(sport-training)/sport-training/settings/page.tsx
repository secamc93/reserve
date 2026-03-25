'use client';
import { useEffect, useState } from 'react';
import { getCatalogsAction } from '@/services/modules/sport-training/shared/infrastructure/actions/get-catalogs.action';
import { TokenStorage } from '@shared/config';
import { Spinner, Badge } from '@shared/ui';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catalogs, setCatalogs] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const token = TokenStorage.getBusinessToken();
      if (!token) { setError('No se encontro token'); setLoading(false); return; }
      try { const r = await getCatalogsAction({ token }); if (r.success) setCatalogs(r.data); else setError(r.error); }
      catch (err) { setError(err instanceof Error ? err.message : 'Error desconocido'); }
      finally { setLoading(false); }
    }; load();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="xl" text="Cargando catalogos..." /></div>;
  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"><p className="font-medium">Error</p><p className="text-sm mt-1">{error}</p></div></div>;
  if (!catalogs) return null;

  const renderSection = (title: string, items: any[]) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item: any) => (
          <div key={item.id} className="border rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{item.name}</span>
              <Badge type={item.isActive ? 'success' : 'danger'} size="sm">{item.isActive ? 'Activo' : 'Inactivo'}</Badge>
            </div>
            {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-8"><div className="max-w-7xl mx-auto space-y-8">
      <div><h1 className="text-3xl font-bold text-gray-900">Configuracion - Sport Training</h1><p className="text-gray-600 mt-2">Catalogos maestros</p></div>
      {renderSection('Niveles de Habilidad', catalogs.skillLevels)}
      {renderSection('Tipos de Sesion', catalogs.sessionTypes)}
      {renderSection('Especialidades', catalogs.coachSpecialties)}
      {renderSection('Estados de Reserva', catalogs.bookingStatuses)}
      {renderSection('Estados de Asistencia', catalogs.attendanceStatuses)}
    </div></div>
  );
}
