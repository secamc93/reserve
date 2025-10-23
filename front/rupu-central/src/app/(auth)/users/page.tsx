'use client';

import { UsersTable } from '@modules/auth/ui';
import { useAuthSimple as useAuth } from '@modules/auth/ui';

export default function UsersPage() {
  const { token, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso No Autorizado
          </h1>
          <p className="text-gray-600 mb-4">
            Necesitas iniciar sesión para acceder a esta página.
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ir al Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Usuarios
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Administra y filtra los usuarios del sistema con herramientas avanzadas de búsqueda.
            </p>
          </div>

          <UsersTable token={token} />
        </div>
      </div>
    </div>
  );
}
