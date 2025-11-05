'use client';

import Link from 'next/link';
import { HomeIcon, ChevronRightIcon, CubeTransparentIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ResourcesTable, useAuthSimple as useAuth } from '@modules/auth/ui';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IAMResourcesPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }
  return (
    <div className="p-8 w-full">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CubeTransparentIcon className="w-8 h-8 mr-2" />
              Gestión de Recursos
            </h1>
            <p className="mt-2 text-gray-600">
              Administra los recursos del sistema a los que se aplican los permisos.
            </p>
          </div>
          <Link href="/iam/resources/create" className="btn btn-primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Crear Recurso
          </Link>
        </div>

        {/* Resources Table */}
        <ResourcesTable token={token || ''} />
      </div>
    </div>
  );
}