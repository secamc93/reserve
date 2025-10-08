/**
 * Página de Login
 * Server Component que importa actions y las pasa al Client Component
 */

import { LoginForm } from '@modules/auth';
import { loginAction } from '@modules/auth/infrastructure/actions';

export default function LoginPage() {
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
          
          {/* Formulario de login */}
          <div className="animate-fade-in-delay">
            <LoginForm onLogin={loginAction} />
          </div>
        </div>
      </div>
    </div>
  );
}

