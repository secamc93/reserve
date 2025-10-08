/**
 * Página principal (Home)
 */

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          {/* Logo/Título con animación */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent animate-gradient">
              Rupu
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-shimmer"></div>
          </div>

          {/* Mensaje de bienvenida */}
          <div className="space-y-3 animate-fade-in-delay">
            <h2 className="text-3xl md:text-4xl font-light text-gray-100">
              Bienvenido a Rupu
            </h2>
            <p className="text-lg text-gray-400 max-w-md mx-auto">
              Sistema de gestión inteligente para propiedades horizontales
            </p>
          </div>

          {/* Botón de Login con efectos */}
          <div className="pt-8 animate-fade-in-delay-2">
            <Link 
              href="/login"
              className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-white transition-all duration-300 ease-out rounded-full overflow-hidden"
            >
              {/* Fondo del botón con gradiente */}
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 transition-transform duration-300 group-hover:scale-110"></span>
              
              {/* Efecto de brillo */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 group-hover:animate-shimmer-fast"></span>
              
              {/* Borde brillante */}
              <span className="absolute inset-0 rounded-full border-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:animate-pulse-border"></span>
              
              {/* Sombra exterior */}
              <span className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300"></span>
              
              {/* Texto del botón */}
              <span className="relative flex items-center space-x-2">
                <span>Iniciar Sesión</span>
                <svg 
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Indicador decorativo */}
          <div className="pt-16 animate-bounce-slow">
            <div className="inline-flex flex-col items-center space-y-2 text-gray-500">
              <span className="text-xs uppercase tracking-wider">Sistema Seguro</span>
              <div className="w-px h-12 bg-gradient-to-b from-cyan-500/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Partículas decorativas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-sky-400 rounded-full animate-float-delay-1"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-float-delay-2"></div>
        <div className="absolute top-1/2 right-20 w-1 h-1 bg-cyan-300 rounded-full animate-float-delay-3"></div>
      </div>
    </div>
  );
}
