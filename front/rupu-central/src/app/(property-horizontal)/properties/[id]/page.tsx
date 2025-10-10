/**
 * Página: Detalle de Propiedad Horizontal
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VotingGroupsSection } from '@modules/property-horizontal/ui';
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
  const [activeTab, setActiveTab] = useState<'info' | 'votations' | 'units' | 'fees'>('info');
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
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Botón Volver */}
        <button
          onClick={() => router.push('/properties')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Volver a Propiedades</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {property.name}
          </h1>
          <p className="text-gray-600 mt-2">
            {property.address}
          </p>
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="flex gap-4 border-b pb-4">
            <button
              className={`btn btn-sm ${activeTab === 'info' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('info')}
            >
              Información
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'votations' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('votations')}
            >
              Grupos de Votación
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'units' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('units')}
            >
              Unidades
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'fees' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('fees')}
            >
              Cuotas
            </button>
          </div>

          {/* Content */}
          <div className="py-4">
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Información General */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Información General
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Código</p>
                      <p className="font-medium">{property.code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tipo de Negocio</p>
                      <p className="font-medium">{property.businessTypeName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total de Unidades</p>
                      <p className="font-medium">{property.totalUnits}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <Badge type={property.isActive ? 'success' : 'error'}>
                        {property.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                    {property.timezone && (
                      <div>
                        <p className="text-sm text-gray-600">Zona Horaria</p>
                        <p className="font-medium">{property.timezone}</p>
                      </div>
                    )}
                    {property.customDomain && (
                      <div>
                        <p className="text-sm text-gray-600">Dominio Personalizado</p>
                        <p className="font-medium">{property.customDomain}</p>
                      </div>
                    )}
                  </div>
                  {property.description && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Descripción</p>
                      <p className="font-medium">{property.description}</p>
                    </div>
                  )}
                </div>

                {/* Amenidades */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Amenidades
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className={`flex items-center space-x-2 ${property.hasElevator ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="text-2xl">{property.hasElevator ? '✓' : '✗'}</span>
                      <span>Ascensor</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${property.hasParking ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="text-2xl">{property.hasParking ? '✓' : '✗'}</span>
                      <span>Parqueadero</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${property.hasPool ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="text-2xl">{property.hasPool ? '✓' : '✗'}</span>
                      <span>Piscina</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${property.hasGym ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="text-2xl">{property.hasGym ? '✓' : '✗'}</span>
                      <span>Gimnasio</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${property.hasSocialArea ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="text-2xl">{property.hasSocialArea ? '✓' : '✗'}</span>
                      <span>Área Social</span>
                    </div>
                  </div>
                </div>

                {/* Colores de Marca */}
                {(property.primaryColor || property.secondaryColor || property.tertiaryColor || property.quaternaryColor) && (
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Colores de Marca
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      {property.primaryColor && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Primario</p>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-12 h-12 rounded border"
                              style={{ backgroundColor: property.primaryColor }}
                            />
                            <span className="text-sm font-mono">{property.primaryColor}</span>
                          </div>
                        </div>
                      )}
                      {property.secondaryColor && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Secundario</p>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-12 h-12 rounded border"
                              style={{ backgroundColor: property.secondaryColor }}
                            />
                            <span className="text-sm font-mono">{property.secondaryColor}</span>
                          </div>
                        </div>
                      )}
                      {property.tertiaryColor && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Terciario</p>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-12 h-12 rounded border"
                              style={{ backgroundColor: property.tertiaryColor }}
                            />
                            <span className="text-sm font-mono">{property.tertiaryColor}</span>
                          </div>
                        </div>
                      )}
                      {property.quaternaryColor && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Cuaternario</p>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-12 h-12 rounded border"
                              style={{ backgroundColor: property.quaternaryColor }}
                            />
                            <span className="text-sm font-mono">{property.quaternaryColor}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'votations' && (
              <VotingGroupsSection businessId={businessId} />
            )}

            {activeTab === 'units' && (
              <div className="text-center text-gray-500 py-8">
                <p>Gestión de unidades en construcción...</p>
              </div>
            )}

            {activeTab === 'fees' && (
              <div className="text-center text-gray-500 py-8">
                <p>Gestión de cuotas en construcción...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

