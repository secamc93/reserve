/**
 * Página principal (Home)
 */

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Rupu Central
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema de gestión de propiedades horizontales
          </p>
          <p className="text-lg text-gray-500">
            Arquitectura modular con Domain-Driven Design
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card Auth */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-3xl">🔐</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Módulo Auth
            </h2>
            <p className="text-gray-600 mb-6">
              Gestión de usuarios, roles y permisos
            </p>
            <div className="space-y-2">
              <Link 
                href="/login" 
                className="block text-blue-600 hover:text-blue-700 font-medium"
              >
                → Login
              </Link>
              <Link 
                href="/roles" 
                className="block text-blue-600 hover:text-blue-700 font-medium"
              >
                → Gestión de Roles
              </Link>
              <Link 
                href="/permissions" 
                className="block text-blue-600 hover:text-blue-700 font-medium"
              >
                → Gestión de Permisos
              </Link>
            </div>
          </div>

          {/* Card Property Horizontal */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-3xl">🏢</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Módulo Property Horizontal
            </h2>
            <p className="text-gray-600 mb-6">
              Gestión de unidades, expensas y reportes
            </p>
            <div className="space-y-2">
              <Link 
                href="/dashboard" 
                className="block text-green-600 hover:text-green-700 font-medium"
              >
                → Dashboard
              </Link>
              <Link 
                href="/units" 
                className="block text-green-600 hover:text-green-700 font-medium"
              >
                → Unidades
              </Link>
              <Link 
                href="/fees" 
                className="block text-green-600 hover:text-green-700 font-medium"
              >
                → Expensas
              </Link>
            </div>
          </div>
        </div>

        {/* Arquitectura Info */}
        <div className="mt-16 max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            📐 Arquitectura Modular
          </h3>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong className="text-gray-900">✅ Separación por módulos:</strong> Cada módulo es autónomo y reutilizable
            </p>
            <p>
              <strong className="text-gray-900">✅ Domain-Driven Design:</strong> Capas bien definidas (domain, application, infrastructure)
            </p>
            <p>
              <strong className="text-gray-900">✅ Server Actions encapsuladas:</strong> Cada módulo tiene su carpeta actions/
            </p>
            <p>
              <strong className="text-gray-900">✅ RBAC centralizado:</strong> Control de permisos desde config/rbac.ts
            </p>
            <p>
              <strong className="text-gray-900">✅ App Router delgado:</strong> Solo orquesta UI y rutas
            </p>
          </div>
        </div>

        {/* API Info */}
        <div className="mt-8 max-w-4xl mx-auto bg-indigo-50 rounded-xl p-6 border border-indigo-200">
          <h4 className="font-bold text-indigo-900 mb-2">🌐 Endpoints API disponibles:</h4>
          <ul className="space-y-1 text-indigo-800 font-mono text-sm">
            <li>POST /api/auth/login</li>
            <li>GET /api/property-horizontal/dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
