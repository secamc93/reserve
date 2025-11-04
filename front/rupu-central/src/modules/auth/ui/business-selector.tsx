/**
 * Componente: Selector de Negocios
 * Permite al usuario seleccionar a qué negocio quiere acceder después del login
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { businessTokenAction } from '@modules/auth/infrastructure/actions';

interface Business {
  id: number;
  name: string;
  code: string;
  business_type_id: number;
  business_type: {
    id: number;
    name: string;
    code: string;
    description: string;
    icon: string;
  };
  timezone: string;
  address: string;
  description: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  tertiary_color: string;
  quaternary_color: string;
  navbar_image_url: string;
  custom_domain: string;
  is_active: boolean;
  enable_delivery: boolean;
  enable_pickup: boolean;
  enable_reservations: boolean;
}

interface BusinessSelectorProps {
  businesses: Business[];
  isOpen: boolean;
  onClose: () => void;
  showSuperAdminButton?: boolean;
  skipRedirect?: boolean; // Si es true, no redirige después de seleccionar
}

export function BusinessSelector({ businesses, isOpen, onClose, showSuperAdminButton = false, skipRedirect = false }: BusinessSelectorProps) {
  const router = useRouter();
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBusinessSelect = async (business: Business) => {
    setSelectedBusiness(business);
    setLoading(true);
    setError(null);

    try {
      const sessionToken = TokenStorage.getSessionToken();
      if (!sessionToken) {
        throw new Error('No hay token de sesión disponible');
      }

      // Obtener business token
      const result = await businessTokenAction(
        { business_id: business.id },
        sessionToken
      );

      if (result.success && result.data) {
        // Guardar business token
        TokenStorage.setBusinessToken(result.data.token);
        
        // Guardar datos del negocio seleccionado
        TokenStorage.setActiveBusiness(business.id);
        TokenStorage.setBusinessesData([business]);
        
        // Aplicar colores del negocio
        if (business.primary_color) {
          TokenStorage.setBusinessColors({
            primary: business.primary_color,
            secondary: business.secondary_color,
            tertiary: business.tertiary_color,
            quaternary: business.quaternary_color,
          });
        }

        // Redirigir según el tipo de negocio (solo si no se omite la redirección)
        if (!skipRedirect) {
          redirectByBusinessType(business);
        } else {
          // Si se omite la redirección, simplemente cerrar el modal
          onClose();
        }
      } else {
        setError(result.error || 'Error al obtener token del negocio');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const redirectByBusinessType = (business: Business) => {
    const businessTypeCode = business.business_type.code;
    
    switch (businessTypeCode) {
      case 'horizontal_property':
        // Redirigir a la página de propiedades con el ID del business
        router.push(`/properties/${business.id}`);
        break;
      case 'restaurant':
        router.push('/restaurant/dashboard');
        break;
      case 'cafe':
        router.push('/cafe/dashboard');
        break;
      case 'bar':
        router.push('/bar/dashboard');
        break;
      case 'hotel':
        router.push('/hotel/dashboard');
        break;
      case 'spa':
        router.push('/spa/dashboard');
        break;
      case 'salon':
        router.push('/salon/dashboard');
        break;
      case 'clinic':
        router.push('/clinic/dashboard');
        break;
      case 'gym':
        router.push('/gym/dashboard');
        break;
      case 'studio':
        router.push('/studio/dashboard');
        break;
      case 'office':
        router.push('/office/dashboard');
        break;
      default:
        router.push('/home');
    }
  };

  const handleSuperAdminAccess = async () => {
    setLoading(true);
    setError(null);

    try {
      const sessionToken = TokenStorage.getSessionToken();
      if (!sessionToken) {
        throw new Error('No hay token de sesión disponible');
      }

      // Para super admin, usar business_id: 0
      const result = await businessTokenAction(
        { business_id: 0 },
        sessionToken
      );

      if (result.success && result.data) {
        TokenStorage.setBusinessToken(result.data.token);
        TokenStorage.setActiveBusiness(0);
        
        // Redirigir al dashboard principal (solo si no se omite la redirección)
        if (!skipRedirect) {
          router.push('/dashboard');
        } else {
          onClose();
        }
      } else {
        setError(result.error || 'Error al obtener token de super admin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="full"
    >
      <div className="h-full w-full flex flex-col space-y-6 px-8 py-6">
        {/* Header mejorado con botón de cerrar personalizado */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1"></div>
          <div className="flex-1 text-center space-y-2">
            <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Selecciona tu Negocio
            </h2>
            <p className="text-gray-600 text-xl font-medium">
              Elige el negocio al que deseas acceder
            </p>
          </div>
          <div className="flex-1 flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Cerrar"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm flex-shrink-0">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 overflow-y-auto px-4 py-4 min-h-0">
          {businesses.map((business) => (
            <div
              key={business.id}
              className={`relative group cursor-pointer transition-all duration-500 ${
                selectedBusiness?.id === business.id
                  ? 'transform scale-[1.02]'
                  : 'hover:scale-[1.02]'
              }`}
              onClick={() => !loading && handleBusinessSelect(business)}
            >
              {/* Tarjeta con logo de fondo - Más grande y estilizada */}
              <div
                className={`relative rounded-3xl overflow-hidden shadow-2xl h-80 border-4 transition-all duration-500 ${
                  selectedBusiness?.id === business.id
                    ? 'border-blue-500 shadow-blue-500/50 shadow-2xl ring-4 ring-blue-200'
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-xl'
                }`}
                style={{
                  backgroundImage: business.logo_url ? `url(${business.logo_url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {/* Overlay mejorado con gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40 group-hover:from-black/95 group-hover:via-black/70 group-hover:to-black/50 transition-all duration-500"></div>
                
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000"></div>
                
                {/* Contenido de la tarjeta mejorado */}
                <div className="relative h-full flex flex-col justify-between p-8 text-white">
                  {/* Top section con icono de tipo */}
                  <div className="flex justify-between items-start">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                      <p className="text-sm font-semibold uppercase tracking-wider">
                        {business.business_type.icon || '🏢'} {business.business_type.name}
                      </p>
                    </div>
                    
                    {/* Indicador de selección mejorado */}
                    {selectedBusiness?.id === business.id && (
                      <div className="bg-blue-500 rounded-full p-3 shadow-lg animate-pulse">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Bottom section con información */}
                  <div className="space-y-3">
                    <h3 className="text-3xl font-extrabold mb-3 drop-shadow-2xl leading-tight">
                      {business.name}
                    </h3>
                    {business.address && (
                      <div className="flex items-center text-base text-gray-200 drop-shadow-lg">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{business.address}</span>
                      </div>
                    )}
                    
                    {/* Badge de estado */}
                    {business.is_active ? (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/80 backdrop-blur-sm text-white">
                        <span className="w-2 h-2 mr-2 bg-white rounded-full animate-pulse"></span>
                        Activo
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-500/80 backdrop-blur-sm text-white">
                        Inactivo
                      </div>
                    )}
                  </div>
                </div>

                {/* Loading overlay mejorado */}
                {loading && selectedBusiness?.id === business.id && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-3"></div>
                    <p className="text-white font-medium">Conectando...</p>
                  </div>
                )}

                {/* Borde animado en selección */}
                {selectedBusiness?.id === business.id && (
                  <div className="absolute inset-0 rounded-3xl border-4 border-blue-500 animate-pulse"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {showSuperAdminButton && (
          <div className="flex justify-center pt-6 border-t border-gray-200">
            <button
              onClick={handleSuperAdminAccess}
              disabled={loading}
              className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="relative z-10 flex items-center space-x-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Acceso Super Admin</span>
                  </>
                )}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
