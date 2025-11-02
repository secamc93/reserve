/**
 * Componente de formulario de login
 * Client Component que recibe la action como prop desde un Server Component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks';
import { BusinessSelector } from './business-selector';
import type { LoginActionResult } from '../infrastructure/actions/users/response/login.response';

interface LoginFormProps {
  onLogin: (data: { email: string; password: string }) => Promise<LoginActionResult>;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBusinessSelector, setShowBusinessSelector] = useState(false);
  const [loginBusinesses, setLoginBusinesses] = useState<Array<{
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
  }>>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // Hook para manejar autenticación y guardar token
  const { login } = useAuth(onLogin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login({ email, password });
      
      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión');
      } else if (result.data) {
        // Verificar si debe mostrar el selector de businesses
        const isBusinessUser = result.data.scope === 'business';
        const isSuperAdminUser = result.data.is_super_admin;

        if (isBusinessUser && !isSuperAdminUser && result.data.businesses.length > 0) {
          // Los businesses del resultado tienen datos limitados, pero podemos obtener los completos
          // del localStorage donde se guardaron después del login, o usamos los que tenemos
          // Por ahora, mapeamos los businesses básicos al formato esperado
          // En producción, deberíamos obtener los businesses completos desde el backend
          const mappedBusinesses = result.data.businesses.map(b => ({
            id: b.id,
            name: b.name,
            code: b.code,
            business_type_id: 11, // Default para Propiedad Horizontal
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
            is_active: b.is_active,
            enable_delivery: false,
            enable_pickup: false,
            enable_reservations: false,
          }));

          setLoginBusinesses(mappedBusinesses);
          setIsSuperAdmin(isSuperAdminUser);
          setShowBusinessSelector(true);
        } else {
          // Token, usuario y colores guardados automáticamente por useAuth
          console.log('✅ Login exitoso - Redirigiendo...');
          
          // Redirigir a la página principal
          router.push('/home');
        }
      }
    } catch {
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSelected = () => {
    // El BusinessSelector ya maneja la redirección y el guardado del token
    setShowBusinessSelector(false);
    // No necesitamos redirigir aquí, el selector lo hace
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* Card del formulario con efecto glassmorphism */}
      <div className="bg-gray-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Iniciar Sesión</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4 backdrop-blur-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-cyan-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
              placeholder="tu@email.com"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-cyan-300 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
        </div>
        
        {/* Botón con efectos similares al de la home */}
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full mt-8 inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 ease-out rounded-full overflow-hidden"
        >
          {/* Fondo del botón con gradiente */}
          <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 transition-transform duration-300 group-hover:scale-105 group-disabled:opacity-50"></span>
          
          {/* Efecto de brillo */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 group-hover:animate-shimmer-fast"></span>
          
          {/* Borde brillante */}
          <span className="absolute inset-0 rounded-full border-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-disabled:opacity-0"></span>
          
          {/* Sombra exterior */}
          <span className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 group-disabled:opacity-0"></span>
          
          {/* Texto del botón */}
          <span className="relative flex items-center space-x-2">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <svg 
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </span>
        </button>

        {/* Link de ayuda */}
        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>

      {/* Modal selector de businesses */}
      <BusinessSelector
        businesses={loginBusinesses}
        isOpen={showBusinessSelector}
        onClose={() => setShowBusinessSelector(false)}
        showSuperAdminButton={isSuperAdmin}
      />
    </form>
  );
}

