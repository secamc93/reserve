/**
 * Página: Detalle de Propiedad Horizontal
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  VotingGroupsSection,
  PropertyUnitsTable,
  ResidentsTable,
} from '@modules/property-horizontal/ui';
import { PropertyNavigation } from '@modules/property-horizontal/ui/components/property-navigation';
import { getHorizontalPropertyByIdAction } from '@modules/property-horizontal/infrastructure/actions';
import { TokenStorage } from '@shared/config';
import { Spinner, Badge } from '@shared/ui';
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

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    setLoading(true);
    try {
      const token = TokenStorage.getToken();
      if (!token) {
        console.error('❌ No hay token disponible');
        setLoading(false);
        return;
      }

      const result = await getHorizontalPropertyByIdAction({
        token,
        id: businessId,
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
          {/* Botón Volver */}
          <button
            onClick={() => router.push('/properties')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Volver a Propiedades</span>
          </button>

          {/* Dashboard Overview */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              📊 Dashboard
            </h2>
            <p className="text-gray-600">
              Resumen general de {property.name}
            </p>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Unidades */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <span className="text-2xl">🏢</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unidades</p>
                  <p className="text-2xl font-bold text-gray-900">{property.totalUnits || 0}</p>
                </div>
              </div>
            </div>

            {/* Residentes */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Residentes</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>

            {/* Grupos de Votación */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <span className="text-2xl">🗳️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Grupos de Votación</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>

            {/* Cuotas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cuotas</p>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información General */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              📋 Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium text-gray-900">{property.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Código</p>
                  <p className="font-medium text-gray-900">{property.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dirección</p>
                  <p className="font-medium text-gray-900">{property.address}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Tipo de Negocio</p>
                  <Badge>{property.businessTypeName}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Unidades</p>
                  <p className="font-medium text-gray-900">{property.totalUnits || 0}</p>
                </div>
                {property.description && (
                  <div>
                    <p className="text-sm text-gray-600">Descripción</p>
                    <p className="font-medium text-gray-900">{property.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              🚀 Acciones Rápidas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push(`/properties/${businessId}/units`)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="text-2xl mb-2">🏢</div>
                <div className="font-medium text-gray-900">Gestionar Unidades</div>
                <div className="text-sm text-gray-600">Ver y editar unidades</div>
              </button>
              
              <button
                onClick={() => router.push(`/properties/${businessId}/residents`)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="font-medium text-gray-900">Gestionar Residentes</div>
                <div className="text-sm text-gray-600">Ver y editar residentes</div>
              </button>
              
              <button
                onClick={() => router.push(`/properties/${businessId}/voting-groups`)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="text-2xl mb-2">🗳️</div>
                <div className="font-medium text-gray-900">Grupos de Votación</div>
                <div className="text-sm text-gray-600">Crear y gestionar votaciones</div>
              </button>
              
              <button
                onClick={() => router.push(`/properties/${businessId}/fees`)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="text-2xl mb-2">💰</div>
                <div className="font-medium text-gray-900">Gestionar Cuotas</div>
                <div className="text-sm text-gray-600">Ver y editar cuotas</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

