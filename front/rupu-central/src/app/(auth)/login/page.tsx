/**
 * Página de Login
 * Server Component que importa actions y las pasa al Client Component
 */

'use client';

import { LoginForm } from '@modules/auth';
import { loginAction } from '@modules/auth/infrastructure/actions';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'no_business') {
      setErrorMessage('Usuario no tiene negocio asignado. Contacte al administrador.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Efectos de fondo animados - Mismo que la home */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Partículas decorativas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-sky-400 rounded-full animate-float-delay-1"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-float-delay-2"></div>
        <div className="absolute top-1/2 right-20 w-1 h-1 bg-cyan-300 rounded-full animate-float-delay-3"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header con título animado */}
          <div className="text-center mb-8 space-y-4 animate-fade-in">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent animate-gradient">
              Rupu
            </h1>
            <div className="h-0.5 w-24 mx-auto bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
            <p className="text-gray-300 text-sm">Sistema de gestión inteligente</p>
          </div>
          
          {/* Mensaje de error global si viene de redirección */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-300 rounded-lg backdrop-blur-sm animate-fade-in">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Formulario de login */}
          <div className="animate-fade-in-delay">
            <LoginForm onLogin={loginAction} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

