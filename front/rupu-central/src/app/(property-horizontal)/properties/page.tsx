/**
 * Página: elegir propiedad horizontal.
 * Es a donde lleva "Cambiar propiedad" y el login cuando el usuario tiene varias propiedades.
 * - Super admin: ve todas las propiedades y, debajo, el resumen consolidado.
 * - Demás usuarios: sus propiedades; con una sola, entra directo a ella.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConsolidatedDashboard, useDashboardStats } from '@/services/modules/horizontal-properties/dashboard/ui';
import { TokenStorage } from '@shared/config';
import { Spinner, Button, PropertyPicker, useAccessibleProperties, selectProperty } from '@shared/ui';
import { usePaginationParams } from '@shared/ui/pagination';

export default function PropertiesPage() {
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const { properties, loading: loadingProperties, error: propertiesError } = useAccessibleProperties();

  useEffect(() => {
    const user = TokenStorage.getUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    setIsSuperAdmin(Boolean(user.is_super_admin));
    setActiveId(TokenStorage.getActiveBusiness());
  }, [router]);

  // Con una sola propiedad (también el super admin) no hay nada que elegir: se entra directo.
  useEffect(() => {
    if (isSuperAdmin !== null && !loadingProperties && properties.length === 1) {
      selectProperty(properties[0]);
    }
  }, [isSuperAdmin, loadingProperties, properties]);

  const shouldShowDashboard = isSuperAdmin === true;
  const { page: currentPage, pageSize } = usePaginationParams();
  const { stats, loading, error, refresh } = useDashboardStats({
    businessId: undefined,
    page: currentPage,
    pageSize: pageSize,
    autoLoad: shouldShowDashboard,
  });

  if (isSuperAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" text="Cargando..." />
      </div>
    );
  }

  return (
    <div className="p-3 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Elige una propiedad</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
            {isSuperAdmin ? 'Como super admin tienes acceso a todas las propiedades.' : 'Propiedades a las que tienes acceso.'}
          </p>
        </div>

        <div className="mb-8">
          <PropertyPicker properties={properties} loading={loadingProperties} error={propertiesError} activeId={activeId} />
        </div>

        {shouldShowDashboard && (
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
            />
          ) : null}
        </div>
        )}
      </div>
    </div>
  );
}
