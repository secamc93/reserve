/**
 * Pagina: Propiedades Horizontales
 * Si hay negocio seleccionado -> redirige al detalle de esa propiedad
 * Si no hay negocio seleccionado (super admin) -> muestra vista consolidada
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConsolidatedDashboard, useDashboardStats } from '@/services/modules/horizontal-properties/dashboard/ui';
import { TokenStorage } from '@shared/config';
import { Spinner, Button } from '@shared/ui';

export default function PropertiesPage() {
  const router = useRouter();
  const [shouldShowDashboard, setShouldShowDashboard] = useState(false);

  useEffect(() => {
    const user = TokenStorage.getUser();
    const activeBusiness = TokenStorage.getActiveBusiness();

    if (!user) {
      router.replace('/login');
      return;
    }

    // Si hay un negocio seleccionado (no 0), ir directo al detalle
    if (activeBusiness !== null && activeBusiness !== 0) {
      router.replace(`/properties/${activeBusiness}`);
      return;
    }

    // Si no es super admin y no tiene negocio, redirigir a login
    if (!user.is_super_admin && (activeBusiness === null || activeBusiness === 0)) {
      router.replace('/login');
      return;
    }

    // Super admin sin negocio seleccionado: mostrar dashboard consolidado
    setShouldShowDashboard(true);
  }, [router]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { stats, loading, error, refresh, setPage, setPageSize: handleSetPageSize } = useDashboardStats({
    businessId: undefined,
    page: currentPage,
    pageSize: pageSize,
    autoLoad: shouldShowDashboard,
  });

  if (!shouldShowDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" text="Redirigiendo..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Propiedad Horizontal</h1>
          <p className="text-gray-600 mt-2">
            Selecciona un negocio en el dropdown superior para ver su detalle
          </p>
        </div>

        <div className="mb-8">
          {loading && !stats ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" text="Cargando dashboard consolidado..." />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
              <p className="font-medium">Error al cargar dashboard</p>
              <p className="text-sm mt-1">{error}</p>
              <Button onClick={refresh} className="mt-3" variant="outline">Reintentar</Button>
            </div>
          ) : stats ? (
            <ConsolidatedDashboard
              data={stats}
              loading={loading}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={handleSetPageSize}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
