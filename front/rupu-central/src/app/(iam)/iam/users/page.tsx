'use client';

import { UsersPage, useAuthSimple as useAuth } from '@modules/auth/ui';
import Link from 'next/link';
import { HomeIcon, ChevronRightIcon, UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IAMUsersPage() {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserGroupIcon className="w-8 h-8 mr-2" />
            Gestión de Usuarios
          </h1>
          <p className="mt-2 text-gray-600">
            Administra los usuarios que tienen acceso al sistema.
          </p>
        </div>

        {/* Users Page */}
        <UsersPage />
      </div>
    </div>
  );
}