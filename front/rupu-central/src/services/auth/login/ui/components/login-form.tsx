/**
 * Componente: Formulario de Login
 * Permite al usuario iniciar sesión en el sistema
 */

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { TokenStorage } from '@shared/config';
import { loginAction, generateBusinessTokenAction } from '../../infrastructure/actions';
import { BusinessSelector } from '../../../businesses/ui';

interface LoginFormProps {
  onLogin?: (result: any) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBusinessSelector, setShowBusinessSelector] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await loginAction({
        email: email.trim(),
        password,
      });

      if (result.success && result.data) {
        const sessionToken = result.data.token;
        const isSuperAdmin = result.data.is_super_admin || false;

        // Guardar token de sesión
        TokenStorage.setSessionToken(sessionToken);

        // Guardar datos del usuario
        TokenStorage.setUser({
          id: result.data.userId,
          name: result.data.name,
          email: result.data.email,
          role: result.data.role,
          avatarUrl: result.data.avatarUrl,
          is_super_admin: isSuperAdmin,
          scope: result.data.scope,
        });

        // Guardar datos de negocios si existen
        if (result.data.businesses && result.data.businesses.length > 0) {
          TokenStorage.setBusinessesData(result.data.businesses);
        }

        // Obtener business token automáticamente después del login
        if (isSuperAdmin) {
          // Super admin: obtener business token con business_id = 0
          try {
            const businessTokenResult = await generateBusinessTokenAction({
              business_id: 0,
              session_token: sessionToken,
            });

            if (businessTokenResult.success && businessTokenResult.data) {
              TokenStorage.setBusinessToken(businessTokenResult.data.token);
              TokenStorage.setActiveBusiness(0);
              console.log('✅ Business token obtenido para super admin');
            }
          } catch (err) {
            console.error('Error obteniendo business token para super admin:', err);
            // Continuar aunque falle, el layout puede intentar generarlo después
          }
        } else if (result.data.businesses && result.data.businesses.length > 0) {
          // Usuario normal con negocios
          if (result.data.businesses.length === 1) {
            // Solo un negocio: obtener business token automáticamente
            const business = result.data.businesses[0];
            try {
              const businessTokenResult = await generateBusinessTokenAction({
                business_id: business.id,
                session_token: sessionToken,
              });

              if (businessTokenResult.success && businessTokenResult.data) {
                TokenStorage.setBusinessToken(businessTokenResult.data.token);
                TokenStorage.setActiveBusiness(business.id);
                console.log('✅ Business token obtenido para business:', business.id);
              }
            } catch (err) {
              console.error('Error obteniendo business token:', err);
              // Continuar aunque falle
            }
          } else {
            // Múltiples negocios: mostrar selector
            setBusinesses(result.data.businesses);
            setShowBusinessSelector(true);
            setLoading(false);
            return;
          }
        }

        // Llamar callback si existe
        if (onLogin) {
          onLogin(result);
        }

        // Redirigir al home
        router.push('/home');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error inesperado al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSelected = async (businessId?: number) => {
    setShowBusinessSelector(false);
    
    // Si se proporciona un business_id, obtener su business token
    if (businessId !== undefined) {
      const sessionToken = TokenStorage.getSessionToken();
      if (sessionToken) {
        try {
          const businessTokenResult = await generateBusinessTokenAction({
            business_id: businessId,
            session_token: sessionToken,
          });

          if (businessTokenResult.success && businessTokenResult.data) {
            TokenStorage.setBusinessToken(businessTokenResult.data.token);
            TokenStorage.setActiveBusiness(businessId);
            console.log('✅ Business token obtenido para business:', businessId);
          }
        } catch (err) {
          console.error('Error obteniendo business token:', err);
        }
      }
    }
    
    router.push('/home');
  };

  // Si debe mostrar el selector de negocios
  if (showBusinessSelector && businesses.length > 0) {
    const mappedBusinesses = businesses.map(b => ({
      id: b.id,
      name: b.name,
      code: b.code,
      business_type_id: 11, // Default
      business_type: {
        id: 11,
        name: 'Propiedad Horizontal',
        code: 'horizontal_property',
        description: '',
        icon: '🏢',
      },
      timezone: 'America/Bogota',
      address: '',
      description: '',
      logo_url: b.logo_url || '',
      primary_color: b.primary_color || '#1f2937',
      secondary_color: b.secondary_color || '#3b82f6',
      tertiary_color: b.tertiary_color || '#10b981',
      quaternary_color: b.quaternary_color || '#fbbf24',
      navbar_image_url: '',
      custom_domain: '',
      is_active: b.is_active || true,
      enable_delivery: false,
      enable_pickup: false,
      enable_reservations: false,
    }));

    return (
      <BusinessSelector
        businesses={mappedBusinesses}
        isOpen={true}
        onClose={() => handleBusinessSelected()}
        showSuperAdminButton={false}
        skipRedirect={true}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campo de Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Correo Electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="pl-10 w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
            disabled={loading}
          />
        </div>
      </div>

      {/* Campo de Contraseña */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LockClosedIcon className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="pl-10 w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
            disabled={loading}
          />
        </div>
      </div>

      {/* Mensaje de Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-300 rounded-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Botón de Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Iniciando sesión...
          </span>
        ) : (
          'Iniciar Sesión'
        )}
      </Button>
    </form>
  );
}
