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
}

export function BusinessSelector({ businesses, isOpen, onClose }: BusinessSelectorProps) {
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

        // Redirigir según el tipo de negocio
        redirectByBusinessType(business);
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
        router.push('/property-horizontal/dashboard');
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
        router.push('/dashboard');
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
        
        // Redirigir al dashboard principal
        router.push('/dashboard');
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
      title="Seleccionar Negocio"
      size="lg"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Selecciona el negocio al que quieres acceder:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {businesses.map((business) => (
            <div
              key={business.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedBusiness?.id === business.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleBusinessSelect(business)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {business.logo_url ? (
                    <img
                      src={business.logo_url}
                      alt={business.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <span className="text-2xl">{business.business_type.icon}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {business.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {business.business_type.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {business.address}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSuperAdminAccess}
            variant="outline"
            loading={loading}
            disabled={loading}
          >
            Acceso Super Admin
          </Button>
        </div>
      </div>
    </Modal>
  );
}
