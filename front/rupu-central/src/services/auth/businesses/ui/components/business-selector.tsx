/**
 * Componente: Selector de Negocios
 * Permite al usuario seleccionar a qué negocio quiere acceder después del login
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal } from '@shared/ui';
import { TokenStorage, BusinessData } from '@shared/config';
import { generateBusinessTokenAction } from '../../../login/infrastructure/actions';

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

  const handleClose = () => {
    // Limpiar la sesión y redirigir al login
    TokenStorage.clearSession();
    router.push('/login');
  };

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
      const result = await generateBusinessTokenAction({
        business_id: business.id,
        session_token: sessionToken,
      });

      if (result.success && result.data) {
        // Guardar business token
        TokenStorage.setBusinessToken(result.data.token);

        // Limpiar permisos anteriores para forzar recarga con nuevo business
        TokenStorage.removeUserPermissions();

        // Guardar datos del negocio seleccionado
        TokenStorage.setActiveBusiness(business.id);
        TokenStorage.setBusinessesData([{
          id: business.id,
          name: business.name,
          code: business.code,
          primary_color: business.primary_color,
          secondary_color: business.secondary_color,
          tertiary_color: business.tertiary_color,
          quaternary_color: business.quaternary_color,
          business_type_id: business.business_type_id,
          logo_url: business.logo_url,
          is_active: business.is_active,
        } as BusinessData]);

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
      const result = await generateBusinessTokenAction(
        { business_id: 0, session_token: sessionToken }
      );

      if (result.success && result.data) {
        TokenStorage.setBusinessToken(result.data.token);
        TokenStorage.removeUserPermissions(); // Limpiar permisos anteriores
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
      onClose={handleClose}
      title=""
      size="full"
    >
      <div className="h-full w-full flex flex-col space-y-6 px-8 py-6">
        {/* Header mejorado con botón de cerrar personalizado */}
        <div className="flex items-center justify-between pb-4 border-b border-white/20 flex-shrink-0">
          <div className="flex-1"></div>
          <div className="flex-1 text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">
              Selecciona tu Negocio
            </h2>
            <p className="text-white/70 text-base">
              Elige el negocio al que deseas acceder
            </p>
          </div>
          <div className="flex-1 flex justify-end">
            <button
              onClick={handleClose}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              aria-label="Cerrar"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border-l-4 border-red-500 rounded-lg p-4 shadow-sm flex-shrink-0 backdrop-blur-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-200">{error}</p>
            </div>
          </div>
        )}

        <div className="flex-1 grid grid-cols-1 gap-4 overflow-y-auto px-4 py-4 min-h-0">
          {(() => {
            const validBusinesses = businesses.filter((business) => {
              // Validación estricta para asegurar que solo se muestren negocios válidos
              if (!business || !business.id) return false;
              if (!business.name || typeof business.name !== 'string' || business.name.trim() === '') return false;
              if (!business.business_type || !business.business_type.name || typeof business.business_type.name !== 'string' || business.business_type.name.trim() === '') return false;
              return true;
            });

            if (validBusinesses.length === 0) {
              return (
                <div className="flex items-center justify-center h-full">
                  <p className="text-white/70 text-lg">No hay negocios disponibles</p>
                </div>
              );
            }

            return validBusinesses.map((business) => (
            <div
              key={business.id}
              className={`relative group cursor-pointer transition-all duration-500 ${selectedBusiness?.id === business.id
                  ? 'transform scale-[1.01]'
                  : 'hover:scale-[1.01]'
                }`}
              onClick={() => !loading && handleBusinessSelect(business)}
            >
              {/* Tarjeta horizontal con logo de fondo */}
              <div
                className={`relative rounded-2xl overflow-hidden h-32 border-2 transition-all duration-500 ${selectedBusiness?.id === business.id
                    ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.6)] ring-2 ring-white/50'
                    : 'border-white/60 hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                  }`}
                style={{
                  backgroundImage: business.logo_url ? `url(${business.logo_url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {/* Overlay mejorado con gradiente */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50 group-hover:from-black/90 group-hover:via-black/75 group-hover:to-black/60 transition-all duration-500"></div>

                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000"></div>

                {/* Contenido de la tarjeta horizontal */}
                <div className="relative h-full flex items-center justify-between px-6 text-white">
                  {/* Left section con información principal */}
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* Badge de tipo - siempre visible si pasó el filtro */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/30 flex-shrink-0">
                      <p className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                        {business.business_type?.icon || '🏢'} {business.business_type?.name || 'Negocio'}
                      </p>
                    </div>

                    {/* Información del negocio */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-1 drop-shadow-lg truncate">
                        {business.name || 'Sin nombre'}
                      </h3>
                      {business.address && business.address.trim() !== '' && (
                        <div className="flex items-center text-sm text-gray-200 drop-shadow-md">
                          <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{business.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right section con estado e indicador */}
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    {/* Badge de estado */}
                    {business.is_active ? (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/80 backdrop-blur-sm text-white">
                        <span className="w-1.5 h-1.5 mr-1.5 bg-white rounded-full animate-pulse"></span>
                        Activo
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/80 backdrop-blur-sm text-white">
                        Inactivo
                      </div>
                    )}

                    {/* Indicador de selección */}
                    {selectedBusiness?.id === business.id && (
                      <div className="bg-blue-500 rounded-full p-2 shadow-lg animate-pulse">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Loading overlay mejorado */}
                {loading && selectedBusiness?.id === business.id && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                      <p className="text-white font-medium text-sm">Conectando...</p>
                    </div>
                  </div>
                )}
              </div>
              </div>
            ));
          })()}
        </div>

        {showSuperAdminButton && (
          <div className="flex justify-center pt-6 border-t border-white/20">
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
