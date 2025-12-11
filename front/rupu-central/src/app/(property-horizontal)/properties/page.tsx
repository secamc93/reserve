/**
 * Página: Gestión de Propiedades Horizontales
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConsolidatedDashboard, useDashboardStats } from '@/services/modules/horizontal-properties/dashboard/ui';
import { TokenStorage } from '@shared/config';
import { Spinner, Button } from '@shared/ui';

export default function PropertiesPage() {
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario es super admin
    const user = TokenStorage.getUser();
    const activeBusiness = TokenStorage.getActiveBusiness();

    // Si no es super admin, redirigir a su propiedad
    if (user && !user.is_super_admin && activeBusiness && activeBusiness !== 0) {
      router.replace(`/properties/${activeBusiness}`);
      return;
    }

    // Si no es super admin y no tiene business activo, redirigir a login
    if (user && !user.is_super_admin && (!activeBusiness || activeBusiness === 0)) {
      router.replace('/login');
      return;
    }
  }, [router]);

  // Hook para obtener dashboard consolidado (businessId undefined = todas las propiedades)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { stats, loading, error, refresh, setPage, setPageSize: handleSetPageSize } = useDashboardStats({
    businessId: undefined, // Sin businessId para obtener resumen de todas
    page: currentPage,
    pageSize: pageSize,
    autoLoad: true,
  });

  // Verificar si el usuario es super admin antes de mostrar la lista
  const user = TokenStorage.getUser();
  const activeBusiness = TokenStorage.getActiveBusiness();

  // Si no es super admin, mostrar loading mientras redirige
  if (user && !user.is_super_admin) {
    if (activeBusiness && activeBusiness !== 0) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="xl" text="Redirigiendo..." />
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" text="Cargando..." />
      </div>
    );
  }

  // Solo mostrar la lista si es super admin
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Propiedades Horizontales
          </h1>
          <p className="text-gray-600 mt-2">
            Vista consolidada de todas las propiedades horizontales
          </p>
        </div>

        {/* Dashboard Consolidado */}
        <div className="mb-8">
          {loading && !stats ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" text="Cargando dashboard consolidado..." />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
              <p className="font-medium">Error al cargar dashboard</p>
              <p className="text-sm mt-1">{error}</p>
              <Button onClick={refresh} className="mt-3" variant="outline">
                Reintentar
              </Button>
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

