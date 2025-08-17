'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">⚡ Rupü Dashboard</h1>
          <p className="text-lg text-gray-600">Sistema de Gestión de Reservas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Login Card */}
          <Link href="/auth/login" className="group">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-blue-500">
              <div className="text-3xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                Autenticación
              </h3>
              <p className="text-gray-600">
                Accede al sistema con tu cuenta de usuario
              </p>
            </div>
          </Link>

          {/* Calendar Card */}
          <Link href="/calendar" className="group">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-green-500">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                Calendario
              </h3>
              <p className="text-gray-600">
                Gestiona reservas de forma visual por fechas
              </p>
            </div>
          </Link>

          {/* Coming Soon Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-gray-400 opacity-75">
            <div className="text-3xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Próximamente
            </h3>
            <p className="text-gray-600">
              Más funcionalidades en desarrollo
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🏗️ Arquitectura Hexagonal</h2>
            <p className="text-gray-600 mb-4">
              Este proyecto está construido siguiendo los principios de la arquitectura hexagonal (Ports & Adapters)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">🎯 Dominio</h4>
                <p className="text-blue-700">Entidades y lógica de negocio</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">📋 Aplicación</h4>
                <p className="text-green-700">Casos de uso y servicios</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">🔌 Infraestructura</h4>
                <p className="text-purple-700">Adaptadores y APIs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 