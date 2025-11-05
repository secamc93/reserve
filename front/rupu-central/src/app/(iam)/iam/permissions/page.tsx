'use client';

import Link from 'next/link';
import { HomeIcon, ChevronRightIcon, KeyIcon, PlusIcon } from '@heroicons/react/24/outline';
import { PermissionsTable, useAuthSimple as useAuth } from '@modules/auth/ui';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IAMPermissionsPage() {
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
              <KeyIcon className="w-8 h-8 mr-2" />
              Gestión de Permisos
            </h1>
            <p className="mt-2 text-gray-600">
              Administra los permisos detallados para cada acción en el sistema.
            </p>
          </div>
          <Link href="/iam/permissions/create" className="btn btn-primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Crear Permiso
          </Link>
        </div>

        {/* Permissions Table */}
        <PermissionsTable token={token || ''} />
      </div>
    </div>
  );
}