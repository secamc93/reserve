/**
 * Página: Detalle de Propiedad Horizontal
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VotingGroupsSection } from '@/services/modules/horizontal-properties/voting/ui';
import { PropertyUnitsTable } from '@/services/modules/horizontal-properties/units/ui';
import { ResidentsTable } from '@/services/modules/horizontal-properties/residents/ui';
import { PropertyNavigation } from '@/services/modules/horizontal-properties/properties/ui';
import { getHorizontalPropertyByIdAction } from '@/services/modules/horizontal-properties/properties/infrastructure/actions';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';
import { DashboardStats, useDashboardStats } from '@/services/modules/horizontal-properties/dashboard/ui';
import { TokenStorage } from '@shared/config';
import { Spinner, Badge, Button } from '@shared/ui';
import { use } from 'react';

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

interface PropertyData {
  id: number;
  name: string;
  code: string;
  businessTypeName: string;
  address: string;
  description?: string;
  totalUnits: number;
  timezone?: string;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  hasSocialArea?: boolean;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  quaternaryColor?: string;
  customDomain?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const businessId = parseInt(id);
  
  // Hook para obtener estadísticas del dashboard
  const { stats: dashboardStats, loading: dashboardLoading, error: dashboardError, refresh: refreshDashboard } = useDashboardStats({
    businessId: businessId,
    autoLoad: true,
  });

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    setLoading(true);
    try {
      const user = TokenStorage.getUser();
      const isSuperAdmin = user?.is_super_admin;

      let businessToken = TokenStorage.getBusinessToken();

      // Si no hay business token, intentar generarlo:
      // - super admin: business_id = 0
      // - usuario normal: usar el businessId de la ruta
      if (!businessToken) {
        const sessionToken = TokenStorage.getSessionToken();
        if (sessionToken) {
          try {
            const resultBT = await generateBusinessTokenAction({
              business_id: isSuperAdmin ? 0 : businessId,
              session_token: sessionToken,
            });
            if (resultBT.success && resultBT.data) {
              businessToken = resultBT.data.token;
              TokenStorage.setBusinessToken(resultBT.data.token);
              TokenStorage.setActiveBusiness(isSuperAdmin ? 0 : businessId);
            }
          } catch (err) {
            console.error('❌ No se pudo generar business token', err);
          }
        }
      }

      if (!businessToken) {
        console.error('❌ No hay business token disponible');
        setLoading(false);
        return;
      }

      const result = await getHorizontalPropertyByIdAction({
        token: businessToken,
        id: businessId,
        business_id: isSuperAdmin ? undefined : businessId,
      });

      if (result.success && result.data) {
        setProperty(result.data as PropertyData);
      } else {
        console.error('❌ Error en la respuesta:', result.error);
      }
    } catch (error) {
      console.error('❌ Error al cargar propiedad:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" text="Cargando detalles de la propiedad..." />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">No se pudo cargar la información de la propiedad</p>
            <p className="text-sm mt-1">Por favor, intenta nuevamente.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navegación */}
      <PropertyNavigation businessId={businessId} propertyName={property.name} />

      {/* Contenido del Dashboard */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Stats */}
          {dashboardLoading && !dashboardStats ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" text="Cargando estadísticas del dashboard..." />
            </div>
          ) : dashboardError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
              <p className="font-medium">Error al cargar estadísticas del dashboard</p>
              <p className="text-sm mt-1">{dashboardError}</p>
              <Button onClick={refreshDashboard} className="mt-3" variant="outline">
                Reintentar
              </Button>
            </div>
          ) : dashboardStats ? (
            <div className="mb-8">
              <DashboardStats data={dashboardStats} />
            </div>
          ) : null}

          {/* Información General */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Información General
              </h3>
            </div>

            {/* Contenido */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna Izquierda */}
                <div className="space-y-5">
                  {/* Nombre */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 rounded-lg p-2 flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Nombre
                        </p>
                        <p className="text-lg font-bold text-gray-900 truncate">
                          {property.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Código */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-500 rounded-lg p-2 flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Código
                        </p>
                        <p className="text-lg font-bold text-gray-900 truncate font-mono">
                          {property.code}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-500 rounded-lg p-2 flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Dirección
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {property.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-5">
                  {/* Tipo de Negocio */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-500 rounded-lg p-2 flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Tipo de Negocio
                        </p>
                        <Badge className="bg-orange-500 text-white px-3 py-1 text-sm font-semibold">
                          {property.businessTypeName}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Total de Unidades */}
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="bg-cyan-500 rounded-lg p-2 flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Total de Unidades
                        </p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-gray-900">
                            {property.totalUnits || 0}
                          </p>
                          <span className="text-sm text-gray-500">unidades</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  {property.description && (
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="bg-gray-500 rounded-lg p-2 flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Descripción
                          </p>
                          <p className="text-base text-gray-700 leading-relaxed">
                            {property.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

