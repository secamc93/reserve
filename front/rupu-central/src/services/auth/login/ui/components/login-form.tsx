/**
 * Componente: Formulario de Login
 * Permite al usuario iniciar sesión en el sistema
 */

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { RupuLoader } from '@shared/ui/rupu-loader';
import { TokenStorage } from '@shared/config';
import { loginAction, generateBusinessTokenAction } from '../../infrastructure/actions';
import { HORIZONTAL_PROPERTY_TYPE, loginDestination, toPropertyOptions } from '@/shared/utils/properties';

interface LoginFormProps {
  onLogin?: (result: any) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        // Llamar callback si existe
        if (onLogin) {
          onLogin(result);
        }

        // Solo propiedad horizontal: con una propiedad se entra directo; con varias (o super admin,
        // que ve todas) se elige en /properties. No hay selector de módulo.
        const properties = toPropertyOptions(result.data.businesses);
        const destination = loginDestination({ isSuperAdmin, propertyIds: properties.map((p) => p.id) });
        TokenStorage.setActiveBusinessType(HORIZONTAL_PROPERTY_TYPE);
        TokenStorage.setActiveBusinessTypeName('Propiedad Horizontal');
        // Super admin y selector: token con business_id=0 (el super admin manda ?business_id).
        const tokenBusinessId = destination.kind === 'property' ? destination.id : 0;
        if (destination.kind !== 'none' && (isSuperAdmin || destination.kind === 'property')) {
          try {
            const businessTokenResult = await generateBusinessTokenAction({
              business_id: tokenBusinessId,
              session_token: sessionToken,
            });
            if (businessTokenResult.success && businessTokenResult.data) {
              TokenStorage.setBusinessToken(businessTokenResult.data.token);
              TokenStorage.setActiveBusiness(tokenBusinessId);
            }
          } catch (err) {
            console.error('Error obteniendo business token:', err);
          }
        }
        if (destination.kind === 'picker' && !isSuperAdmin) {
          // Varias propiedades: ninguna activa hasta que elija una en el selector.
          TokenStorage.setActiveBusiness(0);
        }
        if (destination.kind === 'property') {
          const property = properties[0];
          TokenStorage.setBusinessColors({
            primary: property.primaryColor || '#0f172a',
            secondary: property.secondaryColor || '#be185d',
            tertiary: property.tertiaryColor || '#06b6d4',
            quaternary: property.quaternaryColor || '#f59e0b',
          });
        }
        router.push(destination.href);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campo de Email */}
      <div className="group">
        <label 
          htmlFor="email" 
          className="block text-sm font-medium text-gray-300 mb-2 transition-all duration-300 group-focus-within:text-cyan-400"
        >
          Correo Electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-cyan-400">
            <EnvelopeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
          </div>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="pl-10 w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 
                     focus:bg-gray-800/70 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 
                     transition-all duration-300 ease-in-out
                     hover:border-gray-600 hover:bg-gray-800/60
                     disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          />
          {/* Efecto de brillo en el borde al hacer focus */}
          <div className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/20 via-transparent to-blue-400/20 blur-sm"></div>
          </div>
        </div>
      </div>

      {/* Campo de Contraseña */}
      <div className="group">
        <label 
          htmlFor="password" 
          className="block text-sm font-medium text-gray-300 mb-2 transition-all duration-300 group-focus-within:text-cyan-400"
        >
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-cyan-400">
            <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="pl-10 pr-10 w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 
                     focus:bg-gray-800/70 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 
                     transition-all duration-300 ease-in-out
                     hover:border-gray-600 hover:bg-gray-800/60
                     disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          />
          {/* Icono de mostrar/ocultar contraseña */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors duration-300"
            disabled={loading}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
          {/* Efecto de brillo en el borde al hacer focus */}
          <div className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/20 via-transparent to-blue-400/20 blur-sm"></div>
          </div>
        </div>
      </div>

      {/* Mensaje de Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-300 rounded-lg backdrop-blur-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Botón de Submit con efecto hover moderno */}
      {loading ? (
        <div className="w-full flex flex-col items-center justify-center py-8 min-h-[200px] relative z-10">
          <div className="relative">
            <RupuLoader size={96} />
          </div>
          <p className="mt-4 text-gray-300 font-medium animate-pulse">Iniciando sesión...</p>
        </div>
      ) : (
        <Button
          type="submit"
          disabled={loading}
          className="group/btn relative w-full overflow-hidden
                     bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 
                     hover:from-cyan-400 hover:via-blue-400 hover:to-cyan-400
                     text-white font-semibold py-3 px-4 rounded-lg 
                     transition-all duration-500 ease-in-out
                     shadow-lg hover:shadow-2xl hover:shadow-cyan-500/50
                     transform hover:scale-[1.02] hover:-translate-y-0.5
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0
                     before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
                     before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
        >
          {/* Efecto de brillo animado */}
          <span className="relative z-10 flex items-center justify-center">
            Iniciar Sesión
            <svg 
              className="ml-2 h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </Button>
      )}
    </form>
  );
}
